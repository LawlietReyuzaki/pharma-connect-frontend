import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, UserCheck, Clock, Calendar, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience?: string;
}

const highlights = [
  { icon: Video, title: "Video Consultation", desc: "High-quality video calls with doctors" },
  { icon: UserCheck, title: "Expert Doctors", desc: "Qualified medical professionals" },
  { icon: Clock, title: "Flexible Timing", desc: "Book at your convenience" },
];

export default function Consultation() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => setDoctors(data.doctors || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDoctor && date) {
      fetch(`/api/doctors/${selectedDoctor}/slots?date=${date}`)
        .then((r) => r.json())
        .then((data) => setTimeSlots(data.slots || []))
        .catch(() => setTimeSlots([]));
    }
  }, [selectedDoctor, date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    fetch("/api/appointments/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: selectedDoctor,
        consultation_date: date,
        time_slot: selectedSlot,
        symptoms: formData.get("symptoms"),
        note: formData.get("note"),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          toast({ title: "Booked!", description: "Your consultation has been scheduled." });
          form.reset();
        } else {
          toast({ title: "Error", description: data.message || "Booking failed", variant: "destructive" });
        }
      })
      .catch(() => toast({ title: "Error", description: "Could not connect", variant: "destructive" }));
  };

  return (
    <div>
      {/* Hero */}
      <section className="py-20 bg-gradient-hero text-pharmacy-dark-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            Online Medical <span className="text-gradient-primary">Consultation</span>
          </h1>
          <p className="text-pharmacy-dark-foreground/60 max-w-xl mx-auto mb-10">
            Book a video consultation with our qualified doctors from the comfort of your home
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {highlights.map((h) => (
              <div key={h.title} className="glass-card rounded-xl p-5 text-center">
                <h.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h5 className="font-heading font-semibold text-sm mb-1">{h.title}</h5>
                <p className="text-xs text-pharmacy-dark-foreground/50">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
                alt="Online Medical Consultation"
                className="rounded-2xl shadow-card-hover w-full object-cover max-h-[450px]"
              />
            </div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <h4 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Book Your Consultation
                </h4>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label>Select Doctor</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose a doctor..." /></SelectTrigger>
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
                    <Input type="date" className="rounded-xl" min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                  {timeSlots.length > 0 && (
                    <div>
                      <Label>Available Time Slots</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            size="sm"
                            variant={selectedSlot === slot ? "default" : "outline"}
                            className="rounded-full"
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label>Describe Your Symptoms</Label>
                    <Textarea name="symptoms" placeholder="Please describe your symptoms..." className="rounded-xl" rows={3} required />
                  </div>
                  <div>
                    <Label>Additional Notes (Optional)</Label>
                    <Textarea name="note" placeholder="Any additional information..." className="rounded-xl" rows={2} />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground rounded-xl" size="lg">
                    <Send className="w-4 h-4 mr-2" /> Book Consultation
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Doctors Grid */}
          {doctors.length > 0 && (
            <div className="mt-16">
              <h4 className="text-2xl font-heading font-bold text-center mb-8">Our Available Doctors</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((d) => (
                  <div key={d.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-heading font-bold mb-3">
                      {d.name.charAt(0)}
                    </div>
                    <h5 className="font-heading font-semibold">{d.name}</h5>
                    <p className="text-sm text-muted-foreground">{d.specialization}</p>
                    {d.experience && <p className="text-xs text-muted-foreground mt-1">{d.experience} experience</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
