import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Star,
  MapPin,
  Pill,
  LayoutDashboard,
  Check,
  ShieldCheck,
} from "lucide-react";
import { usePharmacy, PharmacyInfo } from "@/contexts/PharmacyContext";
import { DUMMY_PHARMACIES } from "@/lib/dummyData";

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

const HERO_IMG =
  "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1600&q=80";
const PATIENT_IMG =
  "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80";
const INNOVATION_IMG =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80";

function pharmacyPhotoUrl(path?: string) {
  if (!path)
    return "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=70";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/static/")) return path;
  return `/static/uploads/pharmacies/${path}`;
}

export default function PlatformHome() {
  const navigate = useNavigate();
  const { selectPharmacy } = usePharmacy();
  const [featured, setFeatured] = useState<PharmacyListItem[]>([]);

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

  return (
    <div className="bg-background">
      <main className="max-w-[1440px] mx-auto">
        {/* ── Hero Section ── */}
        <section className="relative h-[680px] lg:h-[800px] flex items-center px-6 lg:px-10 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={HERO_IMG}
              alt="Modern healthcare facility"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-semibold tracking-[0.15em] text-secondary-foreground mb-5 block uppercase">
                Redefining Clinical Serenity
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.05] tracking-tight">
                Healthcare delivered with precision and calm.
              </h1>
              <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed font-light">
                Experience a unified medical ecosystem designed for patients,
                providers, and administrators. Precision technology meets
                therapeutic design.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/pharmacies"
                  className="bg-foreground text-background px-8 py-4 rounded-full font-semibold text-base hover:scale-[1.02] transition-all"
                >
                  Get Started
                </Link>
                <Link
                  to="/pharmacies"
                  className="glass-card text-foreground px-8 py-4 rounded-full font-semibold text-base hover:bg-muted transition-all"
                >
                  Explore Network
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Bento Grid: Unified Gateway ── */}
        <section className="py-20 lg:py-24 px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
              A Unified Gateway for All
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light text-base leading-relaxed">
              Seamlessly access the clinical tools and personal health records
              you need through our secure, specialized portals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 h-auto md:h-[600px]">
            {/* Patient Portal — Big image card */}
            <button
              onClick={() => navigate("/shop")}
              className="md:col-span-7 relative group overflow-hidden rounded-[32px] bg-card shadow-2xl shadow-black/5 text-left"
            >
              <div className="absolute inset-0">
                <img
                  src={PATIENT_IMG}
                  alt="Patient using tablet for health management"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 p-8 lg:p-10 w-full text-white">
                <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold mb-4 inline-block tracking-wider">
                  PATIENT PORTAL
                </span>
                <h3 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
                  My Health, Simplified.
                </h3>
                <p className="text-base text-white/85 mb-6 max-w-md font-light leading-relaxed">
                  Manage prescriptions, book appointments, and access your
                  medical history with ease.
                </p>
                <span className="bg-white text-foreground px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  Sign In to Portal{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>

            {/* Right column: 2 stacked cards */}
            <div className="md:col-span-5 flex flex-col gap-6 md:gap-8">
              {/* Pharmacy Admin — White card */}
              <Link
                to="/pharmacy/register"
                className="flex-1 relative group overflow-hidden rounded-[32px] bg-card border border-border shadow-xl"
              >
                <div className="p-8 lg:p-10 h-full flex flex-col">
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                    <Pill className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
                    Pharmacy Admin
                  </h3>
                  <p className="text-muted-foreground mb-6 font-light leading-relaxed flex-1">
                    Efficient inventory and prescription fulfillment suite.
                  </p>
                  <span className="text-foreground font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Launch Dashboard <ChevronRight className="w-5 h-5" />
                  </span>
                </div>
              </Link>

              {/* Super Admin — Navy card */}
              <Link
                to="/admin"
                className="flex-1 relative group overflow-hidden rounded-[32px] bg-pharmacy-dark text-white shadow-xl"
              >
                <div className="p-8 lg:p-10 h-full flex flex-col">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">
                    Super Admin
                  </h3>
                  <p className="text-white/70 mb-6 font-light leading-relaxed flex-1">
                    Network-wide analytics and enterprise management tools.
                  </p>
                  <span className="text-white font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Enter Suite <ChevronRight className="w-5 h-5" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Featured Pharmacies (real data) ── */}
        {featured.length > 0 && (
          <section className="py-20 lg:py-24 px-6 lg:px-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                  Featured Pharmacies
                </h2>
                <p className="text-muted-foreground mt-2 font-light">
                  Verified providers trusted by thousands across Pakistan.
                </p>
              </div>
              <Link
                to="/pharmacies"
                className="text-foreground font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All Pharmacies <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPharmacy(p)}
                  className="group bg-card rounded-3xl border border-border overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-left"
                >
                  <div className="h-44 bg-muted overflow-hidden">
                    <img
                      src={pharmacyPhotoUrl(p.pharmacy_photo_path)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=70";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h4 className="font-bold text-lg text-foreground tracking-tight truncate">
                        {p.name}
                      </h4>
                      <div className="flex items-center text-amber-500 gap-1 shrink-0">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span className="text-xs font-bold">
                          {(p.avg_rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4 truncate font-light">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {p.city || "Pakistan"}
                    </p>
                    <span className="inline-block py-1 px-3 rounded-full bg-secondary/60 text-secondary-foreground text-[10px] font-semibold tracking-wider">
                      VERIFIED NETWORK
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Trusted Network Section ── */}
        <section className="py-20 lg:py-24 px-6 lg:px-10 bg-muted/40 rounded-[48px] mx-6 lg:mx-10 mb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
            <div className="md:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 tracking-tight">
                Trusted by Pakistan's Leading Health Institutions
              </h2>
              <p className="text-lg text-muted-foreground mb-10 font-light leading-relaxed">
                Our network connects 50+ pharmacies and 200+ doctors across
                major cities, ensuring that quality care is accessible to
                everyone, everywhere.
              </p>
              <div className="grid grid-cols-2 gap-6 opacity-70 hover:opacity-100 transition-all duration-700">
                {[
                  "HEALTHCORP",
                  "MEDICARE+",
                  "WELLSPRING",
                  "BIOTECH LABS",
                ].map((brand) => (
                  <div
                    key={brand}
                    className="h-14 bg-card/60 rounded-xl flex items-center justify-center font-bold text-muted-foreground italic tracking-wide text-sm"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-5/12 grid grid-cols-2 gap-5">
              <div className="bg-card p-7 rounded-[28px] shadow-sm">
                <div className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                  2.4M
                </div>
                <div className="text-muted-foreground text-sm font-light">
                  Patient Records Secured
                </div>
              </div>
              <div className="bg-card p-7 rounded-[28px] shadow-sm mt-12">
                <div className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                  99.9%
                </div>
                <div className="text-muted-foreground text-sm font-light">
                  Uptime Reliability
                </div>
              </div>
              <div className="bg-card p-7 rounded-[28px] shadow-sm">
                <div className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                  15k+
                </div>
                <div className="text-muted-foreground text-sm font-light">
                  Healthcare Partners
                </div>
              </div>
              <div className="bg-card p-7 rounded-[28px] shadow-sm mt-12">
                <div className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                  24/7
                </div>
                <div className="text-muted-foreground text-sm font-light">
                  Clinical Support
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Clinical Innovation ── */}
        <section className="py-20 lg:py-24 px-6 lg:px-10">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-center">
            <div className="md:w-1/2 relative">
              <div className="aspect-square rounded-[40px] overflow-hidden bg-muted">
                <img
                  src={INNOVATION_IMG}
                  alt="Modern medical innovation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-4 lg:-right-8 glass-card p-7 rounded-[24px] max-w-xs shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <span className="font-bold text-foreground tracking-tight">
                    Verified Systems
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Our platform adheres to the highest standards for medical
                  data security and clinical accuracy.
                </p>
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8 tracking-tight">
                Designed for Professionals, Loved by Patients.
              </h2>
              <ul className="space-y-7">
                {[
                  {
                    title: "Intelligent Automation",
                    desc: "Automated prescription refills and AI-driven inventory alerts for pharmacies.",
                  },
                  {
                    title: "Secure Data Vault",
                    desc: "Enterprise-grade security ensuring patient records are accessible only to authorized personnel.",
                  },
                  {
                    title: "Wellness Ecosystem",
                    desc: "Beyond treatment — integrated tools for preventative care, consultations, and AI guidance.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-foreground flex items-center justify-center mt-1">
                      <Check
                        className="w-4 h-4 text-background"
                        strokeWidth={3}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-1 tracking-tight">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground font-light leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="py-20 lg:py-24 px-6 lg:px-10">
          <div className="bg-foreground rounded-[48px] p-12 md:p-20 text-center text-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -ml-48 -mb-48" />
            <h2 className="text-3xl md:text-5xl font-bold mb-10 max-w-3xl mx-auto tracking-tight leading-[1.1] relative z-10">
              Ready to join the network of therapeutic calm?
            </h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center relative z-10">
              <Link
                to="/pharmacies"
                className="bg-background text-foreground px-10 py-5 rounded-full font-semibold text-base hover:scale-105 transition-all"
              >
                Sign Up as a Patient
              </Link>
              <Link
                to="/pharmacy/register"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-background px-10 py-5 rounded-full font-semibold text-base hover:bg-white/20 transition-all"
              >
                Register Your Pharmacy
              </Link>
            </div>
            <p className="mt-8 text-background/60 font-light relative z-10">
              Join thousands of patients and healthcare professionals today.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
