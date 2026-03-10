import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, UserCheck, ShieldCheck, Headphones, ArrowRight, Bot, Video, Pill, Star, Heart, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPKR, medicineFallback } from "@/lib/api";

interface Medicine {
  id: number;
  name: string;
  chemical?: string;
  price: number;
  image_path?: string;
  category?: string;
  status?: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience_years?: number;
  qualification?: string;
}

const services = [
  { icon: Truck, title: "Same-Day Delivery", desc: "Get medicines delivered across Islamabad within hours", color: "from-primary/10 to-primary/5" },
  { icon: UserCheck, title: "Expert Doctors", desc: "Book video consultations with qualified medical professionals", color: "from-info/10 to-info/5" },
  { icon: ShieldCheck, title: "100% Genuine", desc: "All medicines sourced directly from certified manufacturers", color: "from-success/10 to-success/5" },
  { icon: Headphones, title: "24/7 AI Support", desc: "Medical guidance in English & Urdu anytime you need", color: "from-warning/10 to-warning/5" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const } }),
};

export default function Index() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/store/medicines?limit=8&status=in_stock")
      .then((r) => r.json())
      .then((d) => setMedicines(d.medicines || []))
      .catch(() => {});
    fetch("/api/appointments/doctors")
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-info/6 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate="visible" className="text-pharmacy-dark-foreground">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-8 backdrop-blur-sm">
                <Heart className="w-4 h-4 fill-primary" />
                Your Health, Our Priority
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-heading font-bold leading-[1.15] mb-6 tracking-tight">
                Your Trusted{" "}
                <span className="relative">
                  <span className="text-gradient-primary">Healthcare</span>
                </span>
                <br />
                Partner in Islamabad
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg text-pharmacy-dark-foreground/55 max-w-lg mb-10 leading-relaxed">
                Quality medicines delivered to your doorstep. Expert doctor consultations online. AI-powered health guidance in English & Urdu.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 mb-12">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary-glow rounded-xl px-7 h-12 text-base">
                  <Link to="/shop"><Pill className="w-4.5 h-4.5 mr-2" /> Shop Medicines</Link>
                </Button>
                <Button asChild size="lg" className="bg-white/10 border border-white/25 text-white hover:bg-white/20 rounded-xl px-7 h-12 text-base backdrop-blur-sm">
                  <Link to="/consultation"><Video className="w-4.5 h-4.5 mr-2" /> Book Consultation</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex gap-10">
                {[
                  { value: "500+", label: "Medicines" },
                  { value: "24/7", label: "AI Support" },
                  { value: "1000+", label: "Happy Patients" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-heading font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-pharmacy-dark-foreground/40 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-info/20 rounded-3xl blur-2xl" />
                <img
                  src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80"
                  alt="Red Dot Pharmacy"
                  className="relative rounded-2xl shadow-2xl w-full object-cover max-h-[520px] animate-float"
                />
                {/* Floating card */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -left-6 bottom-8 glass-card rounded-xl p-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-sm">Licensed Pharmacy</p>
                      <p className="text-xs text-muted-foreground">Govt. Verified</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-primary tracking-wide uppercase">Our Services</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-heading font-bold mt-3">Why Choose Red Dot Pharmacy?</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-xl mx-auto">Comprehensive healthcare — from medicines to consultations to AI-powered guidance</motion.p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <h5 className="font-heading font-bold mb-2">{s.title}</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Medicines */}
      {medicines.length > 0 && (
        <section className="py-20 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-semibold text-primary tracking-wide uppercase">Medicine Store</span>
                <h2 className="text-3xl font-heading font-bold mt-2">Popular Medicines</h2>
              </div>
              <Button asChild variant="ghost" className="text-primary hover:text-primary group">
                <Link to="/shop">View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {medicines.slice(0, 8).map((med, i) => (
                <motion.div
                  key={med.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i % 4}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="aspect-square bg-muted/50 relative overflow-hidden">
                    <img
                      src={med.image_path || "/static/images/default-medicine.png"}
                      alt={med.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={medicineFallback}
                    />
                    {med.category && (
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold uppercase bg-pharmacy-dark text-pharmacy-dark-foreground px-2 py-0.5 rounded-md">
                        {med.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h6 className="font-heading font-semibold text-sm truncate">{med.name}</h6>
                    {med.chemical && <p className="text-xs text-muted-foreground truncate mt-0.5">{med.chemical}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-heading font-bold text-primary">{formatPKR(med.price)}</span>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground rounded-lg h-8 px-3 text-xs"
                        onClick={() => addItem({ id: med.id, name: med.name, price: med.price, image_path: med.image_path })}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors */}
      {doctors.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-semibold text-primary tracking-wide uppercase">Expert Doctors</span>
                <h2 className="text-3xl font-heading font-bold mt-2">Our Medical Professionals</h2>
              </div>
              <Button asChild variant="ghost" className="text-primary hover:text-primary group">
                <Link to="/consultation">Book Now <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.slice(0, 6).map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i % 3}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-heading font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {doc.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-heading font-bold truncate">{doc.name}</h5>
                      <p className="text-sm text-primary font-medium">{doc.specialization}</p>
                      {doc.qualification && <p className="text-xs text-muted-foreground mt-0.5">{doc.qualification}</p>}
                      {doc.experience_years && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                          <span className="text-xs text-muted-foreground">{doc.experience_years} years experience</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full mt-4 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground">
                    <Link to="/consultation">Book Consultation <ChevronRight className="w-4 h-4 ml-1" /></Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sm font-semibold text-primary tracking-wide uppercase">About Us</span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-3 mb-5">About Red Dot Pharmacy</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Located in the heart of Islamabad at G11 Markaz, Red Dot Pharmacy has been serving the community with quality healthcare services, genuine medicines, and expert guidance. We're committed to making healthcare accessible and affordable.
              </p>
              <div className="space-y-3">
                {[
                  { emoji: "📍", title: "Prime Location", desc: "G11 Markaz, Islamabad — Easily accessible" },
                  { emoji: "🏅", title: "Licensed & Certified", desc: "Fully regulated by health authorities" },
                  { emoji: "👥", title: "Expert Team", desc: "Qualified pharmacists & healthcare professionals" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-card transition-shadow">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <h6 className="font-heading font-semibold text-sm">{item.title}</h6>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-primary/10 to-info/10 rounded-3xl blur-xl" />
                <img
                  src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80"
                  alt="Red Dot Pharmacy Team"
                  className="relative rounded-2xl shadow-card-hover w-full object-cover max-h-[450px]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI CTA */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-primary-foreground">
                <h3 className="text-2xl font-heading font-bold">Need Medical Guidance?</h3>
                <p className="text-primary-foreground/60 mt-1">AI-powered medical assistant — supports English & Urdu with voice input</p>
              </div>
            </div>
            <Button asChild size="lg" variant="secondary" className="rounded-xl px-8 h-12">
              <Link to="/assistant">Chat with AI Assistant <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
