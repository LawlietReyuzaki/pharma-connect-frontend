import { useEffect, useState } from "react";
import { Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authHeaders } from "../components/Layout";
import { useToast } from "@/hooks/use-toast";

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/appointments", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setAppts(d.appointments ?? d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const approve = async (id: number) => {
    await fetch(`/admin/api/appointments/${id}/approve`, { method: "PUT", headers: authHeaders() });
    toast({ title: "Appointment approved" });
    setAppts((prev) => prev.map((a) => a.id === id ? { ...a, approval_status: "approved" } : a));
  };

  const decline = async (id: number) => {
    await fetch(`/admin/api/appointments/${id}/decline`, { method: "PUT", headers: authHeaders() });
    toast({ title: "Appointment declined" });
    setAppts((prev) => prev.map((a) => a.id === id ? { ...a, approval_status: "declined" } : a));
  };

  const statusColor: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-600",
    declined: "bg-destructive/10 text-destructive",
    pending:  "bg-yellow-500/10 text-yellow-600",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Appointments</h1>
        <p className="text-muted-foreground text-sm mt-1">{appts.length} appointments</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : appts.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground"><Calendar className="w-12 h-12 mb-4 opacity-30" /><p>No appointments found</p></div>
      ) : (
        <div className="space-y-3">
          {appts.map((a: any) => {
            const apStatus = a.approval_status ?? "pending";
            return (
              <div key={a.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-heading font-bold">
                      {a.patient?.name ?? a.patient_name ?? "Patient"} → {a.doctor?.name ?? a.doctor_name ?? "Doctor"}
                    </p>
                    {a.symptoms && <p className="text-sm text-muted-foreground mt-0.5">{a.symptoms}</p>}
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor[apStatus] ?? "bg-muted text-muted-foreground"}`}>
                      {apStatus}
                    </span>
                  </div>
                  {apStatus === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5 h-8" onClick={() => approve(a.id)}>
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 rounded-lg gap-1.5 h-8" onClick={() => decline(a.id)}>
                        <X className="w-3.5 h-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
