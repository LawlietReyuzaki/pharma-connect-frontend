import { useEffect, useState } from "react";
import { Users, ShoppingCart, TrendingUp, MessageSquare, Store, Clock } from "lucide-react";
import { authHeaders } from "../components/Layout";
import { formatPKR } from "@/lib/api";

interface Stats {
  total_users?: number;
  total_orders?: number;
  pending_orders?: number;
  total_revenue?: number;
  total_chats?: number;
  total_appointments?: number;
  total_pharmacies?: number;
  pending_applications?: number;
  stats?: any;
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-heading font-bold mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [raw, setRaw] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/stats", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setRaw(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Normalise — backend wraps inside d.stats or flat
  const s = raw?.stats ?? raw ?? {};

  const cards = [
    { label: "Total Users",          value: s.users?.total ?? s.total_users ?? 0,                icon: Users,        color: "bg-blue-500/10 text-blue-500" },
    { label: "Total Orders",         value: s.orders?.total ?? s.total_orders ?? 0,              icon: ShoppingCart, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Pending Orders",       value: s.orders?.pending ?? s.pending_orders ?? 0,          icon: Clock,        color: "bg-yellow-500/10 text-yellow-500" },
    { label: "Revenue",              value: formatPKR(s.orders?.revenue ?? s.total_revenue ?? 0),icon: TrendingUp,   color: "bg-primary/10 text-primary" },
    { label: "Total Chats",          value: s.chats?.total ?? s.total_chats ?? 0,                icon: MessageSquare,color: "bg-purple-500/10 text-purple-500" },
    { label: "Appointments",         value: s.appointments?.total ?? s.total_appointments ?? 0,  icon: Store,        color: "bg-pink-500/10 text-pink-500" },
    { label: "Approved Pharmacies",  value: s.total_pharmacies ?? 0,                             icon: Store,        color: "bg-teal-500/10 text-teal-500" },
    { label: "Pending Applications", value: s.pending_applications ?? 0,                         icon: Clock,        color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide overview</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} color={c.color} />
          ))}
        </div>
      )}
    </div>
  );
}
