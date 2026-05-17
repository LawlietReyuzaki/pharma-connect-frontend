import { motion } from "framer-motion";
import { Bot, User, Volume2, VolumeX, BookOpen, Pill, Copy, Check, ShoppingCart, ExternalLink, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { formatPKR, medicineFallback } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";

interface BackendMedicine {
  id?: number;
  name: string;
  price?: number;
  image_url?: string;
  status?: string;
  description_short?: string;
  manufacturer?: string;
  form?: string;
  ingredients?: string;
  substitution_type?: "exact" | "class_alternative";
  requires_prescriber_approval?: boolean;
}

interface ImageReference {
  condition: string;
  distinguishing_features: string;
  source_title: string;
  source_url: string;
  source_domain: string;
  image_url?: string;
}

interface Message {
  role: "user" | "bot";
  content: string;
  wiki?: { title: string; page_url: string; summary: string; images?: string[] };
  suggested_medicines?: any[];
  needs_doctor?: boolean;
  flagged?: boolean;
  red_flag?: boolean;
  image_references?: ImageReference[];
  cta?: { label: string; url: string } | null;
  intent?: string;
}

interface MessageBubbleProps {
  message: Message;
  index: number;
  playingTTS: number | null;
  onSpeak: (text: string, index: number) => void;
  onOpenWiki: (wiki: Message["wiki"]) => void;
}

function MedicineSuggestionCard({ med }: { med: BackendMedicine }) {
  const { addItem } = useCart();
  const outOfStock = !!(med.status && med.status !== "in_stock");
  const hasFullData = typeof med.price === "number" && med.price > 0;

  if (!hasFullData) {
    return (
      <Link
        to={`/shop?search=${encodeURIComponent(med.name)}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all hover:shadow-sm self-start"
      >
        <Pill className="w-3 h-3" /> {med.name}
      </Link>
    );
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || !med.id) return;
    addItem({
      id: med.id,
      name: med.name,
      price: med.price!,
      image_path: med.image_url,
    });
  };

  return (
    <Link
      to={`/shop?search=${encodeURIComponent(med.name)}`}
      className="group w-56 shrink-0 rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all"
      title={med.description_short || med.name}
    >
      {/* Image area with manufacturer badge */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden">
        {med.manufacturer && (
          <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">
            {med.manufacturer}
          </span>
        )}
        <img
          src={med.image_url || "/static/images/default-medicine.png"}
          alt={med.name}
          onError={medicineFallback}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-foreground text-background text-xs font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-3 space-y-2">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
            {med.name}
          </p>
          {med.ingredients && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {med.ingredients}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-base font-bold text-foreground">
            {formatPKR(med.price!)}
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-bold hover:bg-foreground/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
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

        {/* Red-flag banner (spec FR-8 / A2) */}
        {msg.red_flag && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="text-red-700 font-semibold">
              Possible urgent symptom. If real, call 1122 or seek emergency care immediately.
            </span>
          </motion.div>
        )}

        {/* Medicine product cards — uses backend-enriched data (id, image_url, price, status) */}
        {msg.suggested_medicines && msg.suggested_medicines.length > 0 && (
          <div className="flex gap-2 flex-wrap pt-1">
            {msg.suggested_medicines.map((med: any, j: number) => {
              const normalized: BackendMedicine = typeof med === "string"
                ? { name: med }
                : med;
              return <MedicineSuggestionCard key={normalized.id ?? j} med={normalized} />;
            })}
          </div>
        )}

        {/* Reference image cards (Phase 5) */}
        {msg.image_references && msg.image_references.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {msg.image_references.map((ref, j) => (
              <a
                key={j}
                href={ref.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                title={ref.distinguishing_features}
              >
                <div className="relative aspect-video bg-muted/40 overflow-hidden flex items-center justify-center">
                  {ref.image_url ? (
                    <img
                      src={ref.image_url}
                      alt={ref.condition}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="p-2.5 space-y-1">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{ref.condition}</p>
                  {ref.distinguishing_features && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{ref.distinguishing_features}</p>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-primary pt-0.5">
                    <span className="truncate">{ref.source_domain}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Call-to-action button (e.g. "Book a consultation" on red-flag responses) */}
        {msg.cta && msg.cta.label && msg.cta.url && (
          <Link
            to={msg.cta.url}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all self-start"
          >
            {msg.cta.label}
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
