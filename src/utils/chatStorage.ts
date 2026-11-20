import { Message } from "@/src/types/chat";

const CHAT_PREFIX = "urbanmart_chat_";
const MAX_STORED_MESSAGES = 50;

function getCurrentUserSuffix(): string {
  if (typeof window === "undefined") return "guest";
  try {
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("userInfo");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) return String(parsed.id);
    }
  } catch {
    // Bỏ qua nếu parse lỗi
  }
  return "default";
}

export const chatStorage = {
  getMessages: (mode: "ai" | "staff", fallback: Message[]): Message[] => {
    if (typeof window === "undefined") return fallback;
    try {
      const key = `${CHAT_PREFIX}${mode}_msgs_${getCurrentUserSuffix()}`;
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch {
      return fallback;
    }
  },

  saveMessages: (mode: "ai" | "staff", messages: Message[]): void => {
    if (typeof window === "undefined") return;
    try {
      const key = `${CHAT_PREFIX}${mode}_msgs_${getCurrentUserSuffix()}`;
      const trimmed = messages.slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (error) {
      console.error("Không thể lưu lịch sử chat vào localStorage:", error);
    }
  },

  getOrCreateSessionId: (mode: "ai" | "staff"): string => {
    if (typeof window === "undefined") return "";
    const key = `${CHAT_PREFIX}${mode}_session_${getCurrentUserSuffix()}`;
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
    if (typeof window === "undefined" || !sessionId) return;
    const key = `${CHAT_PREFIX}${mode}_session_${getCurrentUserSuffix()}`;
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
