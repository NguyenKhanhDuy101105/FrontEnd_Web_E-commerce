import {
  RecipeSuggestionItem,
  ChatSuggestedProduct,
  ChatSuggestedVoucher,
} from "@/src/services/customer/aiService";

export interface Message {
  id: string;
  sender: "user" | "bot" | "staff" | "system";
  text: string;
  timestamp: string;
  isError?: boolean;
  suggestions?: RecipeSuggestionItem[];
  suggestedProducts?: ChatSuggestedProduct[];
  suggestedVouchers?: ChatSuggestedVoucher[];
  quickReplies?: string[];
}
