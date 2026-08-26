import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Conversation, ChatMessage } from "../types";
import toast from "react-hot-toast";
import { MessageCircle, Send, ArrowLeft, Package, CheckCircle, X } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(
    searchParams.get("conversation")
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const activeIdRef = useRef<string | null>(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const listingFilter = searchParams.get("listing");

  const loadConversations = async () => {
    try {
      const data = await api.getConversations(listingFilter || undefined);
      setConversations(data);
    } catch {
      toast.error("Failed to load conversations");
    }
  };

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await api.getMessages(conversationId);
      setMessages(data);
      await api.markConversationRead(conversationId);
    } catch {
      toast.error("Failed to load messages");
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
      pollRef.current = setInterval(() => {
        const currentId = activeIdRef.current;
        if (currentId) loadMessages(currentId);
      }, 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [activeId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeId) return;
    setLoading(true);
    try {
      const msg = await api.sendMessage(activeId, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      loadConversations();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const activeConvo = conversations.find((c) => c.id === activeId);
  const [confirming, setConfirming] = useState(false);

  const handleConfirmSale = async (listingId: string) => {
    setConfirming(true);
    try {
      await api.confirmSale(listingId);
      toast.success("Sale confirmed! Item marked as sold.");
      loadConversations();
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm sale");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelSale = async (listingId: string) => {
    setConfirming(true);
    try {
      await api.cancelSale(listingId);
      toast.success("Sale cancelled. Item is available again.");
      loadConversations();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel sale");
    } finally {
      setConfirming(false);
    }
  };

  const isSellerOfPendingSale =
    activeConvo?.listing?.listingType === "sale" &&
    activeConvo?.listing?.status === "pending" &&
    activeConvo?.listing?.sellerId?._id === user?.id;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-icon bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="page-header-title">Messages</h1>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden shadow-float" style={{ height: "600px" }}>
        <div className="flex h-full">
          <div
            className={`w-80 border-r border-slate-100 flex flex-col ${
              activeId ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
              <h2 className="font-bold text-gray-900 text-sm tracking-tight">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8 font-medium">
                  No conversations yet
                </p>
              )}
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-all duration-200 ${
                    activeId === c.id
                      ? "bg-eco-light/50 border-l-2 border-l-eco-primary"
                      : "hover:bg-gray-50 border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-eco-primary to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                      {c.otherUser?.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate text-gray-900">
                          {c.otherUser?.name}
                        </span>
                        {c.listing && (
                          <Package className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      {c.listing && (
                        <p className="text-xs text-eco-primary truncate font-medium">
                          Re: {c.listing.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {c.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            className={`flex-1 flex flex-col ${
              activeId ? "flex" : "hidden md:flex"
            }`}
          >
            {activeId && activeConvo ? (
              <>
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-white to-slate-50/50">
                  <button
                    onClick={() => setActiveId(null)}
                    className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 bg-gradient-to-br from-eco-primary to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {activeConvo.otherUser?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 tracking-tight">
                      {activeConvo.otherUser?.name}
                    </p>
                    {activeConvo.listing && (
                      <p className="text-xs text-gray-500">
                        {activeConvo.listing.title}
                      </p>
                    )}
                  </div>
                </div>

                {isSellerOfPendingSale && activeConvo?.listing && (
                  <div className="mx-4 mt-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Sale Pending
                      </p>
                      <p className="text-xs text-amber-600">
                        {activeConvo.otherUser?.name} wants to buy &ldquo;{activeConvo.listing.title}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={() => handleConfirmSale(activeConvo.listing!._id)}
                      disabled={confirming}
                      className="btn-primary text-xs !py-1.5 !px-3 !bg-amber-600 hover:!bg-amber-700 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {confirming ? "Confirming..." : "Confirm Sale"}
                    </button>
                    <button
                      onClick={() => handleCancelSale(activeConvo.listing!._id)}
                      disabled={confirming}
                      className="text-xs !py-1.5 !px-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800 flex items-center gap-1.5 transition-all duration-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      {confirming ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30">
                  {messages.map((msg) => {
                    const isMine = msg.senderId._id === user?.id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? "bg-gradient-to-br from-eco-primary to-emerald-600 text-white rounded-br-md shadow-sm"
                              : "bg-white text-gray-900 rounded-bl-md border border-gray-100 shadow-sm"
                          }`}
                        >
                          <p className="leading-relaxed">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMine ? "text-green-100" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="px-4 py-3 border-t border-slate-100 flex gap-2 bg-white"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field flex-1 !py-2.5"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="btn-primary !px-4 !shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50/30">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="font-medium text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
