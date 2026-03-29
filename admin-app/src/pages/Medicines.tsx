import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { authHeaders } from "../components/Layout";
import { formatPKR } from "@/lib/api";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/medicines", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setMedicines(d.medicines ?? d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Medicines</h1>
        <p className="text-muted-foreground text-sm mt-1">{medicines.length} medicines in catalogue</p>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : medicines.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground"><Package className="w-12 h-12 mb-4 opacity-30" /><p>No medicines found</p></div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  {["Name", "Category", "Price", "Stock", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medicines.map((m: any) => (
                  <tr key={m.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.category || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{formatPKR(m.price)}</td>
                    <td className="px-4 py-3">{m.stock_quantity ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.status === "in_stock" ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                        {m.status?.replace(/_/g, " ") ?? "—"}
                      </span>
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
