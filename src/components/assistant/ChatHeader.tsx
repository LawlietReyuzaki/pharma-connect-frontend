import { Bot, ArrowLeft, Globe, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  lang: "en" | "ur";
  onToggleLang: () => void;
  onToggleSidebar: () => void;
}

export default function ChatHeader({ lang, onToggleLang, onToggleSidebar }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[hsl(var(--pharmacy-dark))] to-[hsl(222,40%,16%)] text-[hsl(var(--pharmacy-dark-foreground))] px-4 py-3.5 flex items-center gap-3 shrink-0 shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className="text-[hsl(var(--pharmacy-dark-foreground))]/60 hover:text-[hsl(var(--pharmacy-dark-foreground))] hover:bg-[hsl(var(--pharmacy-dark-foreground))]/5 rounded-xl"
        onClick={onToggleSidebar}
      >
        <Clock className="w-5 h-5" />
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-[hsl(var(--pharmacy-dark-foreground))]/60 hover:text-[hsl(var(--pharmacy-dark-foreground))] hover:bg-[hsl(var(--pharmacy-dark-foreground))]/5 rounded-xl"
      >
        <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
      </Button>

      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center ring-2 ring-primary/10">
        <Bot className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="font-heading font-bold text-sm tracking-tight flex items-center gap-1.5">
          Medical AI Assistant
          <Sparkles className="w-3.5 h-3.5 text-primary opacity-70" />
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
          <span className="text-xs opacity-50">Online • Bilingual</span>
        </div>
      </div>

      <button
        onClick={onToggleLang}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[hsl(var(--pharmacy-dark-foreground))]/5 border border-[hsl(var(--pharmacy-dark-foreground))]/10 text-xs font-semibold opacity-70 hover:opacity-100 transition-all hover:bg-[hsl(var(--pharmacy-dark-foreground))]/10"
      >
        <Globe className="w-3.5 h-3.5" />
        {lang === "en" ? "EN" : "اردو"}
      </button>
    </div>
  );
}
