import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { authHeaders } from "../components/Layout";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/users", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setUsers(d.users ?? d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const roleColor: Record<string, string> = {
    admin:   "bg-destructive/10 text-destructive",
    doctor:  "bg-blue-500/10 text-blue-600",
    patient: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} registered users</p>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground"><Users className="w-12 h-12 mb-4 opacity-30" /><p>No users found</p></div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  {["ID", "Name", "Email", "Role", "Phone", "Joined"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">#{u.id}</td>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColor[u.role] ?? "bg-muted text-muted-foreground"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en-PK") : "—"}
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
