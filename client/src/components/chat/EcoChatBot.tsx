import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import { api } from "../../services/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What is climate change and how does it affect us?",
  "How can I reduce my carbon footprint at home?",
  "What are the best renewable energy sources?",
  "How does recycling help the environment?",
  "What is ocean acidification?",
  "Tips for sustainable living?",
];

export default function EcoChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.chat(msg, history);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-neu-raised-lg transition-all duration-300 hover:scale-105 ${
          open ? "bg-neu-red text-white" : "bg-eco-primary text-white"
        }`}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-neu-bg rounded-3xl shadow-neu-raised-lg overflow-hidden flex flex-col animate-scale-in"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neu-shadow-dark/15 bg-neu-bg">
            <div className="w-9 h-9 bg-eco-primary/10 rounded-full flex items-center justify-center shadow-neu-pressed-sm">
              <Bot className="w-4.5 h-4.5 text-eco-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-neu-text tracking-tight">EcoBot</h3>
              <p className="text-[11px] text-neu-text-muted">AI Environmental Assistant</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-eco-primary animate-pulse" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-neu-bg/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-14 h-14 bg-eco-primary/10 rounded-full flex items-center justify-center shadow-neu-pressed mb-3">
                  <Bot className="w-7 h-7 text-eco-primary" />
                </div>
                <p className="text-sm font-bold text-neu-text mb-1">Ask EcoBot Anything</p>
                <p className="text-xs text-neu-text-muted mb-4">
                  Questions about climate, sustainability, recycling, and green living.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-[11px] font-medium text-eco-primary bg-eco-primary/5 px-2.5 py-1.5 rounded-xl hover:bg-eco-primary/10 transition-colors shadow-neu-flat hover:shadow-neu-raised-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-neu-raised-sm ${
                    msg.role === "user" ? "bg-eco-primary/10" : "bg-eco-primary/15"
                  }`}>
                    {msg.role === "user" ? (
                      <User className="w-3 h-3 text-eco-primary" />
                    ) : (
                      <Bot className="w-3 h-3 text-eco-primary" />
                    )}
                  </div>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-eco-primary text-white rounded-br-md shadow-neu-raised-sm"
                      : "bg-neu-bg text-neu-text rounded-bl-md shadow-neu-raised-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-eco-primary/15 flex items-center justify-center shadow-neu-raised-sm">
                    <Bot className="w-3 h-3 text-eco-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-neu-bg shadow-neu-raised-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-eco-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-eco-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-eco-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex gap-2 px-3 py-2.5 border-t border-neu-shadow-dark/15 bg-neu-bg"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about environment..."
              disabled={loading}
              className="flex-1 text-sm !py-2.5 px-4 rounded-2xl bg-neu-bg text-neu-text placeholder:text-neu-text-muted shadow-neu-pressed-sm focus:shadow-neu-pressed focus:ring-2 focus:ring-eco-primary/30 focus:outline-none transition-all duration-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary !rounded-full !p-2.5 !shadow-neu-raised-sm disabled:!shadow-neu-flat"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
