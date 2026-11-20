import axiosClient from "@/src/lib/axiosClient";

export interface RecipeIngredientSuggestion {
  productId: string;
  quantity: number;
  isRequired: boolean;
  group: string;
  note: string;
}

export interface RecipeSuggestionItem {
  recipeId: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  reason: string;
  ingredients: RecipeIngredientSuggestion[];
}

export interface RecipeSuggestionsData {
  query: string;
  suggestions: RecipeSuggestionItem[];
}

export interface RecipeSuggestionsRequest {
  query: string;
}

export interface ChatContextPayload {
  currentCartTotal?: number;
  categoryId?: string;
}

export interface SendChatMessageRequest {
  mode?: "AI" | "HUMAN" | string;
  sessionId?: string;
  message: string;
  branchId?: string;
  context?: ChatContextPayload;
  attachments?: Record<string, unknown>[];
}

export interface ChatSuggestedProduct {
  id: string;
  sku: string;
  name: string;
  basePrice: number;
  displayPrice: number;
  imageUrl: string;
  unit: string;
  availableQuantity: number;
  inStock: boolean;
}

export interface ChatSuggestedVoucher {
  id: string;
  code: string;
  title: string;
  discountType: "PERCENT" | "FIXED" | string;
  discountValue: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  endDate: string;
  canApply: boolean;
  amountToMinOrder: number;
  applicableCategoryIds: string[];
}

export interface SendChatMessageData {
  messageId: string;
  sessionId: string;
  mode: "AI" | "HUMAN" | string;
  sender: string;
  senderName: string;
  replyText: string;
  type: string;
  suggestedProducts: ChatSuggestedProduct[];
  suggestedVouchers: ChatSuggestedVoucher[];
  quickReplies: string[];
  timestamp: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const aiService = {
  testAi: async (q: string): Promise<string> => {
    const response = await axiosClient.get<string>("/api/test-ai", {
      params: { q },
    });
    return response.data;
  },

  suggestRecipes: async (
    payload: RecipeSuggestionsRequest,
  ): Promise<ApiResponse<RecipeSuggestionsData>> => {
    const response = await axiosClient.post<ApiResponse<RecipeSuggestionsData>>(
      "/api/v1/ai/recipes/suggestions",
      payload,
    );
    return response.data;
  },

  sendMessage: async (
    payload: SendChatMessageRequest,
  ): Promise<ApiResponse<SendChatMessageData>> => {
    const resolvedSessionId =
      payload.sessionId ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `session_${Date.now()}`);

    const cleanPayload: Record<string, unknown> = {
      mode: payload.mode || "AI",
      sessionId: resolvedSessionId,
      branchId: payload.branchId || "",
      message: payload.message,
    };

    const response = await axiosClient.post<ApiResponse<SendChatMessageData>>(
      "/api/chat/send-message",
      cleanPayload,
    );
    return response.data;
  },
};
