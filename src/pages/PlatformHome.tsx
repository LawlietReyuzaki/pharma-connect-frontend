import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, MapPin, Navigation, ArrowRight, Star, Building2, Stethoscope,
  Bot, Pill, Video, ShieldCheck, Heart, Truck, Users, ChevronRight, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePharmacy, PharmacyInfo } from "@/contexts/PharmacyContext";
import { DUMMY_PHARMACIES } from "@/lib/dummyData";

/* ── Types ── */
interface PharmacyListItem {
  id: number;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  avg_rating: number;
  review_count: number;
  doctor_count: number;
  pharmacy_photo_path?: string;
  owner_photo_path?: string;
  owner_name?: string;
  theme_key?: string;
  status: string;
  province: string;
  operating_hours?: string;
  email?: string;
  license_number?: string;
  latitude?: number;
  longitude?: number;
}

const themeAccent: Record<string, string> = {
  "theme-default": "#2563eb",
  "theme-emerald": "#059669",
  "theme-crimson": "#dc2626",
  "theme-violet": "#7c3aed",
  "theme-amber": "#d97706",
  "theme-teal": "#0d9488",
  "theme-rose": "#e11d48",
  "theme-indigo": "#4338ca",
  "theme-orange": "#ea580c",
  "theme-sky": "#0284c7",
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

function pharmacyPhotoUrl(path?: string) {
  if (!path) return "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=60";
  if (path.startsWith("http")) return path;
  return `/static/uploads/pharmacies/${path}`;
}

function ownerPhotoUrl(path?: string) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `/static/uploads/pharmacies/${path}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="w-3.5 h-3.5"
          style={{
            color: n <= Math.round(rating) ? "#f59e0b" : "#d1d5db",
            fill: n <= Math.round(rating) ? "#f59e0b" : "transparent",
          }}
        />
      ))}
    </span>
  );
}

/* ── Featured Pharmacy Card (full-width horizontal) ── */
function FeaturedPharmacyCard({
  pharmacy,
  onSelect,
  index = 0,
}: {
  pharmacy: PharmacyListItem;
  onSelect: () => void;
  index?: number;
}) {
  const accent = themeAccent[pharmacy.theme_key || "theme-default"] || "#2563eb";
  const photo = pharmacyPhotoUrl(pharmacy.pharmacy_photo_path);
  const ownerPhoto = ownerPhotoUrl(pharmacy.owner_photo_path);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={index}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-300 cursor-pointer"
      onClick={onSelect}
    >
      <div className={`flex flex-col md:flex-row ${!isEven ? "md:flex-row-reverse" : ""}`}>
        {/* Photo side */}
        <div className="relative md:w-2/5 h-56 md:h-auto min-h-[220px] overflow-hidden shrink-0">
          <img
            src={photo}
            alt={pharmacy.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=70";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 md:hidden" style={{ background: accent }} />
          <div className={`hidden md:block absolute top-0 bottom-0 w-1 ${isEven ? "right-0" : "left-0"}`} style={{ background: accent }} />
        </div>

        {/* Info side */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-start gap-4 mb-4">
            {ownerPhoto ? (
              <img
                src={ownerPhoto}
                alt={pharmacy.owner_name || ""}
                className="w-14 h-14 rounded-xl border-2 object-cover shadow-md shrink-0"
                style={{ borderColor: accent }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-heading font-bold shrink-0"
                style={{ background: accent }}
              >
                {pharmacy.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-xl font-heading font-bold truncate">{pharmacy.name}</h3>
              {pharmacy.owner_name && (
                <p className="text-sm text-muted-foreground">by {pharmacy.owner_name}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
            <MapPin className="w-4 h-4 shrink-0" style={{ color: accent }} />
            {pharmacy.address}{pharmacy.city ? `, ${pharmacy.city}` : ""}
            {pharmacy.province ? `, ${pharmacy.province}` : ""}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <StarRating rating={pharmacy.avg_rating || 0} />
              <span className="text-sm font-bold" style={{ color: accent }}>
                {(pharmacy.avg_rating || 0).toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">({pharmacy.review_count || 0} reviews)</span>
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Stethoscope className="w-4 h-4" /> {pharmacy.doctor_count || 0} doctors
            </span>
            {pharmacy.phone && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="w-4 h-4" /> {pharmacy.phone}
              </span>
            )}
          </div>

          {pharmacy.operating_hours && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              {pharmacy.operating_hours}
            </p>
          )}

          <div className="flex items-center gap-3 mt-auto">
            <Button
              size="sm"
              className="rounded-xl text-sm h-9 px-5 text-white shadow-md"
              style={{ background: accent }}
            >
              View Pharmacy <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-sm h-9 px-4 gap-1.5"
              style={{ borderColor: `${accent}40`, color: accent }}
            >
              <Stethoscope className="w-3.5 h-3.5" /> Book Doctor
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function PlatformHome() {
  const navigate = useNavigate();
  const { selectPharmacy } = usePharmacy();
  const [featured, setFeatured] = useState<PharmacyListItem[]>([]);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetch("/pharmacy/api/list?limit=4&offset=0")
      .then((r) => r.json())
      .then((d) => {
        const list = d.pharmacies || [];
        setFeatured(list.length > 0 ? list : DUMMY_PHARMACIES.slice(0, 4));
      })
      .catch(() => setFeatured(DUMMY_PHARMACIES.slice(0, 4)));
  }, []);

  const handleSelectPharmacy = (p: PharmacyListItem) => {
    selectPharmacy(p as PharmacyInfo);
    navigate(`/pharmacy/${p.slug}`);
  };

  const handleEnableLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocating(false);
        navigate("/pharmacies?nearme=1");
      },
      () => setLocating(false)
    );
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[60vh] flex items-center bg-gradient-hero overflow-hidden py-12">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-info/6 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" animate="visible">
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-8 backdrop-blur-sm"
              >
                <Heart className="w-4 h-4 fill-primary" />
                Pakistan's Trusted Healthcare Platform
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold leading-[1.15] mb-4 tracking-tight text-pharmacy-dark-foreground"
              >
                Find Trusted{" "}
                <span className="text-gradient-primary">Pharmacies</span>{" "}
                and <span className="text-gradient-primary">Doctors</span>
                <br />
                Near You
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-base text-pharmacy-dark-foreground/55 max-w-xl mx-auto mb-6 leading-relaxed"
              >
                AI medical assistant, doctor consultations, and medicine delivery — all in one platform. Discover verified pharmacies across Pakistan.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-3 mb-5">
                <Button
                  onClick={handleEnableLocation}
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary-glow rounded-xl px-7 h-12 text-base"
                  disabled={locating}
                >
                  <Navigation className={`w-4.5 h-4.5 mr-2 ${locating ? "animate-pulse" : ""}`} />
                  {locating ? "Detecting Location..." : "Enable Location"}
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-white/10 border border-white/25 text-white hover:bg-white/20 rounded-xl px-7 h-12 text-base backdrop-blur-sm"
                >
                  <Link to="/pharmacies">
                    <Search className="w-4.5 h-4.5 mr-2" /> Find Pharmacies Near Me
                  </Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex justify-center gap-8">
                {[
                  { value: "50+", label: "Verified Pharmacies" },
                  { value: "200+", label: "Expert Doctors" },
                  { value: "5,000+", label: "Happy Patients" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-heading font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-pharmacy-dark-foreground/40">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8">
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-primary tracking-wide uppercase">How It Works</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl font-heading font-bold mt-2">Your Health Journey, Simplified</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">Three simple steps to better healthcare</motion.p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Search,
                step: "1",
                title: "Find a Pharmacy Near You",
                desc: "Search by location, area, or name. Use GPS to discover verified pharmacies in your neighborhood.",
                color: "from-primary/10 to-primary/5",
              },
              {
                icon: Stethoscope,
                step: "2",
                title: "Consult Doctors or AI Assistant",
                desc: "Book video consultations with qualified doctors or get instant guidance from our AI health assistant in English & Urdu.",
                color: "from-info/10 to-info/5",
              },
              {
                icon: Truck,
                step: "3",
                title: "Get Medicines Delivered",
                desc: "Order genuine medicines from your chosen pharmacy and receive same-day delivery right to your doorstep.",
                color: "from-success/10 to-success/5",
              },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group p-5 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center relative"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-heading font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <h5 className="font-heading font-bold mb-2">{s.title}</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Services ── */}
      <section className="py-12 bg-muted/40">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8">
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-primary tracking-wide uppercase">Our Services</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl font-heading font-bold mt-2">Everything You Need for Better Health</motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Building2, title: "Pharmacy Network", desc: "Discover verified pharmacies across Pakistan with ratings and reviews", color: "from-primary/10 to-primary/5" },
              { icon: Video, title: "Doctor Consultations", desc: "Book video appointments with qualified medical professionals", color: "from-info/10 to-info/5" },
              { icon: Pill, title: "Medicine Delivery", desc: "Order genuine medicines and get same-day delivery to your door", color: "from-success/10 to-success/5" },
              { icon: Bot, title: "AI Health Assistant", desc: "24/7 medical guidance in English & Urdu with voice support", color: "from-warning/10 to-warning/5" },
            ].map((s, i) => (
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

      {/* ── Featured Pharmacies ── */}
      {featured.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-semibold text-primary tracking-wide uppercase">Featured Pharmacies</span>
                <h2 className="text-3xl font-heading font-bold mt-2">Trusted by Thousands</h2>
              </div>
              <Button asChild variant="ghost" className="text-primary hover:text-primary group">
                <Link to="/pharmacies">View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
            </div>
            <div className="space-y-6">
              {featured.slice(0, 4).map((p, i) => (
                <FeaturedPharmacyCard
                  key={p.id}
                  pharmacy={p}
                  index={i}
                  onSelect={() => handleSelectPharmacy(p)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Platform Stats ── */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "50+", label: "Verified Pharmacies", icon: Building2 },
              { value: "10+", label: "Cities Covered", icon: MapPin },
              { value: "200+", label: "Expert Doctors", icon: Stethoscope },
              { value: "5,000+", label: "Happy Patients", icon: Users },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-card-hover transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-heading font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="text-primary-foreground">
              <h3 className="text-3xl font-heading font-bold mb-3">Ready to Find Your Pharmacy?</h3>
              <p className="text-primary-foreground/60 max-w-lg mx-auto">
                Join thousands of patients who trust our network for quality healthcare. Browse verified pharmacies, book doctors, and order medicines — all in one place.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="rounded-xl px-8 h-12">
                <Link to="/pharmacies">
                  <Search className="w-4 h-4 mr-2" /> Find Pharmacies
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="rounded-xl px-8 h-12 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/20"
              >
                <Link to="/pharmacy/register">
                  <Building2 className="w-4 h-4 mr-2" /> Register Your Pharmacy
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
