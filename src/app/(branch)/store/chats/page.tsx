"use client";

import React, { useState } from "react";
import ConversationList, {
  ChatConversation,
} from "./components/ConversationList";
import ChatWindow, { ChatMessage } from "./components/ChatWindow";
import CustomerInfoSidebar from "./components/CustomerInfoSidebar";

const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: "chat-1",
    customerName: "Nguyễn Văn An",
    lastMessage: "Shop ơi, cá hồi phi lê hôm nay còn tươi không ạ?",
    time: "10:24",
    unreadCount: 2,
    status: "PENDING",
    phone: "0987 654 321",
    address: "Số 15, Ngõ 120 Cầu Giấy, Hà Nội",
    totalOrders: 5,
    recentOrder: {
      code: "UM110AEA09A2",
      status: "Sẵn sàng lấy hàng",
      totalAmount: 250000,
      createdAt: "30/10/2026",
    },
  },
  {
    id: "chat-2",
    customerName: "Trần Thị Mai",
    lastMessage: "Dạ vâng, tí nữa mình ghé lấy hàng nhé.",
    time: "09:15",
    unreadCount: 0,
    status: "PROCESSING",
    phone: "0912 345 678",
    address: "Tòa nhà Keangnam, Nam Từ Liêm, Hà Nội",
    totalOrders: 12,
    recentOrder: {
      code: "UM14ECC8F27A",
      status: "Đang giao hàng",
      totalAmount: 516000,
      createdAt: "29/10/2026",
    },
  },
  {
    id: "chat-3",
    customerName: "Lê Hoàng Long",
    lastMessage: "Đã nhận đủ hàng rồi, cảm ơn shop nha!",
    time: "Hôm qua",
    unreadCount: 0,
    status: "RESOLVED",
    phone: "0933 111 222",
    address: "Số 88 Trần Thái Tông, Cầu Giấy, Hà Nội",
    totalOrders: 2,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "CUSTOMER",
    text: "Xin chào shop! Cho mình hỏi sản phẩm này chi nhánh Cầu Giấy còn hàng không?",
    time: "10:22",
    productCard: {
      id: "p1",
      name: "Cá ngừ đại dương cắt khoanh khay 300g",
      price: 65000,
      imageUrl: "/images/Banner1.jpeg",
      unit: "Khay",
    },
  },
  {
    id: "m2",
    sender: "STAFF",
    text: "Chào bạn! Sản phẩm Cá ngừ đại dương khay 300g bên mình hiện sẵn hàng tươi mới tại cửa hàng nhé ạ.",
    time: "10:23",
  },
  {
    id: "m3",
    sender: "CUSTOMER",
    text: "Shop ơi, cá hồi phi lê hôm nay còn tươi không ạ?",
    time: "10:24",
  },
];

const QUICK_REPLIES = [
  "Dạ cửa hàng đang sẵn hàng ạ!",
  "Đơn hàng của bạn đang được đóng gói nhé.",
  "Dạ bạn cho mình xin mã đơn hàng để kiểm tra ạ.",
  "Cảm ơn quý khách đã mua hàng tại UrbanMart!",
];

export default function BranchChatsPage() {
  const [conversations] = useState<ChatConversation[]>(MOCK_CONVERSATIONS);
  const [selectedChatId, setSelectedChatId] = useState<string>("chat-1");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "PROCESSING">(
    "ALL",
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>("");

  const selectedCustomer = conversations.find((c) => c.id === selectedChatId);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      c.phone.includes(searchTerm.trim());
    if (activeTab === "PENDING") return matchesSearch && c.status === "PENDING";
    if (activeTab === "PROCESSING")
      return matchesSearch && c.status === "PROCESSING";
    return matchesSearch;
  });

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "STAFF",
      text: text.trim(),
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText("");
  };

  return (
    <div className="h-[calc(100vh-65px)] bg-slate-100 flex overflow-hidden">
      <ConversationList
        conversations={filteredConversations}
        selectedChatId={selectedChatId}
        activeTab={activeTab}
        searchTerm={searchTerm}
        onSelectChat={setSelectedChatId}
        onTabChange={setActiveTab}
        onSearchChange={setSearchTerm}
      />

      <ChatWindow
        selectedCustomer={selectedCustomer}
        messages={messages}
        inputText={inputText}
        quickReplies={QUICK_REPLIES}
        onInputChange={setInputText}
        onSendMessage={handleSendMessage}
      />

      <CustomerInfoSidebar
        customer={selectedCustomer}
        onSendProductSuggestion={handleSendMessage}
      />
    </div>
  );
}
