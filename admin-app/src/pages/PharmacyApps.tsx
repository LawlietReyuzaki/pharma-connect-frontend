import { useEffect, useState } from "react";
import { Check, X, RefreshCw, Store, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authHeaders } from "../components/Layout";

type Status = "pending" | "approved" | "suspended";

interface PharmacyApp {
  id: number;
  name: string;
  slug: string;
  owner_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  license_number: string;
  status: Status;
  created_at: string;
}

const STATUS_TABS: { key: Status; label: string }[] = [
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "suspended",label: "Suspended" },
];

const statusStyles: Record<Status, string> = {
  pending:   "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  approved:  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  suspended: "bg-destructive/10 text-destructive",
};

export default function PharmacyAppsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Status>("pending");
  const [apps, setApps] = useState<PharmacyApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<PharmacyApp | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async (status: Status) => {
    setLoading(true);
    try {
      const res = await fetch(`/admin/api/pharmacy-applications?status=${status}`, { headers: authHeaders() });
      const data = await res.json();
      setApps(data.applications ?? []);
    } catch {
      toast({ title: "Failed to load applications", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const approve = async (app: PharmacyApp) => {
    try {
      const res = await fetch(`/admin/api/pharmacy-applications/${app.id}/approve`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: `✅ ${app.name} approved` });
        setApps((prev) => prev.filter((a) => a.id !== app.id));
      } else {
        toast({ title: data.error || "Approval failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    }
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast({ title: "Please enter a rejection reason", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`/admin/api/pharmacy-applications/${rejectTarget.id}/reject`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: `${rejectTarget.name} rejected` });
        setApps((prev) => prev.filter((a) => a.id !== rejectTarget.id));
        setRejectTarget(null);
        setRejectReason("");
      } else {
        toast({ title: data.error || "Rejection failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Pharmacy Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and approve pharmacy registrations</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(tab)} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Store className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-medium">No {tab} applications</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">ID</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Pharmacy</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Owner</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Email</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">City</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">License</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Registered</th>
                  {tab === "pending" && (
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">#{app.id}</td>
                    <td className="px-4 py-3 font-semibold">{app.name}</td>
                    <td className="px-4 py-3">{app.owner_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{app.email}</td>
                    <td className="px-4 py-3">{app.city || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{app.license_number || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString("en-PK") : "—"}
                    </td>
                    {tab === "pending" && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-8 px-3 gap-1.5"
                            onClick={() => approve(app)}
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/30 hover:bg-destructive/5 rounded-lg h-8 px-3 gap-1.5"
                            onClick={() => { setRejectTarget(app); setRejectReason(""); }}
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject modal */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" /> Reject Application
            </DialogTitle>
            <DialogDescription>
              Rejecting <strong>{rejectTarget?.name}</strong>. The pharmacy owner will see this reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={3}
                placeholder="e.g. License number could not be verified."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
              <Button
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={submitReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
