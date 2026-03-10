import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  listening: boolean;
  onToggleVoice: () => void;
  lang: "en" | "ur";
}

export default function ChatInput({ input, setInput, onSend, loading, listening, onToggleVoice, lang }: ChatInputProps) {
  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-lg px-4 py-3.5 shrink-0">
      <div className="max-w-3xl mx-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 rounded-xl transition-all ${
            listening
              ? "text-primary bg-primary/10 ring-2 ring-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onToggleVoice}
        >
          {listening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <div className="flex-1 relative">
          <input
            placeholder={lang === "ur" ? "...اپنا سوال لکھیں" : "Ask a health question..."}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            disabled={loading}
            style={lang === "ur" ? { direction: "rtl", fontFamily: "'Noto Nastaliq Urdu', serif" } : {}}
          />
        </div>

        <Button
          size="icon"
          className="bg-primary text-primary-foreground rounded-xl shrink-0 shadow-sm hover:shadow-md transition-all disabled:opacity-40"
          onClick={onSend}
          disabled={loading || !input.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground/50 mt-2 max-w-3xl mx-auto">
        AI responses are for informational purposes only. Consult a healthcare professional for medical decisions.
      </p>
    </div>
  );
}
