import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { authHeaders } from "../components/Layout";
import { formatPKR, formatDate } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["pending", "processing", "out_for_delivery", "delivered", "cancelled"];

const statusColor: Record<string, string> = {
  pending:          "bg-yellow-500/10 text-yellow-600",
  processing:       "bg-blue-500/10 text-blue-600",
  out_for_delivery: "bg-purple-500/10 text-purple-600",
  delivered:        "bg-emerald-500/10 text-emerald-600",
  cancelled:        "bg-destructive/10 text-destructive",
};

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/orders", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders ?? d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/admin/api/orders/${id}/status`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    toast({ title: `Order #${id} → ${status.replace(/_/g, " ")}` });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">{orders.length} orders total</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground"><ShoppingCart className="w-12 h-12 mb-4 opacity-30" /><p>No orders found</p></div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-heading font-bold">Order #{o.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor[o.status] ?? "bg-muted text-muted-foreground"}`}>
                      {o.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{o.customer?.name ?? o.customer_name ?? "—"} — {o.address}</p>
                  <p className="text-sm font-semibold text-primary mt-1">{formatPKR(o.total_amount ?? 0)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{o.created_at ? formatDate(o.created_at) : ""}</p>
                </div>
                <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                  <SelectTrigger className="w-44 rounded-xl h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
