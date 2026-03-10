import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Video, Clock, CheckCircle2, XCircle, AlertCircle, Copy, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime } from "@/lib/api";

interface Appointment {
  id: number;
  patient_name?: string;
  doctor_name: string;
  doctor_specialization?: string;
  starts_at?: string;
  start_time?: string;
  status: string;
  approval_status?: string;
  symptoms?: string;
  google_meet_link?: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  scheduled: { icon: Calendar, color: "text-info bg-info/10", label: "Scheduled" },
  ongoing: { icon: Video, color: "text-warning bg-warning/10", label: "Ongoing" },
  completed: { icon: CheckCircle2, color: "text-success bg-success/10", label: "Completed" },
  cancelled: { icon: XCircle, color: "text-destructive bg-destructive/10", label: "Cancelled" },
  pending: { icon: Clock, color: "text-warning bg-warning/10", label: "Pending" },
  approved: { icon: CheckCircle2, color: "text-success bg-success/10", label: "Approved" },
  declined: { icon: XCircle, color: "text-destructive bg-destructive/10", label: "Declined" },
};

const filters = ["all", "pending", "scheduled", "completed", "cancelled"];

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    const params = filter !== "all" ? `?status=${filter}` : "";
    fetch(`/api/appointments/${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setAppointments(d.appointments || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [token, isAuthenticated, filter]);

  const copyMeetLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied!" });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <Calendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-heading font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground">Please login to view your appointments</p>
      </div>
    );
  }

  return (
    <div className="py-10 bg-background min-h-[80vh]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">My Appointments</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your scheduled consultations</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1.5">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                    filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-heading font-semibold text-muted-foreground">No appointments found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Book a consultation to get started</p>
            <Button asChild className="mt-4 bg-primary text-primary-foreground rounded-xl">
              <a href="/consultation">Book Consultation</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt, i) => {
              const approvalCfg = statusConfig[apt.approval_status || ""] || statusConfig.pending;
              const statusCfg = statusConfig[apt.status] || statusConfig.scheduled;
              const ApprovalIcon = approvalCfg.icon;
              const StatusIcon = statusCfg.icon;
              const time = apt.starts_at || apt.start_time;

              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-card transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-heading font-bold shrink-0">
                      {apt.doctor_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h5 className="font-heading font-bold">{apt.doctor_name}</h5>
                        {apt.doctor_specialization && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{apt.doctor_specialization}</span>
                        )}
                      </div>
                      {time && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {formatDate(time)} at {formatTime(time)}
                        </p>
                      )}
                      {apt.symptoms && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          <strong>Symptoms:</strong> {apt.symptoms}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                        </span>
                        {apt.approval_status && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${approvalCfg.color}`}>
                            <ApprovalIcon className="w-3 h-3" /> {approvalCfg.label}
                          </span>
                        )}
                      </div>
                    </div>
                    {apt.google_meet_link && apt.approval_status === "approved" && (
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <Button size="sm" className="bg-primary text-primary-foreground rounded-lg" asChild>
                          <a href={apt.google_meet_link} target="_blank" rel="noopener noreferrer">
                            <Video className="w-3.5 h-3.5 mr-1.5" /> Join
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => copyMeetLink(apt.google_meet_link!)}>
                          <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
