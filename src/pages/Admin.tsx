import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Package, Calendar, CreditCard, MessageSquare, Clock, LogOut, Shield, TrendingUp, ChevronRight, Eye, Check, X, Trash2, Plus, Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatPKR, formatDate } from "@/lib/api";

type Tab = "overview" | "users" | "medicines" | "orders" | "appointments" | "payments" | "timeslots" | "chatlogs";

const tabs: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "users", label: "Users", icon: Users },
  { key: "medicines", label: "Medicines", icon: Package },
  { key: "orders", label: "Orders", icon: TrendingUp },
  { key: "appointments", label: "Appointments", icon: Calendar },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "timeslots", label: "Time Slots", icon: Clock },
  { key: "chatlogs", label: "Chat Logs", icon: MessageSquare },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("admin_token"));
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const { toast } = useToast();

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        setAdminToken(data.token);
        toast({ title: "Admin access granted" });
      } else {
        toast({ title: "Login failed", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
    setLoginLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAdminToken(null);
  };

  useEffect(() => {
    if (!adminToken) return;
    if (activeTab === "overview") {
      fetch("/admin/api/stats", { headers }).then((r) => r.json()).then(setStats).catch(() => {});
    } else if (activeTab === "users") {
      fetch("/admin/api/users", { headers }).then((r) => r.json()).then((d) => setUsers(d.users || d || [])).catch(() => {});
    } else if (activeTab === "medicines") {
      fetch("/admin/api/medicines", { headers }).then((r) => r.json()).then((d) => setMedicines(d.medicines || d || [])).catch(() => {});
    } else if (activeTab === "orders") {
      fetch("/admin/api/orders", { headers }).then((r) => r.json()).then((d) => setOrders(d.orders || d || [])).catch(() => {});
    } else if (activeTab === "appointments") {
      fetch("/admin/api/appointments", { headers }).then((r) => r.json()).then((d) => setAppointments(d.appointments || d || [])).catch(() => {});
    } else if (activeTab === "payments") {
      fetch("/admin/api/payments/pending", { headers }).then((r) => r.json()).then((d) => setPendingPayments(d.payments || d || [])).catch(() => {});
    } else if (activeTab === "timeslots") {
      fetch("/admin/api/time-slots", { headers }).then((r) => r.json()).then((d) => setTimeSlots(d.slots || d || [])).catch(() => {});
    } else if (activeTab === "chatlogs") {
      fetch("/admin/api/chat-logs", { headers }).then((r) => r.json()).then((d) => setChatLogs(d.logs || d || [])).catch(() => {});
    }
  }, [adminToken, activeTab]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await fetch(`/admin/api/orders/${orderId}/status`, { method: "PUT", headers, body: JSON.stringify({ status }) });
      toast({ title: `Order #${orderId} → ${status}` });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch {}
  };

  const approvePayment = async (id: number) => {
    await fetch(`/admin/api/payments/${id}/approve`, { method: "POST", headers });
    toast({ title: "Payment approved" });
    setPendingPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const declinePayment = async (id: number) => {
    await fetch(`/admin/api/payments/${id}/decline`, { method: "POST", headers, body: JSON.stringify({ reason: "Receipt invalid" }) });
    toast({ title: "Payment declined" });
    setPendingPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const approveAppointment = async (id: number) => {
    await fetch(`/admin/api/appointments/${id}/approve`, { method: "PUT", headers });
    toast({ title: "Appointment approved" });
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, approval_status: "approved" } : a)));
  };

  const declineAppointment = async (id: number) => {
    await fetch(`/admin/api/appointments/${id}/decline`, { method: "PUT", headers });
    toast({ title: "Appointment declined" });
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, approval_status: "declined" } : a)));
  };

  if (!adminToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-heading font-bold text-center mb-6">Admin Dashboard</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div><Label>Email</Label><Input value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} type="email" required /></div>
              <div><Label>Password</Label><Input value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} type="password" required /></div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl" disabled={loginLoading}>
                {loginLoading ? "Signing in..." : "Admin Sign In"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 hidden lg:flex">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-xs">RD</span>
            </div>
            <div>
              <p className="font-heading font-bold text-sm">Admin Panel</p>
              <p className="text-[10px] text-muted-foreground">Red Dot Pharmacy</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile tabs */}
        <div className="lg:hidden overflow-x-auto border-b border-border bg-card p-2 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium ${
                activeTab === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview */}
          {activeTab === "overview" && stats && (
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Dashboard Overview</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Users", value: stats.total_users || stats.users || 0, color: "text-info" },
                  { label: "Total Orders", value: stats.total_orders || stats.orders || 0, color: "text-success" },
                  { label: "Pending Orders", value: stats.pending_orders || 0, color: "text-warning" },
                  { label: "Revenue", value: formatPKR(stats.total_revenue || stats.revenue || 0), color: "text-primary" },
                ].map((card) => (
                  <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className={`text-2xl font-heading font-bold mt-1 ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Users</h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-semibold">Name</th><th className="text-left px-4 py-3 font-semibold">Email</th><th className="text-left px-4 py-3 font-semibold">Role</th><th className="text-left px-4 py-3 font-semibold">Phone</th></tr></thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{u.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{u.role}</span></td>
                          <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Medicines */}
          {activeTab === "medicines" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold">Medicines</h2>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-semibold">Medicine</th><th className="text-left px-4 py-3 font-semibold">Category</th><th className="text-left px-4 py-3 font-semibold">Price</th><th className="text-left px-4 py-3 font-semibold">Stock</th><th className="text-left px-4 py-3 font-semibold">Status</th></tr></thead>
                    <tbody>
                      {medicines.map((m: any) => (
                        <tr key={m.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{m.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.category}</td>
                          <td className="px-4 py-3 font-semibold text-primary">{formatPKR(m.price)}</td>
                          <td className="px-4 py-3">{m.stock_quantity}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.status === "in_stock" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Orders</h2>
              <div className="space-y-3">
                {orders.map((o: any) => (
                  <div key={o.id} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <p className="font-heading font-bold">Order #{o.id}</p>
                        <p className="text-sm text-muted-foreground">{o.customer?.name || o.customer_name} — {o.address}</p>
                        <p className="text-sm font-semibold text-primary mt-1">{formatPKR(o.total_amount)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={o.status} onValueChange={(v) => updateOrderStatus(o.id, v)}>
                          <SelectTrigger className="w-40 rounded-lg h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["pending", "processing", "out_for_delivery", "delivered", "cancelled"].map((s) => (
                              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments */}
          {activeTab === "appointments" && (
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Appointments</h2>
              <div className="space-y-3">
                {appointments.map((a: any) => (
                  <div key={a.id} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <p className="font-heading font-bold">{a.patient_name || a.patient?.name} → {a.doctor_name || a.doctor?.name}</p>
                        <p className="text-sm text-muted-foreground">{a.symptoms}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${a.approval_status === "approved" ? "bg-success/10 text-success" : a.approval_status === "declined" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                          {a.approval_status || "pending"}
                        </span>
                      </div>
                      {(!a.approval_status || a.approval_status === "pending") && (
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" className="bg-success text-success-foreground rounded-lg" onClick={() => approveAppointment(a.id)}>
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive rounded-lg" onClick={() => declineAppointment(a.id)}>
                            <X className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Pending Payments</h2>
              {pendingPayments.length === 0 ? (
                <p className="text-muted-foreground text-center py-16">No pending payments</p>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.map((p: any) => (
                    <div key={p.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <p className="font-heading font-bold">Order #{p.order_id}</p>
                        <p className="text-sm text-muted-foreground">{p.payment_method} — {formatPKR(p.amount || 0)}</p>
                        {p.receipt_path && (
                          <a href={p.receipt_path} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline mt-1 inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> View Receipt
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" className="bg-success text-success-foreground rounded-lg" onClick={() => approvePayment(p.id)}>
                          <Check className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive rounded-lg" onClick={() => declinePayment(p.id)}>
                          <X className="w-3.5 h-3.5 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Time Slots */}
          {activeTab === "timeslots" && (
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Time Slots</h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-semibold">Doctor</th><th className="text-left px-4 py-3 font-semibold">Date</th><th className="text-left px-4 py-3 font-semibold">Time</th><th className="text-left px-4 py-3 font-semibold">Status</th></tr></thead>
                    <tbody>
                      {timeSlots.map((s: any) => (
                        <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{s.doctor_name || "—"}</td>
                          <td className="px-4 py-3">{s.appointment_date}</td>
                          <td className="px-4 py-3">{s.start_time} - {s.end_time}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_booked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                              {s.is_booked ? "Booked" : "Available"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Chat Logs */}
          {activeTab === "chatlogs" && (
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Chat Logs</h2>
              <div className="space-y-3">
                {chatLogs.map((log: any, i: number) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-sm"><strong>Session:</strong> {log.session_id}</p>
                    <p className="text-sm text-muted-foreground mt-1">{log.preview || log.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{log.created_at && formatDate(log.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
