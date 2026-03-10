import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Globe,
  ArrowLeft, Plus, Clock, BookOpen, ExternalLink, Pill,
  Stethoscope, Search, Heart, MessageCircle, Sparkles, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import ChatHeader from "@/components/assistant/ChatHeader";
import ChatSidebar from "@/components/assistant/ChatSidebar";
import WelcomeScreen from "@/components/assistant/WelcomeScreen";
import MessageBubble from "@/components/assistant/MessageBubble";
import ChatInput from "@/components/assistant/ChatInput";
import WikiPanel from "@/components/assistant/WikiPanel";

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

const QUICK_PROMPTS = [
  { icon: Pill, label: "Medicine Info", prompt: "Tell me about common pain relievers and their uses" },
  { icon: Stethoscope, label: "Symptoms Check", prompt: "I have a headache and mild fever, what could it be?" },
  { icon: Heart, label: "Health Tips", prompt: "Give me 5 daily health tips for a healthy lifestyle" },
  { icon: Search, label: "Drug Interactions", prompt: "Can I take paracetamol and ibuprofen together?" },
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
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

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/chat/sessions", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setSessions(d.sessions || []))
        .catch(() => {});
    }
  }, []);

  const sendMessage = async (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
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
          lang,
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
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (listening) { setListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ur" ? "ur-PK" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => { setInput(event.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  const speakMessage = async (text: string, index: number) => {
    if (playingTTS === index) { audioRef.current?.pause(); setPlayingTTS(null); return; }
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

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        onNewChat={() => { setMessages([]); setSidebarOpen(false); }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          lang={lang}
          onToggleLang={() => setLang(lang === "en" ? "ur" : "en")}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Subtle pattern background */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "24px 24px" }}
          />

          {!hasMessages ? (
            <WelcomeScreen
              lang={lang}
              quickPrompts={QUICK_PROMPTS}
              onPromptClick={(prompt) => sendMessage(prompt)}
            />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 relative">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  message={msg}
                  index={i}
                  playingTTS={playingTTS}
                  onSpeak={speakMessage}
                  onOpenWiki={setWikiPanel}
                />
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEnd} />
            </div>
          )}
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => sendMessage()}
          loading={loading}
          listening={listening}
          onToggleVoice={toggleVoice}
          lang={lang}
        />
      </div>

      <WikiPanel wiki={wikiPanel} onClose={() => setWikiPanel(null)} />
    </div>
  );
}
