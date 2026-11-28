"use client";

import { useEffect, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";

export interface BranchOrderRealtimeEvent {
  orderId?: string;
  id?: string;
  orderCode?: string;
  status?: string;
  type?: string;
  message?: string;
}

interface UseBranchOrderWebSocketOptions {
  enabled?: boolean;
  onOrderEvent: (payload: BranchOrderRealtimeEvent) => void;
}

export function useBranchOrderWebSocket({
  enabled = true,
  onOrderEvent,
}: UseBranchOrderWebSocketOptions) {
  const callbackRef = useRef(onOrderEvent);

  useEffect(() => {
    callbackRef.current = onOrderEvent;
  }, [onOrderEvent]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return;

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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
        client.subscribe("/user/queue/branch-orders", (frame: IMessage) => {
          try {
            const parsed: BranchOrderRealtimeEvent = frame.body
              ? JSON.parse(frame.body)
              : {};
            callbackRef.current(parsed);
          } catch {
            callbackRef.current({});
          }
        });
      },
      onStompError: (frame) => {
        console.error(
          "STOMP WebSocket Error:",
          frame.headers["message"],
          frame.body,
        );
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [enabled]);
}
