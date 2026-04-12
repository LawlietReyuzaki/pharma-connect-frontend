import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Calendar, Stethoscope, Star, MessageSquare,
  Settings, LogOut, Lock, Mail, Menu, X, Users, ChevronRight,
  Plus, Trash2, Check, Reply, Eye, EyeOff, RefreshCw, Building2, Phone, MapPin, Clock,
  Shield, AlertCircle, Camera, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatPKR, formatDate } from "@/lib/api";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface PharmacyAdmin {
  id: number;
  name: string;
  email: string;
  pharmacy_id: number;
  pharmacy_name: string;
}

interface Stats {
  total_orders: number;
  pending_orders: number;
  total_appointments: number;
  total_doctors: number;
  avg_rating: number;
  review_count: number;
  total_chat_logs: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: string;
  created_at: string;
}

interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason?: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience_years?: number;
  qualification?: string;
  fee?: number;
  photo_path?: string;
  phone?: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  owner_reply?: string;
  user_name: string;
  created_at: string;
}

interface ChatLog {
  id: number;
  message: string;
  response: string;
  created_at: string;
  user_name?: string;
}

type Panel = "overview" | "orders" | "appointments" | "doctors" | "reviews" | "chats" | "settings";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const getToken = () => localStorage.getItem("pharmacy_admin_token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/* ── StatusBadge ──────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-info/10 text-info",
    completed: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
    delivered: "bg-success/10 text-success",
    processing: "bg-primary/10 text-primary",
    scheduled: "bg-info/10 text-info",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

/* ── StatCard ─────────────────────────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-shadow">
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

/* ── Login Screen ─────────────────────────────────────────────────────────── */

function LoginScreen({ onLogin }: { onLogin: (a: PharmacyAdmin, t: string) => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setPendingEmail(null);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    try {
      const res = await fetch("/pharmacy-admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: fd.get("password") }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.admin, data.token);
        toast({ title: `Welcome, ${data.admin.name}!` });
      } else if (res.status === 403) {
        // Pharmacy exists but is pending approval
        setPendingEmail(email);
      } else {
        // 401 wrong credentials, or other error
        setErrorMsg(data.error || "Invalid email or password.");
      }
    } catch {
      setErrorMsg("Connection error. Is the server running?");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold">Pharmacy Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to manage your pharmacy</p>
        </div>

        {/* Pending approval banner */}
        {pendingEmail && (
          <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-warning">Application Under Review</p>
                <p className="text-muted-foreground mt-1">
                  Your pharmacy account (<strong>{pendingEmail}</strong>) is awaiting super admin approval.
                  You will be able to log in once approved.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Already approved? Make sure you're using the correct email and password.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wrong credentials error */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input name="email" type="email" placeholder="admin@yourpharmacy.com" required className="pl-10" />
            </div>
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input name="password" type={showPwd ? "text" : "password"} placeholder="••••••••" required className="pl-10 pr-10" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl h-11" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/pharmacy/register" className="text-xs text-primary hover:underline">
            Don't have an account? Register your pharmacy
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────────────────── */

export default function PharmacyAdminDashboard() {
  const { toast } = useToast();

  const [admin, setAdmin] = useState<PharmacyAdmin | null>(() => {
    try { return JSON.parse(localStorage.getItem("pharmacy_admin") || "null"); }
    catch { return null; }
  });

  const [panel, setPanel] = useState<Panel>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [chats, setChats] = useState<ChatLog[]>([]);

  const [newDoctor, setNewDoctor] = useState({ name: "", email: "", specialization: "", experience_years: "", qualification: "", phone: "" });
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [profileForm, setProfileForm] = useState({ phone: "", address: "", operating_hours: "" });
  const [profilePhotos, setProfilePhotos] = useState<{ owner_photo?: File; pharmacy_photo?: File }>({});
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<{ owner?: string; pharmacy?: string }>({});
  const [doctorPhotoUploading, setDoctorPhotoUploading] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const ownerPhotoRef = useRef<HTMLInputElement>(null);
  const pharmacyPhotoRef = useRef<HTMLInputElement>(null);
  const doctorPhotoRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleLogin = (a: PharmacyAdmin, token: string) => {
    localStorage.setItem("pharmacy_admin_token", token);
    localStorage.setItem("pharmacy_admin", JSON.stringify(a));
    setAdmin(a);
  };

  const handleLogout = () => {
    localStorage.removeItem("pharmacy_admin_token");
    localStorage.removeItem("pharmacy_admin");
    setAdmin(null);
  };

  const apiFetch = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...(options?.headers || {}) } });
    return res.json();
  }, []);

  const apiFetchFormData = useCallback(async (url: string, formData: FormData) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    return res.json();
  }, []);

  useEffect(() => {
    if (!admin) return;
    const load = async () => {
      try {
        if (panel === "overview") {
          const d = await apiFetch("/pharmacy-admin/api/stats");
          if (d.success) setStats(d.stats);
        } else if (panel === "orders") {
          const d = await apiFetch("/pharmacy-admin/api/orders");
          if (d.success) setOrders(d.orders || []);
        } else if (panel === "appointments") {
          const d = await apiFetch("/pharmacy-admin/api/appointments");
          if (d.success) setAppointments(d.appointments || []);
        } else if (panel === "doctors") {
          const d = await apiFetch("/pharmacy-admin/api/doctors");
          if (d.success) setDoctors(d.doctors || []);
        } else if (panel === "reviews") {
          const d = await apiFetch("/pharmacy-admin/api/reviews");
          if (d.success) setReviews(d.reviews || []);
        } else if (panel === "chats") {
          const d = await apiFetch("/pharmacy-admin/api/chatlogs");
          if (d.success) setChats(d.logs || []);
        } else if (panel === "settings") {
          const d = await apiFetch("/pharmacy-admin/api/profile");
          if (d.success && d.pharmacy) {
            setProfileForm({
              phone: d.pharmacy.phone || "",
              address: d.pharmacy.address || "",
              operating_hours: d.pharmacy.operating_hours || "",
            });
            setProfilePhotoPreview({
              owner: d.pharmacy.owner_photo_path || undefined,
              pharmacy: d.pharmacy.pharmacy_photo_path || undefined,
            });
          }
        }
      } catch { /* ignore */ }
    };
    load();
  }, [panel, admin, apiFetch]);

  const addDoctor = async () => {
    if (!newDoctor.name || !newDoctor.specialization || !newDoctor.email) return;
    setLoadingAction(true);
    const data = await apiFetch("/pharmacy-admin/api/doctors", {
      method: "POST",
      body: JSON.stringify({
        name: newDoctor.name,
        email: newDoctor.email,
        specialization: newDoctor.specialization,
        experience_years: newDoctor.experience_years ? parseInt(newDoctor.experience_years) : undefined,
        qualification: newDoctor.qualification || undefined,
        phone: newDoctor.phone || undefined,
      }),
    });
    if (data.success) {
      toast({ title: "Doctor added!" });
      setDoctors((prev) => [...prev, data.doctor]);
      setNewDoctor({ name: "", email: "", specialization: "", experience_years: "", qualification: "", phone: "" });
    } else {
      toast({ title: data.error || data.message || "Failed", variant: "destructive" });
    }
    setLoadingAction(false);
  };

  const uploadDoctorPhoto = async (doctorId: number, file: File) => {
    setDoctorPhotoUploading(doctorId);
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const res = await fetch(`/pharmacy-admin/api/doctors/${doctorId}/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Photo uploaded!" });
        setDoctors((prev) => prev.map((d) => d.id === doctorId ? { ...d, photo_path: data.photo_path } : d));
      } else {
        toast({ title: data.error || "Upload failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setDoctorPhotoUploading(null);
  };

  const deleteDoctor = async (id: number) => {
    const data = await apiFetch(`/pharmacy-admin/api/doctors/${id}`, { method: "DELETE" });
    if (data.success) {
      toast({ title: "Doctor removed" });
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const submitReply = async (reviewId: number) => {
    const reply = replyText[reviewId];
    if (!reply?.trim()) return;
    const data = await apiFetch(`/pharmacy-admin/api/reviews/${reviewId}/reply`, {
      method: "POST",
      body: JSON.stringify({ reply }),
    });
    if (data.success) {
      toast({ title: "Reply posted!" });
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, owner_reply: reply } : r));
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    }
  };

  const updateProfile = async () => {
    setLoadingAction(true);
    const fd = new FormData();
    fd.append("phone", profileForm.phone);
    fd.append("address", profileForm.address);
    fd.append("operating_hours", profileForm.operating_hours);
    if (profilePhotos.owner_photo) fd.append("owner_photo", profilePhotos.owner_photo);
    if (profilePhotos.pharmacy_photo) fd.append("pharmacy_photo", profilePhotos.pharmacy_photo);
    const data = await apiFetchFormData("/pharmacy-admin/api/profile", fd);
    if (data.success) {
      toast({ title: "Profile updated!" });
      setProfilePhotos({});
    } else {
      toast({ title: data.error || data.message || "Failed", variant: "destructive" });
    }
    setLoadingAction(false);
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    const data = await apiFetch(`/pharmacy-admin/api/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    if (data.success) setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  };

  if (!admin) return <LoginScreen onLogin={handleLogin} />;

  const navItems: { id: Panel; icon: React.ElementType; label: string }[] = [
    { id: "overview",     icon: LayoutDashboard, label: "Overview" },
    { id: "orders",       icon: ShoppingBag,     label: "Orders" },
    { id: "appointments", icon: Calendar,         label: "Appointments" },
    { id: "doctors",      icon: Stethoscope,      label: "Doctors" },
    { id: "reviews",      icon: Star,             label: "Reviews" },
    { id: "chats",        icon: MessageSquare,    label: "Chat Logs" },
    { id: "settings",     icon: Settings,         label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-pharmacy-dark border-r border-pharmacy-dark-foreground/10 z-50 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-5 border-b border-pharmacy-dark-foreground/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-pharmacy-dark-foreground font-heading font-bold text-sm truncate">{admin.pharmacy_name}</p>
              <p className="text-pharmacy-dark-foreground/40 text-xs truncate">{admin.email}</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-pharmacy-dark-foreground/50">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setPanel(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                panel === item.id
                  ? "bg-primary/15 text-primary"
                  : "text-pharmacy-dark-foreground/60 hover:text-pharmacy-dark-foreground hover:bg-pharmacy-dark-foreground/5"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              {panel === item.id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-pharmacy-dark-foreground/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-pharmacy-dark-foreground/60 hover:text-pharmacy-dark-foreground hover:bg-pharmacy-dark-foreground/5 transition-all">
            <Building2 className="w-4 h-4" /> Back to Platform
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold capitalize">{panel}</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 bg-success/10 text-success text-xs font-semibold px-3 py-1 rounded-full">
              <Shield className="w-3 h-3" /> Admin
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={panel} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Overview */}
              {panel === "overview" && (
                <div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Orders"   value={stats?.total_orders || 0}       icon={ShoppingBag}   color="bg-primary/10 text-primary" />
                    <StatCard label="Pending"        value={stats?.pending_orders || 0}     icon={AlertCircle}   color="bg-warning/10 text-warning" />
                    <StatCard label="Appointments"   value={stats?.total_appointments || 0} icon={Calendar}      color="bg-info/10 text-info" />
                    <StatCard label="Doctors"        value={stats?.total_doctors || 0}      icon={Stethoscope}   color="bg-success/10 text-success" />
                    <StatCard label="Avg Rating"     value={stats ? `${(stats.avg_rating || 0).toFixed(1)} ★` : "—"} icon={Star} color="bg-warning/10 text-warning" />
                    <StatCard label="Reviews"        value={stats?.review_count || 0}       icon={MessageSquare} color="bg-violet-500/10 text-violet-500" />
                    <StatCard label="Chat Sessions"  value={stats?.total_chat_logs || 0}    icon={MessageSquare} color="bg-teal-500/10 text-teal-500" />
                    <StatCard label="Team"           value={stats?.total_doctors || 0}      icon={Users}         color="bg-rose-500/10 text-rose-500" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-heading font-bold mb-1">Welcome back, {admin.name}!</h3>
                    <p className="text-muted-foreground text-sm">Manage your pharmacy operations from this dashboard.</p>
                  </div>
                </div>
              )}

              {/* Orders */}
              {panel === "orders" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-heading font-bold text-lg">Orders ({orders.length})</h2>
                    <Button size="sm" variant="outline" className="gap-2 rounded-xl"
                      onClick={() => apiFetch("/pharmacy-admin/api/orders").then((d) => { if (d.success) setOrders(d.orders || []); })}
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                  </div>
                  {orders.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <ShoppingBag className="w-14 h-14 mx-auto mb-3 opacity-20" /><p>No orders yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-heading font-bold text-sm">#{order.id}</span>
                              <StatusBadge status={order.status} />
                            </div>
                            <p className="text-sm font-medium">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_phone} · {formatDate(order.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-heading font-bold text-primary">{formatPKR(order.total)}</span>
                            <div className="flex gap-1">
                              {order.status !== "processing" && (
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs rounded-lg" onClick={() => updateOrderStatus(order.id, "processing")}>Process</Button>
                              )}
                              {order.status !== "delivered" && (
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs rounded-lg" onClick={() => updateOrderStatus(order.id, "delivered")}>Deliver</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Appointments */}
              {panel === "appointments" && (
                <div>
                  <h2 className="font-heading font-bold text-lg mb-5">Appointments ({appointments.length})</h2>
                  {appointments.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <Calendar className="w-14 h-14 mx-auto mb-3 opacity-20" /><p>No appointments yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((apt) => (
                        <div key={apt.id} className="bg-card border border-border rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-heading font-bold text-sm">#{apt.id}</span>
                            <StatusBadge status={apt.status} />
                          </div>
                          <p className="text-sm font-medium">{apt.patient_name}</p>
                          <p className="text-xs text-muted-foreground">Dr. {apt.doctor_name} · {apt.appointment_date} at {apt.appointment_time}</p>
                          {apt.reason && <p className="text-xs text-muted-foreground mt-1">Reason: {apt.reason}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Doctors */}
              {panel === "doctors" && (
                <div>
                  <h2 className="font-heading font-bold text-lg mb-5">Doctors ({doctors.length})</h2>
                  <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                    <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Add New Doctor</h3>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div><Label className="text-xs">Name *</Label><Input value={newDoctor.name} onChange={(e) => setNewDoctor((p) => ({ ...p, name: e.target.value }))} placeholder="Dr. Full Name" className="mt-1 h-9 text-sm" /></div>
                      <div><Label className="text-xs">Email *</Label><Input type="email" value={newDoctor.email} onChange={(e) => setNewDoctor((p) => ({ ...p, email: e.target.value }))} placeholder="doctor@email.com" className="mt-1 h-9 text-sm" /></div>
                      <div><Label className="text-xs">Specialization *</Label><Input value={newDoctor.specialization} onChange={(e) => setNewDoctor((p) => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Cardiologist" className="mt-1 h-9 text-sm" /></div>
                      <div><Label className="text-xs">Qualification</Label><Input value={newDoctor.qualification} onChange={(e) => setNewDoctor((p) => ({ ...p, qualification: e.target.value }))} placeholder="MBBS, FCPS..." className="mt-1 h-9 text-sm" /></div>
                      <div><Label className="text-xs">Experience (years)</Label><Input type="number" value={newDoctor.experience_years} onChange={(e) => setNewDoctor((p) => ({ ...p, experience_years: e.target.value }))} placeholder="5" className="mt-1 h-9 text-sm" /></div>
                      <div><Label className="text-xs">Phone</Label><Input value={newDoctor.phone} onChange={(e) => setNewDoctor((p) => ({ ...p, phone: e.target.value }))} placeholder="03XX-XXXXXXX" className="mt-1 h-9 text-sm" /></div>
                    </div>
                    <Button onClick={addDoctor} size="sm" disabled={!newDoctor.name || !newDoctor.email || !newDoctor.specialization || loadingAction} className="bg-primary text-primary-foreground rounded-lg gap-2">
                      <Plus className="w-3.5 h-3.5" /> {loadingAction ? "Adding..." : "Add Doctor"}
                    </Button>
                  </div>
                  {doctors.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground"><Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No doctors yet.</p></div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {doctors.map((doc) => (
                        <div key={doc.id} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
                          {/* Doctor photo with upload overlay */}
                          <div className="relative shrink-0 group">
                            {doc.photo_path ? (
                              <img src={doc.photo_path} alt={doc.name} className="w-14 h-14 rounded-xl object-cover" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">{doc.name.charAt(0)}</div>
                            )}
                            <button
                              onClick={() => doctorPhotoRefs.current[doc.id]?.click()}
                              className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              title="Upload photo"
                            >
                              {doctorPhotoUploading === doc.id
                                ? <RefreshCw className="w-4 h-4 text-white animate-spin" />
                                : <Camera className="w-4 h-4 text-white" />}
                            </button>
                            <input
                              ref={(el) => { doctorPhotoRefs.current[doc.id] = el; }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadDoctorPhoto(doc.id, file);
                                e.target.value = "";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-bold text-sm truncate">{doc.name}</p>
                            <p className="text-xs text-primary font-medium">{doc.specialization}</p>
                            {doc.qualification && <p className="text-xs text-muted-foreground">{doc.qualification}</p>}
                            {doc.experience_years && <p className="text-xs text-muted-foreground">{doc.experience_years} yrs exp</p>}
                            <button
                              onClick={() => doctorPhotoRefs.current[doc.id]?.click()}
                              className="mt-1 text-[10px] text-primary/70 hover:text-primary flex items-center gap-1 transition-colors"
                            >
                              <Upload className="w-2.5 h-2.5" /> {doc.photo_path ? "Change photo" : "Upload photo"}
                            </button>
                          </div>
                          <button onClick={() => deleteDoctor(doc.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews */}
              {panel === "reviews" && (
                <div>
                  <h2 className="font-heading font-bold text-lg mb-5">Reviews ({reviews.length})</h2>
                  {reviews.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground"><Star className="w-14 h-14 mx-auto mb-3 opacity-20" /><p>No reviews yet.</p></div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="bg-card border border-border rounded-2xl p-5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="font-semibold text-sm">{rev.user_name || "Patient"}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(rev.created_at)}</p>
                            </div>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((n) => (
                                <Star key={n} className="w-3.5 h-3.5" style={{ color: n <= rev.rating ? "#f59e0b" : "#d1d5db", fill: n <= rev.rating ? "#f59e0b" : "transparent" }} />
                              ))}
                            </div>
                          </div>
                          {rev.comment && <p className="text-sm text-muted-foreground mb-3">{rev.comment}</p>}
                          {rev.owner_reply ? (
                            <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                              <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1"><Reply className="w-3 h-3" /> Your Reply</p>
                              <p className="text-sm text-muted-foreground">{rev.owner_reply}</p>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input value={replyText[rev.id] || ""} onChange={(e) => setReplyText((p) => ({ ...p, [rev.id]: e.target.value }))} placeholder="Write a reply..." className="h-9 text-sm flex-1" />
                              <Button size="sm" onClick={() => submitReply(rev.id)} disabled={!replyText[rev.id]?.trim()} className="bg-primary text-primary-foreground rounded-lg h-9 px-3 gap-1.5 text-xs">
                                <Reply className="w-3.5 h-3.5" /> Reply
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chat Logs */}
              {panel === "chats" && (
                <div>
                  <h2 className="font-heading font-bold text-lg mb-5">Chat Logs ({chats.length})</h2>
                  {chats.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground"><MessageSquare className="w-14 h-14 mx-auto mb-3 opacity-20" /><p>No chat logs yet.</p></div>
                  ) : (
                    <div className="space-y-3">
                      {chats.map((chat) => (
                        <div key={chat.id} className="bg-card border border-border rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">{chat.user_name || "Patient"} · {formatDate(chat.created_at)}</span>
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium mb-1"><span className="text-primary text-xs font-semibold mr-1">Q:</span>{chat.message}</p>
                          <p className="text-sm text-muted-foreground"><span className="text-success text-xs font-semibold mr-1">A:</span>{chat.response?.substring(0, 200)}{(chat.response?.length || 0) > 200 ? "…" : ""}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              {panel === "settings" && (
                <div className="max-w-2xl">
                  <h2 className="font-heading font-bold text-lg mb-5">Profile Settings</h2>

                  {/* Photo uploads */}
                  <div className="bg-card border border-border rounded-2xl p-6 mb-5">
                    <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><Camera className="w-4 h-4 text-primary" /> Photos</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Pharmacy photo */}
                      <div>
                        <Label className="text-xs mb-2 block">Pharmacy Photo</Label>
                        <div
                          className="relative w-full h-36 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer overflow-hidden transition-colors group"
                          onClick={() => pharmacyPhotoRef.current?.click()}
                        >
                          {profilePhotoPreview.pharmacy || profilePhotos.pharmacy_photo ? (
                            <img
                              src={profilePhotos.pharmacy_photo ? URL.createObjectURL(profilePhotos.pharmacy_photo) : profilePhotoPreview.pharmacy}
                              alt="Pharmacy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                              <Building2 className="w-8 h-8 mb-2 opacity-40" />
                              <span className="text-xs">Click to upload</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <input ref={pharmacyPhotoRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setProfilePhotos((p) => ({ ...p, pharmacy_photo: f }));
                          }}
                        />
                        {profilePhotos.pharmacy_photo && (
                          <p className="text-xs text-primary mt-1 truncate">{profilePhotos.pharmacy_photo.name}</p>
                        )}
                      </div>

                      {/* Owner photo */}
                      <div>
                        <Label className="text-xs mb-2 block">Owner Photo</Label>
                        <div
                          className="relative w-full h-36 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer overflow-hidden transition-colors group"
                          onClick={() => ownerPhotoRef.current?.click()}
                        >
                          {profilePhotoPreview.owner || profilePhotos.owner_photo ? (
                            <img
                              src={profilePhotos.owner_photo ? URL.createObjectURL(profilePhotos.owner_photo) : profilePhotoPreview.owner}
                              alt="Owner"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                              <Users className="w-8 h-8 mb-2 opacity-40" />
                              <span className="text-xs">Click to upload</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <input ref={ownerPhotoRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setProfilePhotos((p) => ({ ...p, owner_photo: f }));
                          }}
                        />
                        {profilePhotos.owner_photo && (
                          <p className="text-xs text-primary mt-1 truncate">{profilePhotos.owner_photo.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Text fields */}
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h3 className="font-heading font-semibold text-sm mb-1 flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Contact & Hours</h3>
                    <div>
                      <Label>Phone Number</Label>
                      <div className="relative mt-1"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} placeholder="051-XXXXXXX" className="pl-10" /></div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <div className="relative mt-1"><MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea value={profileForm.address} onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))} placeholder="Full address" className="pl-10 min-h-[72px] resize-none" /></div>
                    </div>
                    <div>
                      <Label>Operating Hours</Label>
                      <div className="relative mt-1"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={profileForm.operating_hours} onChange={(e) => setProfileForm((p) => ({ ...p, operating_hours: e.target.value }))} placeholder="9:00 AM – 10:00 PM" className="pl-10" /></div>
                    </div>
                    <Button onClick={updateProfile} disabled={loadingAction} className="bg-primary text-primary-foreground rounded-xl gap-2 w-full">
                      <Check className="w-4 h-4" /> {loadingAction ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
