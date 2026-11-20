"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ShoppingCartIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import {
  aiService,
  ChatSuggestedProduct,
  ChatSuggestedVoucher,
} from "@/src/services/customer/aiService";
import { cartService } from "@/src/services/customer/cartService";
import { useBranch } from "@/src/context/BranchContext";
import { useCart } from "@/src/context/CartContext";
import { showToast } from "@/src/utils/toast";
import { chatStorage } from "@/src/utils/chatStorage";
import { Message } from "@/src/types/chat";
import ChatHeader from "../chat/ChatHeader";
import FormattedMessageContent from "../chat/FormattedMessageContent";
import RecipeSuggestionCards from "../chat/RecipeSuggestionCards";
import ChatInputArea from "../chat/ChatInputArea";

const QUICK_PROMPTS = [
  "Cho tôi nguyên liệu làm món bò kho",
  "Gợi ý món ngon cuối tuần với thịt bò",
  "Món canh thanh mát giải nhiệt",
  "Sản phẩm nào đang giảm giá hôm nay?",
];

const INITIAL_AI_MESSAGES: Message[] = [
  {
    id: "ai-init-1",
    sender: "bot",
    text: "Xin chào! Trợ lý AI UrbanMart có thể gợi ý món ăn, nguyên liệu hoặc tìm sản phẩm & ưu đãi giúp bạn hôm nay?",
    timestamp: "10:00",
  },
];

const INITIAL_STAFF_MESSAGES: Message[] = [
  {
    id: "staff-init-1",
    sender: "system",
    text: "Bạn đã kết nối với nhân viên tư vấn UrbanMart.",
    timestamp: "10:01",
  },
  {
    id: "staff-init-2",
    sender: "staff",
    text: "Chào bạn! Nhân viên tư vấn có thể hỗ trợ kiểm tra đơn hàng hoặc sản phẩm giúp bạn ạ!",
    timestamp: "10:01",
  },
];

const RECIPE_KEYWORDS = [
  "công thức",
  "nguyên liệu",
  "nấu món",
  "làm món",
  "món ăn",
  "món ngon",
  "bữa tối",
  "bữa trưa",
  "bữa sáng",
  "thực đơn",
  "cách nấu",
  "cách làm",
  "món canh",
  "bò kho",
  "kho tiêu",
  "xào",
  "nướng",
  "lẩu",
];

const PRODUCT_OR_SHOPPING_KEYWORDS = [
  "giá bao nhiêu",
  "bao nhiêu tiền",
  "khuyến mãi",
  "voucher",
  "mã giảm giá",
  "giảm giá",
  "còn hàng",
  "tồn kho",
  "giao hàng",
  "phí ship",
  "đơn hàng",
];

function isRecipeQuery(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  const hasShoppingIntent = PRODUCT_OR_SHOPPING_KEYWORDS.some((kw) =>
    normalized.includes(kw),
  );
  if (hasShoppingIntent) return false;

  return RECIPE_KEYWORDS.some((kw) => normalized.includes(kw));
}

export default function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { branchId } = useBranch();
  const { refreshCart } = useCart();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatMode, setChatMode] = useState<"ai" | "staff">("ai");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const [aiSessionId, setAiSessionId] = useState<string>(() =>
    chatStorage.getOrCreateSessionId("ai"),
  );
  const [staffSessionId, setStaffSessionId] = useState<string>(() =>
    chatStorage.getOrCreateSessionId("staff"),
  );

  const [aiMessages, setAiMessages] = useState<Message[]>(() =>
    chatStorage.getMessages("ai", INITIAL_AI_MESSAGES),
  );
  const [staffMessages, setStaffMessages] = useState<Message[]>(() =>
    chatStorage.getMessages("staff", INITIAL_STAFF_MESSAGES),
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCounterRef = useRef<number>(100);

  // Tự động lưu tin nhắn AI mỗi khi có tin nhắn mới
  useEffect(() => {
    chatStorage.saveMessages("ai", aiMessages);
  }, [aiMessages]);

  // Tự động lưu tin nhắn nhân viên mỗi khi có tin nhắn mới
  useEffect(() => {
    chatStorage.saveMessages("staff", staffMessages);
  }, [staffMessages]);

  const generateMessageId = (prefix: string) => {
    msgCounterRef.current += 1;
    return `${prefix}-${msgCounterRef.current}`;
  };

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const checkAuth = (): boolean => {
    if (typeof window === "undefined") return false;
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      showToast.error("Vui lòng đăng nhập để sử dụng tính năng hỗ trợ chat!");
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }
    return true;
  };

  const handleToggleWidget = () => {
    if (!isOpen && !checkAuth()) return;
    setIsOpen((prev) => !prev);
  };

  const handleSwitchMode = (mode: "ai" | "staff") => {
    if (!checkAuth()) return;
    setChatMode(mode);
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, chatMode, aiMessages, staffMessages, isAiLoading]);

  const sendToAi = async (
    promptText: string,
    forceIntent?: "RECIPE" | "CHAT",
  ) => {
    if (!promptText.trim() || isAiLoading) return;
    if (!checkAuth()) return;

    const cleanQuery = promptText.trim();
    const userMsg: Message = {
      id: generateMessageId("ai-user"),
      sender: "user",
      text: cleanQuery,
      timestamp: getCurrentTime(),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsAiLoading(true);

    const shouldCallRecipeApi =
      forceIntent === "RECIPE" ||
      (forceIntent !== "CHAT" && isRecipeQuery(cleanQuery));

    try {
      if (shouldCallRecipeApi) {
        const response = await aiService.suggestRecipes({ query: cleanQuery });
        const suggestions = response?.data?.suggestions ?? [];

        const summaryText =
          suggestions.length > 0
            ? `Mình tìm thấy **${suggestions.length} gợi ý món ăn** phù hợp cho yêu cầu "${response?.data?.query || cleanQuery}":`
            : response?.message ||
              "Xin lỗi, hiện tại mình chưa tìm thấy công thức món ăn nào phù hợp với yêu cầu của bạn.";

        setAiMessages((prev) => [
          ...prev,
          {
            id: generateMessageId("ai-bot"),
            sender: "bot",
            text: summaryText,
            timestamp: getCurrentTime(),
            suggestions,
          },
        ]);
      } else {
        const activeSessionId =
          aiSessionId || chatStorage.getOrCreateSessionId("ai");

        const response = await aiService.sendMessage({
          mode: "AI",
          sessionId: activeSessionId,
          branchId: branchId || "",
          message: cleanQuery,
        });

        const chatData = response?.data;
        if (chatData?.sessionId && chatData.sessionId !== activeSessionId) {
          setAiSessionId(chatData.sessionId);
          chatStorage.saveSessionId("ai", chatData.sessionId);
        }

        setAiMessages((prev) => [
          ...prev,
          {
            id: chatData?.messageId || generateMessageId("ai-bot"),
            sender: "bot",
            text:
              chatData?.replyText ||
              response?.message ||
              "Mình đã nhận được câu hỏi của bạn!",
            timestamp: getCurrentTime(),
            suggestedProducts: chatData?.suggestedProducts || [],
            suggestedVouchers: chatData?.suggestedVouchers || [],
            quickReplies: chatData?.quickReplies || [],
          },
        ]);
      }
    } catch (error) {
      console.error("Lỗi gọi AI:", error);
      setAiMessages((prev) => [
        ...prev,
        {
          id: generateMessageId("ai-err"),
          sender: "bot",
          text: "Hệ thống AI đang bận hoặc mất kết nối. Bạn vui lòng thử lại sau giây lát nhé!",
          timestamp: getCurrentTime(),
          isError: true,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !checkAuth()) return;

    if (chatMode === "ai") {
      await sendToAi(inputMessage);
    } else {
      const cleanMessage = inputMessage.trim();
      setStaffMessages((prev) => [
        ...prev,
        {
          id: generateMessageId("staff-user"),
          sender: "user",
          text: cleanMessage,
          timestamp: getCurrentTime(),
        },
      ]);
      setInputMessage("");

      try {
        const activeStaffSession =
          staffSessionId || chatStorage.getOrCreateSessionId("staff");

        const response = await aiService.sendMessage({
          mode: "HUMAN",
          sessionId: activeStaffSession,
          branchId: branchId || "",
          message: cleanMessage,
        });

        if (
          response?.data?.sessionId &&
          response.data.sessionId !== activeStaffSession
        ) {
          setStaffSessionId(response.data.sessionId);
          chatStorage.saveSessionId("staff", response.data.sessionId);
        }
      } catch (error) {
        console.error("Lỗi gửi tin nhắn cho nhân viên:", error);
      }
    }
  };

  const handleQuickPrompt = async (promptText: string) => {
    if (!checkAuth()) return;
    await sendToAi(promptText);
  };

  const handleQuickAddProduct = async (product: ChatSuggestedProduct) => {
    if (!product.inStock) {
      showToast.error("Sản phẩm hiện tạm hết hàng tại chi nhánh này!");
      return;
    }
    if (!branchId) {
      showToast.error("Vui lòng chọn chi nhánh trước khi thêm vào giỏ hàng!");
      return;
    }
    try {
      await cartService.addToCart({
        branchId,
        productId: product.id,
        quantity: 1,
      });
      await refreshCart();
      showToast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    } catch {
      showToast.error("Không thể thêm sản phẩm vào giỏ hàng!");
    }
  };

  const handleCopyVoucher = (voucher: ChatSuggestedVoucher) => {
    navigator.clipboard.writeText(voucher.code);
    showToast.success(`Đã sao chép mã ${voucher.code}!`);
  };

  const currentMessages = chatMode === "ai" ? aiMessages : staffMessages;

  return (
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-120">
        <button
          type="button"
          onClick={handleToggleWidget}
          aria-label="Mở cửa sổ hỗ trợ"
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
        >
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
          )}

          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full" />
          )}

          {isOpen ? (
            <XMarkIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform duration-300 rotate-90" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      <div
        className={`fixed bottom-20 right-3 left-3 sm:left-auto sm:bottom-24 sm:right-6 z-200 sm:w-100 md:w-107.5 h-[75dvh] sm:h-145 max-h-[calc(100dvh-6.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-0 translate-y-8 pointer-events-none"
        }`}
      >
        <ChatHeader
          chatMode={chatMode}
          onSwitchMode={handleSwitchMode}
          onClose={() => setIsOpen(false)}
        />

        <div className="flex-1 min-h-0 p-3.5 sm:p-4 overflow-y-auto overflow-x-hidden bg-slate-50 space-y-3">
          {currentMessages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div
                  key={msg.id}
                  className="text-center my-2 px-3 py-1.5 bg-slate-200/80 rounded-xl text-[11px] font-medium text-slate-600"
                >
                  {msg.text}
                </div>
              );
            }

            const isUser = msg.sender === "user";
            const hasRichCards =
              !isUser &&
              ((msg.suggestions && msg.suggestions.length > 0) ||
                (msg.suggestedProducts && msg.suggestedProducts.length > 0) ||
                (msg.suggestedVouchers && msg.suggestedVouchers.length > 0));

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`${
                    hasRichCards
                      ? "w-full sm:max-w-[94%]"
                      : "max-w-[88%] sm:max-w-[85%]"
                  } p-3 text-xs overflow-hidden space-y-2.5 ${
                    isUser
                      ? "bg-emerald-600 text-white rounded-2xl rounded-tr-xs shadow-xs"
                      : msg.isError
                        ? "bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl rounded-tl-xs shadow-xs"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-xs shadow-xs"
                  }`}
                >
                  <FormattedMessageContent text={msg.text} isUser={isUser} />

                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <RecipeSuggestionCards suggestions={msg.suggestions} />
                  )}

                  {!isUser &&
                    msg.suggestedProducts &&
                    msg.suggestedProducts.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {msg.suggestedProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="flex items-center justify-between gap-2.5 p-2 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:border-emerald-300 transition-colors"
                          >
                            <div
                              onClick={() =>
                                router.push(`/products/${prod.id}`)
                              }
                              className="relative w-12 h-12 rounded-lg bg-white border border-slate-200/70 p-1 shrink-0 overflow-hidden cursor-pointer flex items-center justify-center"
                            >
                              <Image
                                src={prod.imageUrl || "/images/Banner1.jpeg"}
                                alt={prod.name}
                                fill
                                unoptimized
                                className="object-contain rounded p-1"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                onClick={() =>
                                  router.push(`/products/${prod.id}`)
                                }
                                className="font-bold text-slate-800 text-xs line-clamp-1 hover:text-emerald-600 cursor-pointer"
                              >
                                {prod.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="font-black text-emerald-700 text-xs">
                                  {prod.displayPrice.toLocaleString("vi-VN")}đ
                                </span>
                                {prod.basePrice > prod.displayPrice && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    {prod.basePrice.toLocaleString("vi-VN")}đ
                                  </span>
                                )}
                                {prod.unit && (
                                  <span className="text-[10px] text-slate-400">
                                    / {prod.unit}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={!prod.inStock}
                              onClick={() => handleQuickAddProduct(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                            >
                              <ShoppingCartIcon className="w-3.5 h-3.5" />
                              <span>{prod.inStock ? "Thêm" : "Hết"}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  {!isUser &&
                    msg.suggestedVouchers &&
                    msg.suggestedVouchers.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {msg.suggestedVouchers.map((voucher) => (
                          <div
                            key={voucher.id}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50/60"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <TicketIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="font-mono font-bold text-[11px] text-emerald-800 uppercase">
                                  {voucher.code}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-slate-700 line-clamp-1 mt-0.5">
                                {voucher.title}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyVoucher(voucher)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer transition-colors"
                            >
                              Lấy mã
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  {!isUser &&
                    msg.quickReplies &&
                    msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => sendToAi(reply, "CHAT")}
                            className="px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] cursor-pointer transition-colors"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {chatMode === "ai" && isAiLoading && (
            <div className="flex flex-col items-start">
              <div className="bg-white text-slate-600 border border-slate-200/80 rounded-2xl rounded-tl-xs shadow-xs px-3.5 py-2.5 text-xs flex items-center space-x-2">
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                </span>
                <span className="text-[11px] text-slate-500">
                  AI đang xử lý yêu cầu...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <ChatInputArea
          chatMode={chatMode}
          inputMessage={inputMessage}
          isAiLoading={isAiLoading}
          quickPrompts={QUICK_PROMPTS}
          onInputChange={setInputMessage}
          onQuickPrompt={handleQuickPrompt}
          onSubmit={handleSendMessage}
        />
      </div>
    </>
  );
}
