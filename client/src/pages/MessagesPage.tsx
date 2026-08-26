import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Conversation, ChatMessage } from "../types";
import toast from "react-hot-toast";
import { MessageCircle, Send, ArrowLeft, Package } from "lucide-react";

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

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch {
      toast.error("Failed to load conversations");
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await api.getMessages(conversationId);
      setMessages(data);
      await api.markConversationRead(conversationId);
    } catch {
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
      pollRef.current = setInterval(() => loadMessages(activeId), 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [activeId]);

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

  return (
    <div className="page-container">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        </div>
      </div>

      <div className="card p-0 overflow-hidden" style={{ height: "600px" }}>
        <div className="flex h-full">
          <div
            className={`w-80 border-r border-gray-100 flex flex-col ${
              activeId ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">
                  No conversations yet
                </p>
              )}
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    activeId === c.id ? "bg-eco-light" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-eco-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {c.otherUser?.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">
                          {c.otherUser?.name}
                        </span>
                        {c.listing && (
                          <Package className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      {c.listing && (
                        <p className="text-xs text-eco-primary truncate">
                          Re: {c.listing.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 truncate">
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
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setActiveId(null)}
                    className="md:hidden text-gray-500"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 bg-eco-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {activeConvo.otherUser?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {activeConvo.otherUser?.name}
                    </p>
                    {activeConvo.listing && (
                      <p className="text-xs text-gray-500">
                        {activeConvo.listing.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.senderId._id === user?.id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                            isMine
                              ? "bg-eco-primary text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p>{msg.content}</p>
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
                  className="px-4 py-3 border-t border-gray-100 flex gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field flex-1"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="btn-primary px-4"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
