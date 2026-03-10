import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, UserCheck, Clock, Calendar, Send, Star, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  qualification?: string;
  experience_years?: number;
  current_hospital?: string;
}

interface TimeSlot {
  slot_id: number;
  start_time: string;
  end_time: string;
  display_time: string;
  available: boolean;
}

const highlights = [
  { icon: Video, title: "Video Consultation", desc: "HD video calls via Google Meet" },
  { icon: UserCheck, title: "Expert Doctors", desc: "Qualified & verified professionals" },
  { icon: Clock, title: "Flexible Scheduling", desc: "Book at your convenience" },
  { icon: Shield, title: "Confidential", desc: "Your health data stays private" },
];

const steps = [
  { num: "01", title: "Select Doctor", desc: "Choose from our qualified medical professionals" },
  { num: "02", title: "Pick a Time Slot", desc: "Select your preferred date and available time" },
  { num: "03", title: "Describe Symptoms", desc: "Tell the doctor about your health concerns" },
  { num: "04", title: "Join Video Call", desc: "Get your Google Meet link and consult online" },
];

export default function Consultation() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/appointments/doctors")
      .then((r) => r.json())
      .then((data) => setDoctors(data.doctors || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDoctor && date) {
      fetch(`/api/appointments/available-slots/${selectedDoctor}?date=${date}`)
        .then((r) => r.json())
        .then((data) => {
          setTimeSlots(data.slots || []);
          setSelectedSlot(null);
        })
        .catch(() => setTimeSlots([]));
    }
  }, [selectedDoctor, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: "Please login first", variant: "destructive" });
      return;
    }
    if (!selectedSlot) {
      toast({ title: "Please select a time slot", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const fd = new FormData(e.target as HTMLFormElement);

    try {
      const res = await fetch("/api/appointments/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          doctor_id: Number(selectedDoctor),
          slot_id: selectedSlot,
          symptoms: fd.get("symptoms"),
          note: fd.get("note"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Consultation Booked! 🎉",
          description: data.google_meet_link
            ? `Your Google Meet link: ${data.google_meet_link}`
            : "Your appointment has been scheduled. You'll receive a meet link once approved.",
        });
        (e.target as HTMLFormElement).reset();
        setSelectedDoctor("");
        setDate("");
        setTimeSlots([]);
        setSelectedSlot(null);
      } else {
        toast({ title: "Booking failed", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="py-20 bg-gradient-hero text-pharmacy-dark-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            Online Medical <span className="text-gradient-primary">Consultation</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-pharmacy-dark-foreground/55 max-w-xl mx-auto mb-12">
            Book a video consultation with our qualified doctors from the comfort of your home
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass-card rounded-xl p-5 text-center"
              >
                <h.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h5 className="font-heading font-semibold text-sm mb-1">{h.title}</h5>
                <p className="text-xs text-pharmacy-dark-foreground/50">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-heading font-bold text-center mb-10">How It Works</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <span className="text-5xl font-heading font-bold text-primary/10">{step.num}</span>
                <h5 className="font-heading font-bold text-sm mt-1">{step.title}</h5>
                <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form + Doctors */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card sticky top-24">
                <h4 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Book Your Consultation
                </h4>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label>Select Doctor</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger className="rounded-xl mt-1.5"><SelectValue placeholder="Choose a doctor..." /></SelectTrigger>
                      <SelectContent>
                        {doctors.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name} — {d.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Preferred Date</Label>
                    <Input
                      type="date"
                      className="rounded-xl mt-1.5"
                      min={new Date().toISOString().split("T")[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  {timeSlots.length > 0 && (
                    <div>
                      <Label>Available Time Slots</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.slot_id}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot.slot_id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              selectedSlot === slot.slot_id
                                ? "bg-primary text-primary-foreground shadow-primary-glow"
                                : slot.available
                                ? "bg-muted hover:bg-primary/10 hover:text-primary border border-border"
                                : "bg-muted/50 text-muted-foreground/40 cursor-not-allowed line-through"
                            }`}
                          >
                            {slot.display_time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label>Describe Your Symptoms</Label>
                    <Textarea name="symptoms" placeholder="Please describe your symptoms in detail..." className="rounded-xl mt-1.5" rows={3} required />
                  </div>
                  <div>
                    <Label>Additional Notes (Optional)</Label>
                    <Textarea name="note" placeholder="Any additional information or allergies..." className="rounded-xl mt-1.5" rows={2} />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl" size="lg" disabled={submitting}>
                    <Send className="w-4 h-4 mr-2" /> {submitting ? "Booking..." : "Book Consultation"}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Doctors Grid */}
            <div>
              <h4 className="text-2xl font-heading font-bold mb-6">Our Doctors</h4>
              {doctors.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">Loading doctors...</div>
              ) : (
                <div className="space-y-4">
                  {doctors.map((d, i) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-heading font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {d.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-heading font-bold">{d.name}</h5>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium mt-1">{d.specialization}</span>
                          {d.qualification && <p className="text-xs text-muted-foreground mt-1">{d.qualification}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            {d.experience_years && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="w-3 h-3 text-warning fill-warning" /> {d.experience_years} yrs exp.
                              </span>
                            )}
                            {d.current_hospital && (
                              <span className="text-xs text-muted-foreground">{d.current_hospital}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setSelectedDoctor(String(d.id))}
                        >
                          Select
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
