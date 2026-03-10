import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Wiki {
  title: string;
  page_url: string;
  summary: string;
  images?: string[];
}

interface WikiPanelProps {
  wiki: Wiki | null;
  onClose: () => void;
}

export default function WikiPanel({ wiki, onClose }: WikiPanelProps) {
  return (
    <AnimatePresence>
      {wiki && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border z-50 flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h4 className="font-heading font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Wikipedia
            </h4>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <h5 className="font-heading font-bold text-lg">{wiki.title}</h5>
            {wiki.images?.[0] && (
              <img
                src={wiki.images[0]}
                alt={wiki.title}
                className="w-full rounded-xl object-cover max-h-48 border border-border"
              />
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">{wiki.summary}</p>
            <a
              href={wiki.page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
            >
              Read more on Wikipedia <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
