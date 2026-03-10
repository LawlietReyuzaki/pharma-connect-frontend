import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Globe, ArrowLeft, Plus, Trash2, Clock, BookOpen, ExternalLink, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "bot";
  content: string;
  wiki?: { title: string; page_url: string; summary: string; images?: string[] };
  suggested_medicines?: any[];
  needs_doctor?: boolean;
  flagged?: boolean;
}

interface Session {
  session_id: string;
  created_at: string;
  preview?: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "سلام! میں Red Dot Pharmacy کا مددگار ہوں۔\n\nHello! I'm Red Dot Pharmacy's AI medical assistant. Ask me about medicines, symptoms, or health advice in **English** or **Urdu**.\n\nمیں آپ کی مدد کے لیے حاضر ہوں۔",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState<"en" | "ur">("en");
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wikiPanel, setWikiPanel] = useState<Message["wiki"] | null>(null);
  const [playingTTS, setPlayingTTS] = useState<number | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load sessions
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/chat/sessions", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setSessions(d.sessions || []))
        .catch(() => {});
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat/medical-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          session_id: sessionId,
          lang: lang,
          include_wiki: true,
          user_id: JSON.parse(localStorage.getItem("user") || "{}").id,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.message || "Sorry, I couldn't understand that.",
          wiki: data.wiki,
          suggested_medicines: data.medicines,
          needs_doctor: data.needs_doctor,
          flagged: data.flagged,
        },
      ]);
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
    recognition.lang = lang === "ur" ? "ur-PK" : "en-US";
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

  const speakMessage = async (text: string, index: number) => {
    if (playingTTS === index) {
      audioRef.current?.pause();
      setPlayingTTS(null);
      return;
    }
    try {
      const endpoint = lang === "ur" ? "/api/chat/speak-urdu" : "/api/chat/speak-english";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        setPlayingTTS(index);
        audio.onended = () => setPlayingTTS(null);
        audio.play();
      }
    } catch {}
  };

  const isUrdu = (text: string) => /[\u0600-\u06FF]/.test(text);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed lg:relative z-40 w-72 h-full bg-card border-r border-border flex flex-col"
            >
              <div className="p-4 border-b border-border">
                <Button className="w-full bg-primary text-primary-foreground rounded-xl" onClick={() => { setMessages([messages[0]]); setSidebarOpen(false); }}>
                  <Plus className="w-4 h-4 mr-2" /> New Chat
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {sessions.map((s) => (
                  <button
                    key={s.session_id}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted text-sm transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <p className="truncate font-medium">{s.preview || "Chat session"}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(s.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
                {sessions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No previous sessions</p>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-pharmacy-dark text-pharmacy-dark-foreground px-4 py-3 flex items-center gap-3 border-b border-pharmacy-dark-foreground/10 shrink-0">
          <Button variant="ghost" size="icon" className="text-pharmacy-dark-foreground/60 hover:text-pharmacy-dark-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Clock className="w-5 h-5" />
          </Button>
          <Button asChild variant="ghost" size="icon" className="text-pharmacy-dark-foreground/60 hover:text-pharmacy-dark-foreground">
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-semibold text-sm">Medical AI Assistant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
              <span className="text-xs text-pharmacy-dark-foreground/50">Online</span>
            </div>
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pharmacy-dark-foreground/5 border border-pharmacy-dark-foreground/10 text-xs font-medium text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "EN" : "اردو"}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${
                  msg.role === "bot" ? "bg-primary/10 text-primary" : "bg-foreground/10 text-foreground"
                }`}>
                  {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="max-w-[80%] space-y-2">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-card border border-border text-foreground rounded-tl-md shadow-sm"
                    }`}
                    style={isUrdu(msg.content) ? { direction: "rtl", textAlign: "right", fontFamily: "'Noto Nastaliq Urdu', serif" } : {}}
                  >
                    {msg.content}
                  </div>

                  {/* Bot message actions */}
                  {msg.role === "bot" && i > 0 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => speakMessage(msg.content, i)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Listen"
                      >
                        {playingTTS === i ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      {msg.wiki && (
                        <button
                          onClick={() => setWikiPanel(msg.wiki)}
                          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Wikipedia"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Needs doctor warning */}
                  {msg.needs_doctor && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning">
                      ⚠️ This condition may require professional medical attention.
                      <Link to="/consultation" className="underline font-medium ml-1">Book a doctor</Link>
                    </div>
                  )}

                  {/* Suggested medicines */}
                  {msg.suggested_medicines && msg.suggested_medicines.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggested_medicines.map((med: any, j: number) => (
                        <Link
                          key={j}
                          to="/shop"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                        >
                          <Pill className="w-3 h-3" /> {med.name || med}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card px-4 py-3 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 rounded-xl ${listening ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
              onClick={toggleVoice}
            >
              {listening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Input
              placeholder={lang === "ur" ? "...اپنا سوال لکھیں" : "Type your health question..."}
              className="rounded-xl"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
              style={lang === "ur" ? { direction: "rtl", fontFamily: "'Noto Nastaliq Urdu', serif" } : {}}
            />
            <Button
              size="icon"
              className="bg-primary text-primary-foreground rounded-xl shrink-0"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Wikipedia Panel */}
      <AnimatePresence>
        {wikiPanel && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h4 className="font-heading font-bold flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Wikipedia</h4>
              <Button variant="ghost" size="icon" onClick={() => setWikiPanel(null)}><ArrowLeft className="w-5 h-5" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h5 className="font-heading font-bold text-lg">{wikiPanel.title}</h5>
              {wikiPanel.images?.[0] && (
                <img src={wikiPanel.images[0]} alt={wikiPanel.title} className="w-full rounded-xl object-cover max-h-48" />
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">{wikiPanel.summary}</p>
              <a
                href={wikiPanel.page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                Read more on Wikipedia <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
