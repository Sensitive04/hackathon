import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Users, ChevronDown, ChevronUp, Info } from "lucide-react";
import { api } from "../../services/api";

interface Message {
  _id: string;
  senderId: { _id: string; name: string; avatar?: string };
  content: string;
  isSystem?: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  title: string;
  participants: { _id: string; name: string; avatar?: string; role?: string }[];
}

interface Props {
  currentUserId: string;
  socket: React.MutableRefObject<any>;
  emit: (event: string, ...args: any[]) => void;
  onlineUsers: string[];
  isUserOnline: (id: string) => boolean;
  onClose: () => void;
  unread: Record<string, number>;
  clearUnread: (id: string) => void;
  initialConversationId?: string;
  isEnded?: boolean;
}

export default function ChatPanel({
  currentUserId,
  socket,
  emit,
  onlineUsers,
  isUserOnline,
  onClose,
  unread,
  clearUnread,
  initialConversationId,
  isEnded = false,
}: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});
  const [showMembers, setShowMembers] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getCampaignChats();
      setConversations(data);
      if (!activeId && data.length > 0) {
        setActiveId(data[0]._id);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (initialConversationId) {
      setActiveId(initialConversationId);
    }
  }, [initialConversationId]);

  const loadMessages = useCallback(
    async (convId: string) => {
      setLoading(true);
      try {
        const data = await api.getChatMessages(convId);
        setMessages(data);
        clearUnread(convId);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [clearUnread]
  );

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
      if (socket.current) {
        socket.current.emit("join", activeId);
      }
    }
    return () => {
      if (activeId && socket.current) {
        socket.current.emit("leave", activeId);
      }
    };
  }, [activeId, socket]);

  useEffect(() => {
    if (!socket.current) return;
    const handler = (data: { conversationId: string; message: Message }) => {
      if (data.conversationId === activeId && data.message.senderId._id !== currentUserId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };
    socket.current.on("chat:message", handler);
    return () => {
      socket.current?.off("chat:message", handler);
    };
  }, [activeId, socket, currentUserId]);

  useEffect(() => {
    if (!socket.current) return;

    const onStart = (data: { conversationId: string; userId: string }) => {
      if (data.userId === currentUserId) return;
      setTypingUsers((prev) => {
        const copy = { ...prev };
        if (!copy[data.conversationId]) copy[data.conversationId] = new Set();
        copy[data.conversationId] = new Set(copy[data.conversationId]);
        copy[data.conversationId].add(data.userId);
        return copy;
      });
    };

    const onStop = (data: { conversationId: string; userId: string }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        if (copy[data.conversationId]) {
          copy[data.conversationId] = new Set(copy[data.conversationId]);
          copy[data.conversationId].delete(data.userId);
        }
        return copy;
      });
    };

    socket.current.on("typing:start", onStart);
    socket.current.on("typing:stop", onStop);
    return () => {
      socket.current?.off("typing:start", onStart);
      socket.current?.off("typing:stop", onStop);
    };
  }, [socket, currentUserId]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (activeId && e.target.value.trim()) {
      emit("typing:start", { conversationId: activeId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emit("typing:stop", { conversationId: activeId });
      }, 2000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeId || isEnded) return;
    const text = input.trim();
    setInput("");

    emit("typing:stop", { conversationId: activeId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      const msg = await api.sendChatMessage(activeId, text);
      setMessages((prev) => [...prev, msg]);
    } catch {
      setInput(text);
    }
  };

  const activeConv = conversations.find((c) => c._id === activeId);
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);
  const activeTyping = activeId && typingUsers[activeId] && typingUsers[activeId].size > 0;

  return (
    <div
      className="bg-neu-bg rounded-3xl shadow-neu-raised overflow-hidden flex flex-col animate-scale-in"
      style={{ height: "480px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neu-shadow-dark/15 bg-neu-bg">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm text-neu-text truncate tracking-tight">
            {activeConv?.title || "Campaign Chat"}
          </h3>
          <p className="text-xs text-neu-text-muted mt-0.5">
            {activeConv?.participants.length || 0} members
            {activeConv && (() => {
              const onlineCount = activeConv.participants.filter((p) =>
                isUserOnline(p._id)
              ).length;
              return onlineCount > 0 ? (
                <span className="ml-2 text-eco-primary font-medium">{onlineCount} online</span>
              ) : null;
            })()}
            {isEnded && (
              <span className="ml-2 text-neu-red font-semibold">Ended</span>
            )}
            {totalUnread > 0 && (
              <span className="ml-2 text-neu-red font-semibold">{totalUnread} unread</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="p-1.5 text-neu-text-muted hover:text-neu-text hover:shadow-neu-pressed-sm rounded-xl transition-all duration-200"
          >
            {showMembers ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <Users className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Member list */}
      {showMembers && activeConv && (
        <div className="border-b border-neu-shadow-dark/15 bg-neu-bg px-4 py-2.5 max-h-40 overflow-y-auto animate-fade-in-down shadow-neu-pressed-sm">
          <p className="text-[10px] font-bold text-neu-text-muted uppercase tracking-wider mb-1.5">
            Members ({activeConv.participants.length})
          </p>
          {activeConv.participants.map((p) => (
            <div key={p._id} className="flex items-center gap-2.5 py-1.5">
              <span className="relative flex-shrink-0">
                <span className="w-6 h-6 bg-neu-bg rounded-full flex items-center justify-center text-eco-primary text-[10px] font-bold shadow-neu-raised-sm">
                  {p.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
                {isUserOnline(p._id) && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-eco-primary rounded-full border-2 border-neu-bg shadow-sm" />
                )}
              </span>
              <span className="text-xs text-neu-text font-medium">
                {p.name}
                {p._id === currentUserId && (
                  <span className="text-neu-text-muted ml-1 font-normal">(you)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-neu-bg/50">
        {loading && (
          <p className="text-xs text-neu-text-muted text-center py-4">Loading messages...</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-xs text-neu-text-muted text-center py-4">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg._id} className="flex justify-center my-2">
                <div className="flex items-center gap-1.5 text-[11px] text-neu-text-muted bg-neu-bg px-3 py-1.5 rounded-full shadow-neu-pressed-sm">
                  <Info className="w-3 h-3" />
                  <span className="italic">{msg.content}</span>
                </div>
              </div>
            );
          }

          const isMine = msg.senderId._id === currentUserId;
          return (
            <div
              key={msg._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "bg-eco-primary text-white rounded-br-md shadow-neu-raised-sm"
                    : "bg-neu-bg text-neu-text rounded-bl-md shadow-neu-raised-sm"
                }`}
              >
                {!isMine && (
                  <p className="text-[10px] font-semibold text-neu-text-secondary mb-0.5">
                    {msg.senderId.name}
                  </p>
                )}
                <p className="leading-relaxed">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMine ? "text-green-100" : "text-neu-text-muted"
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
        <div ref={messagesEnd} />
      </div>

      {/* Typing indicator */}
      {activeTyping && !isEnded && (
        <div className="px-3 py-1.5 text-xs text-neu-text-muted italic bg-neu-bg border-t border-neu-shadow-dark/15">
          {typingUsers[activeId!].size === 1
            ? "Someone is typing"
            : `${typingUsers[activeId!].size} people are typing`}
          <span className="animate-pulse">...</span>
        </div>
      )}

      {/* Ended banner */}
      {isEnded && (
        <div className="px-3 py-2.5 text-xs text-center text-neu-text-muted bg-neu-bg border-t border-neu-shadow-dark/15 font-medium">
          This campaign has ended. Messaging is disabled.
        </div>
      )}

      {/* Input */}
      {activeId && !isEnded && (
        <form onSubmit={handleSend} className="flex gap-2 px-3 py-2.5 border-t border-neu-shadow-dark/15 bg-neu-bg">
          <input
            type="text"
            className="flex-1 text-sm !py-2.5 px-4 rounded-2xl bg-neu-bg text-neu-text placeholder:text-neu-text-muted transition-all duration-200 shadow-neu-pressed-sm focus:shadow-neu-pressed focus:ring-2 focus:ring-eco-primary/30 focus:outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-primary !rounded-full !p-2.5 !shadow-neu-raised-sm disabled:!shadow-neu-flat"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
