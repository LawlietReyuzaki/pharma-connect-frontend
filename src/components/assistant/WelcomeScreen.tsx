import { motion } from "framer-motion";
import { Bot, Sparkles, type LucideIcon } from "lucide-react";

interface QuickPrompt {
  icon: LucideIcon;
  label: string;
  prompt: string;
}

interface WelcomeScreenProps {
  lang: "en" | "ur";
  quickPrompts: QuickPrompt[];
  onPromptClick: (prompt: string) => void;
}

export default function WelcomeScreen({ lang, quickPrompts, onPromptClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-lg space-y-6"
      >
        {/* Avatar */}
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center"
          >
            <Sparkles className="w-3 h-3 text-success-foreground" />
          </motion.div>
        </div>

        {/* Greeting */}
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {lang === "ur" ? "سلام! میں آپ کا مددگار ہوں" : "Hi! I'm your Health Assistant"}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            {lang === "ur"
              ? "دوائیں، علامات، یا صحت کے مشورے کے بارے میں پوچھیں"
              : "Ask me about medicines, symptoms, health advice, or drug interactions. Available in English & Urdu."}
          </p>
        </div>

        {/* Quick prompts */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {quickPrompts.map((qp, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => onPromptClick(qp.prompt)}
              className="group flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-left shadow-sm hover:shadow-md"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <qp.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground leading-tight">{qp.label}</span>
            </motion.button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/60 pt-2">
          ⚕️ This is an AI assistant. Always consult a doctor for serious conditions.
        </p>
      </motion.div>
    </div>
  );
}
