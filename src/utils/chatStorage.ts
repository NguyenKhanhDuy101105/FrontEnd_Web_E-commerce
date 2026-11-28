import { Message } from "@/src/types/chat";

const CHAT_PREFIX = "urbanmart_chat_";
const MAX_STORED_MESSAGES = 50;

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("userInfo");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) return String(parsed.id);
    }
  } catch {}
  return null;
}

export const chatStorage = {
  getMessages: (mode: "ai" | "staff", fallback: Message[]): Message[] => {
    const userId = getCurrentUserId();
    if (!userId) return fallback;
    try {
      const key = `${CHAT_PREFIX}${mode}_msgs_${userId}`;
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch {
      return fallback;
    }
  },

  saveMessages: (mode: "ai" | "staff", messages: Message[]): void => {
    const userId = getCurrentUserId();
    if (!userId) return;
    try {
      const key = `${CHAT_PREFIX}${mode}_msgs_${userId}`;
      const trimmed = messages.slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (error) {
      console.error("Không thể lưu lịch sử chat vào localStorage:", error);
    }
  },

  getOrCreateSessionId: (mode: "ai" | "staff"): string => {
    const userId = getCurrentUserId();
    if (!userId) return "";
    const key = `${CHAT_PREFIX}${mode}_session_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) return saved;

    const newId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${mode}_${Date.now()}`;
    localStorage.setItem(key, newId);
    return newId;
  },

  saveSessionId: (mode: "ai" | "staff", sessionId: string): void => {
    const userId = getCurrentUserId();
    if (!userId || !sessionId) return;
    const key = `${CHAT_PREFIX}${mode}_session_${userId}`;
    localStorage.setItem(key, sessionId);
  },

  clearAllChatData: (): void => {
    if (typeof window === "undefined") return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CHAT_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  },
};
