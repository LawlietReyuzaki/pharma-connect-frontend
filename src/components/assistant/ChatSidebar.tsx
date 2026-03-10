import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Session {
  session_id: string;
  created_at: string;
  preview?: string;
}

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  sessions: Session[];
  onNewChat: () => void;
}

export default function ChatSidebar({ open, onClose, sessions, onNewChat }: ChatSidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed lg:relative z-40 w-72 h-full bg-card border-r border-border flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-border">
              <Button
                className="w-full bg-primary text-primary-foreground rounded-xl font-semibold shadow-sm hover:shadow-md transition-shadow"
                onClick={onNewChat}
              >
                <Plus className="w-4 h-4 mr-2" /> New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {sessions.map((s) => (
                <button
                  key={s.session_id}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-muted text-sm transition-all group"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <p className="truncate font-medium">{s.preview || "Chat session"}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 ml-5.5">
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">No previous sessions</p>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
