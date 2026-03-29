import { useEffect, useState } from "react";
import { CreditCard, Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authHeaders } from "../components/Layout";
import { formatPKR } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/payments/pending", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setPayments(d.payments ?? d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const approve = async (id: number) => {
    await fetch(`/admin/api/payments/${id}/approve`, { method: "POST", headers: authHeaders() });
    toast({ title: "Payment approved" });
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const decline = async (id: number) => {
    await fetch(`/admin/api/payments/${id}/decline`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reason: "Receipt could not be verified" }),
    });
    toast({ title: "Payment declined" });
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Pending Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">{payments.length} awaiting review</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground"><CreditCard className="w-12 h-12 mb-4 opacity-30" /><p>No pending payments</p></div>
      ) : (
        <div className="space-y-3">
          {payments.map((p: any) => (
            <div key={p.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-heading font-bold">Order #{p.order_id}</p>
                  <p className="text-sm text-muted-foreground">{p.payment_method} — {formatPKR(p.amount ?? 0)}</p>
                  {p.receipt_path && (
                    <a href={p.receipt_path} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1">
                      <Eye className="w-3.5 h-3.5" /> View Receipt
                    </a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5 h-8" onClick={() => approve(p.id)}>
                    <Check className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30 rounded-lg gap-1.5 h-8" onClick={() => decline(p.id)}>
                    <X className="w-3.5 h-3.5" /> Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
