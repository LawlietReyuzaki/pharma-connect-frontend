import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Mic, MicOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "سلام! میں Red Dot Pharmacy کا مددگار ہوں۔\n\nHello! I'm Red Dot Pharmacy's AI assistant. Ask me about medicines, symptoms, or health advice in English or Urdu.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.response || data.message || "Sorry, I couldn't understand that." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (listening) {
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-muted/30">
      {/* Header */}
      <div className="bg-pharmacy-dark text-pharmacy-dark-foreground px-4 py-3 flex items-center gap-3 border-b border-pharmacy-dark-foreground/10">
        <Button asChild variant="ghost" size="icon" className="text-pharmacy-dark-foreground/60 hover:text-pharmacy-dark-foreground">
          <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-sm">Medical Assistant</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
            <span className="text-xs text-pharmacy-dark-foreground/50">Online</span>
            <span className="text-xs text-pharmacy-dark-foreground/30 ml-2">EN/UR</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === "bot" ? "bg-primary/10 text-primary" : "bg-foreground/10 text-foreground"}`}>
              {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-md"
                : "bg-card border border-border text-foreground rounded-tl-md"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`shrink-0 ${listening ? "text-primary" : "text-muted-foreground"}`}
            onClick={toggleVoice}
          >
            {listening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
          </Button>
          <Input
            placeholder="Type your message..."
            className="rounded-xl"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <Button size="icon" className="bg-primary text-primary-foreground rounded-xl shrink-0" onClick={sendMessage} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
