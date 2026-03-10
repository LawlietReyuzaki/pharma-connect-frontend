import { motion } from "framer-motion";
import { Bot, User, Volume2, VolumeX, BookOpen, Pill, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

interface Message {
  role: "user" | "bot";
  content: string;
  wiki?: { title: string; page_url: string; summary: string; images?: string[] };
  suggested_medicines?: any[];
  needs_doctor?: boolean;
  flagged?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  index: number;
  playingTTS: number | null;
  onSpeak: (text: string, index: number) => void;
  onOpenWiki: (wiki: Message["wiki"]) => void;
}

const isUrdu = (text: string) => /[\u0600-\u06FF]/.test(text);

export default function MessageBubble({ message: msg, index: i, playingTTS, onSpeak, onOpenWiki }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const urdu = isUrdu(msg.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${
        msg.role === "bot"
          ? "bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10"
          : "bg-gradient-to-br from-foreground/10 to-foreground/5 text-foreground ring-1 ring-foreground/10"
      }`}>
        {msg.role === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      <div className={`max-w-[78%] space-y-2 ${msg.role === "user" ? "items-end" : ""}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            msg.role === "user"
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-md shadow-md"
              : "bg-card border border-border text-foreground rounded-tl-md shadow-sm"
          }`}
          style={urdu ? { direction: "rtl", textAlign: "right", fontFamily: "'Noto Nastaliq Urdu', serif" } : {}}
        >
          {msg.role === "bot" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ) : (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          )}
        </div>

        {/* Bot actions */}
        {msg.role === "bot" && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSpeak(msg.content, i)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Listen"
            >
              {playingTTS === i ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Copy"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {msg.wiki && (
              <button
                onClick={() => onOpenWiki(msg.wiki)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Wikipedia"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Doctor warning */}
        {msg.needs_doctor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 text-xs"
          >
            <span className="text-warning font-medium">⚠️ This may require professional medical attention.</span>
            <Link to="/consultation" className="underline font-semibold text-primary ml-auto shrink-0">
              Book a doctor
            </Link>
          </motion.div>
        )}

        {/* Medicine chips */}
        {msg.suggested_medicines && msg.suggested_medicines.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {msg.suggested_medicines.map((med: any, j: number) => (
              <Link
                key={j}
                to="/shop"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all hover:shadow-sm"
              >
                <Pill className="w-3 h-3" /> {med.name || med}
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
