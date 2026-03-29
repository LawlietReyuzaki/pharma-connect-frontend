import { useEffect, useState } from "react";
import { MessageSquare, Flag } from "lucide-react";
import { authHeaders } from "../components/Layout";

export default function ChatLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/chat-logs", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setLogs(d.logs ?? d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Chat Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">{logs.length} conversations</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
          <p>No chat logs found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  {["#", "Message", "Response (preview)", "Lang", "Flagged", "Time"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((l: any) => (
                  <tr key={l.id} className={`border-b border-border hover:bg-muted/30 ${l.flagged ? "bg-destructive/5" : ""}`}>
                    <td className="px-4 py-3 text-muted-foreground">#{l.id}</td>
                    <td className="px-4 py-3 max-w-[220px] truncate" title={l.message}>{l.message}</td>
                    <td className="px-4 py-3 max-w-[260px] truncate text-muted-foreground" title={l.response}>
                      {l.response?.slice(0, 80)}{l.response?.length > 80 ? "…" : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground uppercase">
                        {l.language ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {l.flagged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
                          <Flag className="w-3 h-3" /> Flagged
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                      {l.created_at ? new Date(l.created_at).toLocaleString("en-PK") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
