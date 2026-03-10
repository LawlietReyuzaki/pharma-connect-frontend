import { useState, useEffect } from "react";
import { Calendar, Clock, Video, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: number;
  doctor_name: string;
  consultation_date: string;
  time_slot: string;
  status: string;
  symptoms?: string;
  meeting_link?: string;
}

const statusMap: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "bg-warning/10 text-warning border-warning/30", icon: AlertCircle },
  scheduled: { color: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  completed: { color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch(() => toast({ title: "Error", description: "Failed to load appointments", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="py-12 bg-gradient-hero text-pharmacy-dark-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-heading font-bold mb-2">My Appointments</h1>
          <p className="text-pharmacy-dark-foreground/60">Manage your consultation appointments</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-heading font-semibold text-lg mb-1">No Appointments Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Book your first consultation to get started</p>
              <Button asChild className="bg-primary text-primary-foreground rounded-xl">
                <a href="/consultation">Book Consultation</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => {
                const st = statusMap[apt.status] || statusMap.pending;
                const StatusIcon = st.icon;
                return (
                  <div key={apt.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-bold">
                          {apt.doctor_name?.charAt(0) || "D"}
                        </div>
                        <div>
                          <h5 className="font-heading font-semibold">{apt.doctor_name}</h5>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{apt.consultation_date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.time_slot}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={st.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {apt.status}
                      </Badge>
                    </div>
                    {apt.symptoms && <p className="text-sm text-muted-foreground">{apt.symptoms}</p>}
                    {apt.meeting_link && apt.status === "scheduled" && (
                      <Button asChild size="sm" className="mt-3 bg-primary text-primary-foreground rounded-xl">
                        <a href={apt.meeting_link}><Video className="w-3 h-3 mr-1" /> Join Video Call</a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
