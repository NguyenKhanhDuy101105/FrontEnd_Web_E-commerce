"use client";

import { useEffect, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";

export interface UserNotificationRealtimeEvent {
  id?: string;
  title?: string;
  content?: string;
  message?: string;
  type?: string;
  referenceId?: string;
  createdAt?: string;
}

type NotificationListener = (payload: UserNotificationRealtimeEvent) => void;

let sharedClient: Client | null = null;
let sharedToken: string | null = null;
const listeners = new Set<NotificationListener>();
const shownNotificationKeys = new Map<string, number>();

const SEEN_IDS_STORAGE_KEY = "seen_realtime_notification_ids";
const INITIAL_CONNECT_IGNORE_MS = 4000;
const CONTENT_DEDUPE_WINDOW_MS = 10000;

const parseServerTimestamp = (createdAt?: string): number | null => {
  if (!createdAt) return null;
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(createdAt);
  const normalized = hasTimezone ? createdAt : `${createdAt}Z`;
  const time = new Date(normalized).getTime();
  return Number.isNaN(time) ? null : time;
};

const shouldBlockNotification = (
  parsed: UserNotificationRealtimeEvent,
  connectedAt: number,
): boolean => {
  const now = Date.now();
  const fullText =
    `${parsed.title || ""} ${parsed.content || ""} ${parsed.message || ""}`.toLowerCase();

  // 1. Chặn thông báo hệ thống "Đã nhận được đơn hàng..." khi vừa tạo đơn (vì Frontend đã hiện toast "Đặt hàng thành công!")
  if (
    fullText.includes("đã nhận được đơn hàng") ||
    fullText.includes("đặt hàng thành công")
  ) {
    return true;
  }

  // 2. Trong 8 giây ngay sau khi bấm Đặt hàng, chặn toàn bộ toast WebSocket phát sinh từ hành động đặt đơn
  if (typeof window !== "undefined") {
    const suppressUntil = Number(
      sessionStorage.getItem("suppress_old_ws_until") || "0",
    );
    if (now < suppressUntil) {
      return true;
    }
  }

  // 3. Nuốt gói tin tồn đọng trong 4 giây đầu khi vừa CONNECT / chuyển trang
  if (now - connectedAt < INITIAL_CONNECT_IGNORE_MS) {
    return true;
  }

  // 4. Bỏ qua thông báo có timestamp cũ hơn 15 giây
  const createdTime = parseServerTimestamp(parsed.createdAt);
  if (createdTime !== null && Math.abs(now - createdTime) > 15000) {
    return true;
  }

  // 5. Chống trùng theo ID lưu trong sessionStorage
  const idKey = parsed.id ? `id:${parsed.id}` : "";
  const contentKey = `content:${parsed.type || ""}_${parsed.referenceId || ""}_${fullText.trim()}`;

  if (typeof window !== "undefined" && idKey) {
    try {
      const saved: string[] = JSON.parse(
        sessionStorage.getItem(SEEN_IDS_STORAGE_KEY) || "[]",
      );
      if (saved.includes(idKey)) return true;
      sessionStorage.setItem(
        SEEN_IDS_STORAGE_KEY,
        JSON.stringify([...saved, idKey].slice(-100)),
      );
    } catch {}
  }

  // 6. Chống trùng nội dung trong vòng 10 giây
  for (const [k, ts] of shownNotificationKeys.entries()) {
    if (now - ts > 30000) shownNotificationKeys.delete(k);
  }

  if (idKey && shownNotificationKeys.has(idKey)) return true;
  const lastContentTs = shownNotificationKeys.get(contentKey);
  if (lastContentTs && now - lastContentTs < CONTENT_DEDUPE_WINDOW_MS) {
    return true;
  }

  if (idKey) shownNotificationKeys.set(idKey, now);
  shownNotificationKeys.set(contentKey, now);
  return false;
};

const ensureSharedClient = (token: string) => {
  if (sharedClient && sharedToken === token) {
    if (!sharedClient.active) {
      sharedClient.activate();
    }
    return;
  }

  if (sharedClient) {
    sharedClient.deactivate();
  }

  sharedToken = token;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const wsUrl = apiBaseUrl.replace(/^http/, "ws") + "/ws";

  const client = new Client({
    brokerURL: wsUrl,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      const connectedAt = Date.now();

      client.subscribe("/user/queue/notifications", (frame: IMessage) => {
        try {
          const parsed: UserNotificationRealtimeEvent = frame.body
            ? JSON.parse(frame.body)
            : {};

          // Vẫn bắn sự kiện để Bell badge & trang Thông báo tự đồng bộ ngầm danh sách
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("notifications-updated", { detail: parsed }),
            );
          }

          if (shouldBlockNotification(parsed, connectedAt)) {
            return;
          }

          // Chỉ gọi đúng 1 listener đầu tiên để hiện Toast 1 lần duy nhất (tránh Header Desktop + Mobile cùng bắn)
          const firstListener = listeners.values().next().value;
          if (firstListener) {
            firstListener(parsed);
          }
        } catch (err) {
          console.error("Lỗi parse notification WebSocket:", err);
        }
      });
    },
    onStompError: (frame) => {
      console.error(
        "User Notification STOMP Error:",
        frame.headers["message"],
        frame.body,
      );
    },
  });

  sharedClient = client;
  client.activate();
};

interface UseUserNotificationWebSocketOptions {
  enabled?: boolean;
  onNotification: NotificationListener;
}

export function useUserNotificationWebSocket({
  enabled = true,
  onNotification,
}: UseUserNotificationWebSocketOptions) {
  const callbackRef = useRef<NotificationListener>(onNotification);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return;

    const handler: NotificationListener = (payload) => {
      callbackRef.current(payload);
    };

    listeners.add(handler);
    ensureSharedClient(token);

    return () => {
      listeners.delete(handler);
      if (listeners.size === 0 && sharedClient) {
        sharedClient.deactivate();
        sharedClient = null;
        sharedToken = null;
      }
    };
  }, [enabled]);
}
