import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Check, X, Plus, Stethoscope, LogOut, User, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime } from "@/lib/api";

interface DoctorProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  qualification?: string;
  experience_years?: number;
  current_hospital?: string;
}

interface Appointment {
  id: number;
  patient_name?: string;
  patient?: { name: string };
  starts_at?: string;
  start_time?: string;
  status: string;
  approval_status?: string;
  symptoms?: string;
  google_meet_link?: string;
}

interface TimeSlot {
  id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  can_delete: boolean;
}

type Tab = "appointments" | "timeslots" | "profile";

export default function DoctorDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [aptStats, setAptStats] = useState<any>({});
  const [aptFilter, setAptFilter] = useState("all");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [slotStats, setSlotStats] = useState<any>({});
  const [slotDate, setSlotDate] = useState("");
  const [newSlot, setNewSlot] = useState({ date: "", start: "", end: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [setupForm, setSetupForm] = useState({ email: "", password: "", confirm: "" });
  const { toast } = useToast();

  const headers: HeadersInit = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/doctor/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.doctor));
        setToken(data.token);
        setDoctor(data.doctor);
        toast({ title: `Welcome, Dr. ${data.doctor.name}!` });
      } else {
        toast({ title: "Login failed", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
    setLoginLoading(false);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupForm.password !== setupForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/doctor/api/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: setupForm.email, password: setupForm.password, confirm_password: setupForm.confirm }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.doctor));
        setToken(data.token);
        setDoctor(data.doctor);
        toast({ title: "Password set! Welcome." });
      } else {
        toast({ title: "Setup failed", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setToken(null);
    setDoctor(null);
  };

  // Load profile
  useEffect(() => {
    if (!token) return;
    fetch("/doctor/api/profile", { headers })
      .then((r) => r.json())
      .then((d) => { if (d.doctor) setDoctor(d.doctor); else { logout(); } })
      .catch(() => logout());
  }, [token]);

  // Load data based on tab
  useEffect(() => {
    if (!token) return;
    if (activeTab === "appointments") {
      const params = aptFilter !== "all" ? `?status=${aptFilter}` : "";
      fetch(`/doctor/api/appointments${params}`, { headers })
        .then((r) => r.json())
        .then((d) => {
          setAppointments(d.appointments || []);
          setAptStats(d.stats || {});
        })
        .catch(() => {});
    } else if (activeTab === "timeslots") {
      const params = slotDate ? `?date=${slotDate}` : "";
      fetch(`/doctor/api/time-slots${params}`, { headers })
        .then((r) => r.json())
        .then((d) => {
          setTimeSlots(d.slots || []);
          setSlotStats(d.stats || {});
        })
        .catch(() => {});
    }
  }, [token, activeTab, aptFilter, slotDate]);

  const approveApt = async (id: number) => {
    await fetch(`/doctor/api/appointments/${id}/approve`, { method: "POST", headers });
    toast({ title: "Approved" });
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, approval_status: "approved" } : a)));
  };

  const declineApt = async (id: number) => {
    await fetch(`/doctor/api/appointments/${id}/decline`, { method: "POST", headers });
    toast({ title: "Declined" });
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, approval_status: "declined" } : a)));
  };

  const completeApt = async (id: number) => {
    await fetch(`/doctor/api/appointments/${id}/complete`, { method: "POST", headers });
    toast({ title: "Completed" });
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "completed" } : a)));
  };

  const createSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/doctor/api/time-slots", {
        method: "POST",
        headers,
        body: JSON.stringify({ appointment_date: newSlot.date, start_time: newSlot.start, end_time: newSlot.end }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Time slot created" });
        setNewSlot({ date: "", start: "", end: "" });
        // Refresh
        setSlotDate(newSlot.date);
      } else {
        toast({ title: "Failed", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
  };

  const deleteSlot = async (id: number) => {
    await fetch(`/doctor/api/time-slots/${id}`, { method: "DELETE", headers });
    toast({ title: "Slot deleted" });
    setTimeSlots((prev) => prev.filter((s) => s.id !== id));
  };

  if (!token || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-heading font-bold text-center mb-6">Doctor Dashboard</h2>

            {!isSetup ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div><Label>Email</Label><Input value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} type="email" required /></div>
                <div><Label>Password</Label><Input value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} type="password" required /></div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl" disabled={loginLoading}>
                  {loginLoading ? "Signing in..." : "Doctor Sign In"}
                </Button>
                <button type="button" className="w-full text-sm text-primary" onClick={() => setIsSetup(true)}>First time? Set up password</button>
              </form>
            ) : (
              <form onSubmit={handleSetup} className="space-y-4">
                <div><Label>Email</Label><Input value={setupForm.email} onChange={(e) => setSetupForm((p) => ({ ...p, email: e.target.value }))} type="email" required /></div>
                <div><Label>New Password</Label><Input value={setupForm.password} onChange={(e) => setSetupForm((p) => ({ ...p, password: e.target.value }))} type="password" required /></div>
                <div><Label>Confirm Password</Label><Input value={setupForm.confirm} onChange={(e) => setSetupForm((p) => ({ ...p, confirm: e.target.value }))} type="password" required /></div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl">Set Up Password</Button>
                <button type="button" className="w-full text-sm text-muted-foreground" onClick={() => setIsSetup(false)}>Back to login</button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-heading font-bold">
              {doctor.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-heading font-bold">Dr. {doctor.name}</h2>
              <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card px-6">
        <div className="flex gap-1">
          {(["appointments", "timeslots", "profile"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "timeslots" ? "Time Slots" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Appointments */}
        {activeTab === "appointments" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-bold text-primary">{aptStats.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-bold text-warning">{aptStats.pending || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-bold text-success">{aptStats.approved || 0}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
              {["all", "pending", "scheduled", "completed"].map((f) => (
                <button key={f} onClick={() => setAptFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${aptFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {appointments.map((a) => (
                <div key={a.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <p className="font-heading font-bold">{a.patient_name || a.patient?.name}</p>
                      {a.symptoms && <p className="text-sm text-muted-foreground mt-1">{a.symptoms}</p>}
                      {(a.starts_at || a.start_time) && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDate(a.starts_at || a.start_time!)} at {formatTime(a.starts_at || a.start_time!)}
                        </p>
                      )}
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.approval_status === "approved" ? "bg-success/10 text-success" : a.approval_status === "declined" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                      }`}>
                        {a.approval_status || "pending"}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {(!a.approval_status || a.approval_status === "pending") && (
                        <>
                          <Button size="sm" className="bg-success text-success-foreground rounded-lg" onClick={() => approveApt(a.id)}>
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive rounded-lg" onClick={() => declineApt(a.id)}>
                            <X className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>
                        </>
                      )}
                      {a.status === "scheduled" && a.approval_status === "approved" && (
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => completeApt(a.id)}>
                          <Check className="w-3.5 h-3.5 mr-1" /> Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && <p className="text-center text-muted-foreground py-12">No appointments found</p>}
            </div>
          </div>
        )}

        {/* Time Slots */}
        {activeTab === "timeslots" && (
          <div>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-bold">{slotStats.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Slots</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-bold text-success">{slotStats.available || 0}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-heading font-bold text-warning">{slotStats.booked || 0}</p>
                <p className="text-xs text-muted-foreground">Booked</p>
              </div>
            </div>

            {/* Create Slot */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-6">
              <h4 className="font-heading font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Create Time Slot</h4>
              <form onSubmit={createSlot} className="flex flex-wrap gap-3 items-end">
                <div><Label>Date</Label><Input type="date" className="rounded-xl mt-1" min={new Date().toISOString().split("T")[0]} value={newSlot.date} onChange={(e) => setNewSlot((p) => ({ ...p, date: e.target.value }))} required /></div>
                <div><Label>Start Time</Label><Input type="time" className="rounded-xl mt-1" value={newSlot.start} onChange={(e) => setNewSlot((p) => ({ ...p, start: e.target.value }))} required /></div>
                <div><Label>End Time</Label><Input type="time" className="rounded-xl mt-1" value={newSlot.end} onChange={(e) => setNewSlot((p) => ({ ...p, end: e.target.value }))} required /></div>
                <Button type="submit" className="bg-primary text-primary-foreground rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add Slot</Button>
              </form>
            </div>

            {/* Filter by date */}
            <div className="mb-4">
              <Input type="date" className="rounded-xl w-48" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} placeholder="Filter by date" />
            </div>

            <div className="space-y-2">
              {timeSlots.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{s.appointment_date}</p>
                    <p className="text-sm text-muted-foreground">{s.start_time} — {s.end_time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_booked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                      {s.is_booked ? "Booked" : "Available"}
                    </span>
                    {s.can_delete && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSlot(s.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {timeSlots.length === 0 && <p className="text-center text-muted-foreground py-12">No time slots found</p>}
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === "profile" && doctor && (
          <div className="max-w-lg">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-heading font-bold">
                  {doctor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl">Dr. {doctor.name}</h3>
                  <p className="text-sm text-primary">{doctor.specialization}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Email</span><span>{doctor.email}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Phone</span><span>{doctor.phone || "—"}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Qualification</span><span>{doctor.qualification || "—"}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Experience</span><span>{doctor.experience_years ? `${doctor.experience_years} years` : "—"}</span></div>
                <div className="flex justify-between py-2"><span className="text-muted-foreground">Hospital</span><span>{doctor.current_hospital || "—"}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
