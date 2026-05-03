import { motion } from "framer-motion";
import { Bot, Sparkles, FlaskConical, type LucideIcon } from "lucide-react";

interface QuickPrompt {
  icon: LucideIcon;
  label: string;
  prompt: string;
}

interface WelcomeScreenProps {
  lang: "en" | "ur";
  quickPrompts: QuickPrompt[];
  onPromptClick: (prompt: string) => void;
  pharmacistMode?: boolean;
}

export default function WelcomeScreen({ lang, quickPrompts, onPromptClick, pharmacistMode }: WelcomeScreenProps) {
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
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border ${
            pharmacistMode
              ? "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/20"
              : "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/10"
          }`}>
            {pharmacistMode
              ? <FlaskConical className="w-10 h-10 text-emerald-600" />
              : <Bot className="w-10 h-10 text-primary" />
            }
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
              pharmacistMode ? "bg-emerald-500" : "bg-success"
            }`}
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        </div>

        {/* Greeting */}
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {pharmacistMode
              ? "Pharmacist Consultation"
              : lang === "ur" ? "سلام! میں آپ کا مددگار ہوں" : "Hi! I'm your Health Assistant"}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            {pharmacistMode
              ? "Ask about available medicines for any condition, drug classes, dosage guidance, stock alternatives, and patient counseling points."
              : lang === "ur"
              ? "دوائیں، علامات، یا صحت کے مشورے کے بارے میں پوچھیں"
              : "Ask me about medicines, symptoms, health advice, or drug interactions. Available in English & Urdu."}
          </p>
          {pharmacistMode && (
            <p className="text-xs text-emerald-600 font-medium">
              Clinical reference mode — for pharmacy staff use only
            </p>
          )}
        </div>

        {/* Quick prompts */}
        <div className={`grid gap-3 pt-2 ${quickPrompts.length > 4 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
          {quickPrompts.map((qp, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              onClick={() => onPromptClick(qp.prompt)}
              className={`group flex items-center gap-3 p-3.5 rounded-2xl border bg-card transition-all text-left shadow-sm hover:shadow-md ${
                pharmacistMode
                  ? "border-border hover:border-emerald-400/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                  : "border-border hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                pharmacistMode
                  ? "bg-emerald-500/10 group-hover:bg-emerald-500/20"
                  : "bg-primary/10 group-hover:bg-primary/20"
              }`}>
                <qp.icon className={`w-4 h-4 ${pharmacistMode ? "text-emerald-600" : "text-primary"}`} />
              </div>
              <span className="text-xs font-medium text-foreground leading-tight">{qp.label}</span>
            </motion.button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/60 pt-2">
          {pharmacistMode
            ? "🔬 Clinical reference only. Confirm therapeutic substitutions with the prescriber."
            : "⚕️ This is an AI assistant. Always consult a doctor for serious conditions."}
        </p>
      </motion.div>
    </div>
  );
}
