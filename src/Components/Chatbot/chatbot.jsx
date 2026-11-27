"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, X, User, Sparkles, Compass, Ticket, LogIn } from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { getChatBot } from "../../services/ChatBotService";

const Chatbot = () => {
  const pathname = usePathname();
  if (pathname?.includes("/seats") || pathname?.startsWith("/booking")) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Ayubowan! 🙏 Welcome to Naataka.lk – Sri Lanka's Official Stage Drama & Theatre Platform.\n\nI can recommend top-rated stage plays, check show schedules, find venues in Colombo or across Sri Lanka, and guide you through ticket bookings. How can I assist you?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessageToAPI = async (message) => {
    try {
      const response = await getChatBot(message);
      return { reply: response?.data?.reply || "I am glad to help with your stage drama queries!" };
    } catch (error) {
      return {
        reply:
          "🎭 Welcome to Naataka.lk! You can explore our iconic Sri Lankan stage dramas at /dramas or browse live shows at /shows. Let me know if you'd like recommendations on Kelani Palama, Sinhabahu, or comedy plays!",
      };
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === "string" ? textToSend : inputValue;
    if (!query || !query.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: query.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const apiResponse = await sendMessageToAPI(query.trim());
      const botMessage = {
        id: Date.now() + 1,
        text: apiResponse.reply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "I couldn't process that right now. Please explore our /dramas or /shows pages for the latest live theatre!",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to render text with clickable internal links
  const renderMessageContent = (text) => {
    if (!text) return "";
    const parts = text.split(/(\/(?:drama|show|dramas|shows)(?:\/[\w-]+)?)/g);

    return parts.map((part, i) => {
      if (part.startsWith("/") && (part.startsWith("/drama") || part.startsWith("/show"))) {
        return (
          <Link
            key={i}
            href={part}
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 underline hover:text-amber-700 mx-1 bg-amber-500/10 px-1.5 py-0.5 rounded"
          >
            {part}
          </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const quickPrompts = [
    { label: "🎭 Suggest Dramas", query: "Suggest top Sri Lankan stage dramas" },
    { label: "📅 Upcoming Shows", query: "What upcoming shows are scheduled?" },
    { label: "📍 Shows in Colombo", query: "Upcoming stage shows in Colombo" },
    { label: "🎟️ How to Book", query: "How do I book tickets on Naataka.lk?" },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[92vw] sm:w-[380px] h-[550px] max-h-[82vh] bg-white dark:bg-[#12121a] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#661F19] to-[#8a2b23] text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Naataka AI Assistant</h3>
                <p className="text-[11px] text-amber-200/80">Sri Lanka Drama &amp; Ticketing Guide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 dark:bg-[#0e0e16]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[85%] ${
                    message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      message.sender === "user"
                        ? "bg-amber-600 text-white"
                        : "bg-[#661F19] text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {message.sender === "user" ? <User size={14} /> : "🎭"}
                  </div>

                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                      message.sender === "user"
                        ? "bg-amber-600 text-white rounded-br-sm shadow-sm"
                        : "bg-white dark:bg-[#181824] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line">{renderMessageContent(message.text)}</p>
                    <p
                      className={`text-[9px] mt-1 text-right ${
                        message.sender === "user" ? "text-amber-100" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 bg-white dark:bg-[#181824] border border-slate-200 dark:border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                    <div
                      className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">Naataka Assistant is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white dark:bg-[#12121a] border-t border-slate-100 dark:border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.query)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 dark:bg-white/5 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shrink-0 transition-colors"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#141420]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about stage dramas, shows, tickets..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#1a1a28] border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-[#661F19] to-amber-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all hover:scale-105 active:scale-95 shadow-md"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-[#661F19] to-amber-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-amber-400/40 relative group"
        aria-label="Toggle Naataka Assistant"
      >
        {isOpen ? (
          <X size={22} className="group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <>
            <MessageCircle size={24} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
