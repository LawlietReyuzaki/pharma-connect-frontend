import { Send, Mic, MicOff, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  setInput: (v: string) => void;
  onSend: (useWebSearch?: boolean) => void;
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
          title="Voice input"
        >
          {listening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <div className="flex-1 relative">
          <input
            placeholder={lang === "ur" ? "...اپنا سوال لکھیں" : "Ask a health question..."}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend(false)}
            disabled={loading}
            style={lang === "ur" ? { direction: "rtl", fontFamily: "'Noto Nastaliq Urdu', serif" } : {}}
          />
        </div>

        {/* Web Search button */}
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all disabled:opacity-40"
          onClick={() => onSend(true)}
          disabled={loading || !input.trim()}
          title="Search with Gemini Web"
        >
          <Globe className="w-4 h-4" />
        </Button>

        {/* Standard send button */}
        <Button
          size="icon"
          className="bg-primary text-primary-foreground rounded-xl shrink-0 shadow-sm hover:shadow-md transition-all disabled:opacity-40"
          onClick={() => onSend(false)}
          disabled={loading || !input.trim()}
          title="Send"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground/50 mt-2 max-w-3xl mx-auto">
        <Globe className="inline w-3 h-3 mr-1 text-blue-400" />
        Globe = Gemini web search &nbsp;|&nbsp; Arrow = Standard AI response &nbsp;|&nbsp;
        For medical emergencies call <strong>1122</strong>
      </p>
    </div>
  );
}
