import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, MapPin, ArrowRight, Star, Building2, Users, ChevronRight,
  Navigation, Stethoscope, Heart, Pill, Video, Bot, ShieldCheck, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePharmacy, PharmacyInfo } from "@/contexts/PharmacyContext";
import { DUMMY_PHARMACIES, DUMMY_CITIES } from "@/lib/dummyData";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface PharmacyListItem {
  id: number;
  name: string;
  slug: string;
  city: string;
  province: string;
  address: string;
  phone: string;
  avg_rating: number;
  review_count: number;
  doctor_count: number;
  pharmacy_photo_path?: string;
  owner_photo_path?: string;
  owner_name?: string;
  distance_km?: number;
  theme_key?: string;
  status: string;
  operating_hours?: string;
  email?: string;
  license_number?: string;
  latitude?: number;
  longitude?: number;
}

interface CityCount {
  name: string;
  count: number;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const themeAccent: Record<string, string> = {
  "theme-default": "#2563eb",
  "theme-emerald": "#059669",
  "theme-crimson": "#dc2626",
  "theme-violet":  "#7c3aed",
  "theme-amber":   "#d97706",
  "theme-teal":    "#0d9488",
  "theme-rose":    "#e11d48",
  "theme-indigo":  "#4338ca",
  "theme-orange":  "#ea580c",
  "theme-sky":     "#0284c7",
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

const PAGE_SIZE = 12;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="w-3 h-3"
          style={{
            color: n <= Math.round(rating) ? "#f59e0b" : "#d1d5db",
            fill: n <= Math.round(rating) ? "#f59e0b" : "transparent",
          }}
        />
      ))}
    </span>
  );
}

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

/* ── Pharmacy Card ────────────────────────────────────────────────────────── */

function PharmacyCard({
  pharmacy,
  showDistance = false,
  onSelect,
}: {
  pharmacy: PharmacyListItem;
  showDistance?: boolean;
  onSelect: () => void;
}) {
  const accent = themeAccent[pharmacy.theme_key || "theme-default"] || "#2563eb";
  const photo = pharmacyPhotoUrl(pharmacy.pharmacy_photo_path);
  const ownerPhoto = ownerPhotoUrl(pharmacy.owner_photo_path);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={0}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={onSelect}
    >
      {/* Photo */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={photo}
          alt={pharmacy.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=60";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {showDistance && pharmacy.distance_km !== undefined && (
          <span className="absolute top-3 right-3 bg-white/90 text-xs font-bold px-2.5 py-1 rounded-full text-gray-800 shadow">
            {pharmacy.distance_km} km away
          </span>
        )}

        {/* Owner avatar */}
        {ownerPhoto && (
          <img
            src={ownerPhoto}
            alt={pharmacy.owner_name || ""}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full border-2 border-white object-cover shadow-md"
          />
        )}

        {/* Theme accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: accent }} />
      </div>

      {/* Info */}
      <div className="p-4">
        <h6 className="font-heading font-bold text-sm truncate mb-0.5">{pharmacy.name}</h6>
        {pharmacy.owner_name && (
          <p className="text-xs text-muted-foreground mb-1 truncate">by {pharmacy.owner_name}</p>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {pharmacy.address ? `${pharmacy.address}, ` : ""}
          {pharmacy.city || "Pakistan"}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={pharmacy.avg_rating || 0} />
          <span className="text-xs font-semibold" style={{ color: accent }}>
            {(pharmacy.avg_rating || 0).toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">({pharmacy.review_count || 0})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> {pharmacy.doctor_count || 0}
            </span>
            {pharmacy.phone && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> {pharmacy.phone}
              </span>
            )}
          </div>
          <span
            className="text-xs font-semibold flex items-center gap-0.5 group-hover:gap-1 transition-all"
            style={{ color: accent }}
          >
            Visit <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */

export default function PharmacyNetwork() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectPharmacy } = usePharmacy();

  const [pharmacies, setPharmacies] = useState<PharmacyListItem[]>([]);
  const [nearby, setNearby] = useState<PharmacyListItem[]>([]);
  const [cities, setCities] = useState<CityCount[]>([]);
  const [search, setSearch] = useState("");
  const [activeCity, setActiveCity] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const loadPharmacies = useCallback(
    async (q: string, city: string, off: number, append = false) => {
      setLoading(true);
      try {
        let url = `/pharmacy/api/list?limit=${PAGE_SIZE}&offset=${off}`;
        if (q) url += `&search=${encodeURIComponent(q)}`;
        if (city) url += `&city=${encodeURIComponent(city)}`;
        const res = await fetch(url);
        const data = await res.json();
        const list: PharmacyListItem[] = data.pharmacies || [];
        setPharmacies((prev) => (append ? [...prev, ...list] : list));
        setHasMore(list.length >= PAGE_SIZE);
      } catch {
        /* ignore */
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    loadPharmacies("", "", 0, false);
    fetch("/pharmacy/api/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.cities || []))
      .catch(() => {});
    // Auto-trigger near me if coming from landing page
    if (searchParams.get("nearme") === "1") {
      handleNearMe();
    }
  }, [loadPharmacies]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setOffset(0);
    loadPharmacies(search, activeCity, 0, false);
  };

  const handleCity = (city: string) => {
    setActiveCity(city);
    setOffset(0);
    loadPharmacies(search, city, 0, false);
  };

  const handleLoadMore = () => {
    const next = offset + PAGE_SIZE;
    setOffset(next);
    loadPharmacies(search, activeCity, next, true);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `/pharmacy/api/nearby?lat=${coords.latitude}&lng=${coords.longitude}&limit=6`
          );
          const data = await res.json();
          if (data.success) setNearby(data.pharmacies || []);
        } catch {
          /* ignore */
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSelectPharmacy = (p: PharmacyListItem) => {
    selectPharmacy(p as PharmacyInfo);
    navigate(`/pharmacy/${p.slug}`);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[75vh] flex items-center bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-info/6 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" animate="visible">
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-8 backdrop-blur-sm"
              >
                <Heart className="w-4 h-4 fill-primary" />
                Pakistan's Trusted Pharmacy Network
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-heading font-bold leading-[1.15] mb-6 tracking-tight text-pharmacy-dark-foreground"
              >
                Find Your Nearest{" "}
                <span className="text-gradient-primary">Pharmacy</span>
                <br />
                <span className="text-3xl sm:text-4xl lg:text-[2.5rem]">
                  Medicines, Doctors & More
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg text-pharmacy-dark-foreground/55 max-w-xl mx-auto mb-10 leading-relaxed"
              >
                Discover verified pharmacies, compare ratings, book doctor
                consultations, and order medicines — all from one platform.
              </motion.p>

              {/* Search bar */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search pharmacies by name or city..."
                    className="pl-10 h-12 rounded-xl bg-white/10 border-white/20 text-pharmacy-dark-foreground placeholder:text-pharmacy-dark-foreground/40 backdrop-blur-sm"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="bg-primary text-primary-foreground h-12 px-7 rounded-xl shadow-primary-glow shrink-0"
                >
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </motion.div>

              {/* Near me + Quick links */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="flex flex-wrap items-center justify-center gap-3 mt-6"
              >
                <Button
                  onClick={handleNearMe}
                  variant="outline"
                  className="border-white/20 text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground hover:bg-white/10 gap-2 rounded-xl"
                  disabled={locating}
                >
                  <Navigation
                    className={`w-4 h-4 ${locating ? "animate-pulse text-primary" : ""}`}
                  />
                  {locating ? "Locating..." : "Near Me"}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground hover:bg-white/10 gap-2 rounded-xl"
                >
                  <Link to="/pharmacy/register">
                    <Building2 className="w-4 h-4" /> Register Pharmacy
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Nearby Pharmacies ── */}
      {nearby.length > 0 && (
        <section className="py-16 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-sm font-semibold text-primary tracking-wide uppercase">
                  Near You
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mt-1">
                  Pharmacies Nearby
                </h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {nearby.length} found
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearby.map((p) => (
                <PharmacyCard
                  key={p.id}
                  pharmacy={p}
                  showDistance
                  onSelect={() => handleSelectPharmacy(p)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="text-sm font-semibold text-primary tracking-wide uppercase"
            >
              How It Works
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl font-heading font-bold mt-3"
            >
              Your Health Journey, Simplified
            </motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Search,
                title: "Find a Pharmacy",
                desc: "Search by name, city, or use GPS to find pharmacies near you",
                color: "from-primary/10 to-primary/5",
              },
              {
                icon: Pill,
                title: "Order Medicines",
                desc: "Browse the catalog, add to cart, and get same-day delivery",
                color: "from-success/10 to-success/5",
              },
              {
                icon: Video,
                title: "Book a Doctor",
                desc: "Schedule video consultations with qualified medical professionals",
                color: "from-info/10 to-info/5",
              },
              {
                icon: Bot,
                title: "AI Health Guide",
                desc: "Get instant medical guidance in English & Urdu, 24/7",
                color: "from-warning/10 to-warning/5",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}
                >
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <h5 className="font-heading font-bold mb-2">{step.title}</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── City Filters + All Pharmacies ── */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          {/* City pills */}
          {cities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => handleCity("")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCity === ""
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                All Cities
              </button>
              {cities.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleCity(c.name)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    activeCity === c.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {c.name} ({c.count})
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-sm font-semibold text-primary tracking-wide uppercase">
                All Pharmacies
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mt-1">
                {activeCity ? `Pharmacies in ${activeCity}` : "Browse Our Network"}
              </h2>
            </div>
          </div>

          {pharmacies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pharmacies.map((p) => (
                  <PharmacyCard
                    key={p.id}
                    pharmacy={p}
                    onSelect={() => handleSelectPharmacy(p)}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-10">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    disabled={loading}
                    className="rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {loading ? "Loading..." : "Load More Pharmacies"}{" "}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">
                No pharmacies found
              </h3>
              <p className="text-muted-foreground text-sm">
                Try a different search term or browse all cities.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Platform Stats ── */}
      <section className="py-16 bg-background">
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
                <p className="text-3xl font-heading font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Register CTA ── */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-primary-foreground">
                <h3 className="text-2xl font-heading font-bold">
                  Own a Pharmacy?
                </h3>
                <p className="text-primary-foreground/60 mt-1">
                  Join Pakistan's largest pharmacy network — free registration,
                  instant visibility, more customers.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-xl px-8 h-12 shrink-0"
            >
              <Link to="/pharmacy/register">
                Register Your Pharmacy{" "}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
