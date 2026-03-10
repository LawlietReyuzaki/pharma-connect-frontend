import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, UserCheck, ShieldCheck, Headphones, ArrowRight, Bot, Video, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { icon: Truck, title: "Fast Delivery", desc: "Same-day delivery across Islamabad with reliable courier service" },
  { icon: UserCheck, title: "Expert Doctors", desc: "Consult with qualified medical professionals online" },
  { icon: ShieldCheck, title: "Genuine Medicines", desc: "100% authentic medicines from trusted suppliers" },
  { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock customer support and AI assistance" },
];

const stats = [
  { value: "500+", label: "Medicines" },
  { value: "24/7", label: "Support" },
  { value: "1000+", label: "Happy Customers" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary blur-[100px]" />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-info blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" className="text-pharmacy-dark-foreground">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-6">
                ❤️ Your Health, Our Priority
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
                Your Trusted{" "}
                <span className="text-gradient-primary">Healthcare Partner</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="text-lg text-pharmacy-dark-foreground/60 max-w-lg mb-8">
                Get quality medicines delivered to your doorstep and consult with qualified doctors online. Red Dot Pharmacy — where your health comes first.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 mb-10">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary-glow rounded-xl px-6">
                  <Link to="/shop"><Pill className="w-4 h-4 mr-2" /> Shop Medicines</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-pharmacy-dark-foreground/20 text-pharmacy-dark-foreground hover:bg-pharmacy-dark-foreground/5 rounded-xl px-6">
                  <Link to="/consultation"><Video className="w-4 h-4 mr-2" /> Book Consultation</Link>
                </Button>
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="flex gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-heading font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-pharmacy-dark-foreground/50">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <img
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80"
                alt="Red Dot Pharmacy - Quality Healthcare"
                className="rounded-2xl shadow-card-hover w-full object-cover max-h-[500px] animate-float"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary">⭐ Our Services</span>
            <h2 className="text-3xl font-heading font-bold mt-2">Why Choose Red Dot Pharmacy?</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Comprehensive healthcare services with quality medicines and expert consultation</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group p-6 rounded-2xl bg-card border border-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="w-6 h-6" />
                </div>
                <h5 className="font-heading font-semibold mb-2">{s.title}</h5>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-medium text-primary">ℹ️ About Us</span>
              <h2 className="text-3xl font-heading font-bold mt-2 mb-4">About Red Dot Pharmacy</h2>
              <p className="text-muted-foreground mb-6">
                Located in the heart of Islamabad, Red Dot Pharmacy has been serving the community with quality healthcare services and genuine medicines for years.
              </p>
              <div className="space-y-4">
                {[
                  { icon: "📍", title: "Prime Location", desc: "G11 Markaz, Islamabad - Easy to find and accessible" },
                  { icon: "🏅", title: "Licensed Pharmacy", desc: "Fully licensed and regulated by health authorities" },
                  { icon: "👥", title: "Expert Team", desc: "Qualified pharmacists and healthcare professionals" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 p-3 rounded-xl bg-card border border-border">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h6 className="font-heading font-semibold text-sm">{item.title}</h6>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80"
                alt="Red Dot Pharmacy Team"
                className="rounded-2xl shadow-card-hover w-full object-cover max-h-[400px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant CTA */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold">Need Medical Guidance?</h3>
                <p className="text-primary-foreground/70 text-sm">AI-powered assistant supporting English and Urdu</p>
              </div>
            </div>
            <Button asChild size="lg" variant="secondary" className="rounded-xl">
              <Link to="/assistant">Chat with AI Assistant <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
