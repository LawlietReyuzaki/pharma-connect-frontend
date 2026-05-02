import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  ArrowRight,
  Star,
  Building2,
  Navigation,
  Stethoscope,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { usePharmacy, PharmacyInfo } from "@/contexts/PharmacyContext";
import { DUMMY_PHARMACIES, DUMMY_CITIES } from "@/lib/dummyData";

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

const PAGE_SIZE = 12;

const HERO_IMG =
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80";

function pharmacyPhotoUrl(path?: string) {
  if (!path)
    return "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=70";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/static/")) return path;
  return `/static/uploads/pharmacies/${path}`;
}

function PharmacyCard({
  pharmacy,
  onSelect,
  showDistance = false,
}: {
  pharmacy: PharmacyListItem;
  onSelect: () => void;
  showDistance?: boolean;
}) {
  const photo = pharmacyPhotoUrl(pharmacy.pharmacy_photo_path);
  const tags =
    pharmacy.avg_rating >= 4.8
      ? "ELITE PROVIDER"
      : pharmacy.avg_rating >= 4.5
      ? "PREMIUM PARTNER"
      : "VERIFIED NETWORK";

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onClick={onSelect}
      className="group bg-card rounded-3xl border border-border overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-left w-full"
    >
      <div className="relative h-44 bg-muted overflow-hidden">
        <img
          src={photo}
          alt={pharmacy.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=70";
          }}
        />
        {showDistance && pharmacy.distance_km !== undefined && (
          <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full text-foreground shadow-sm">
            {pharmacy.distance_km} km away
          </span>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h4 className="font-bold text-lg text-foreground tracking-tight truncate">
            {pharmacy.name}
          </h4>
          <div className="flex items-center text-amber-500 gap-1 shrink-0">
            <Star className="w-4 h-4 fill-amber-500" />
            <span className="text-xs font-bold">
              {(pharmacy.avg_rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2 truncate font-light">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {pharmacy.address ? `${pharmacy.address}, ` : ""}
          {pharmacy.city || "Pakistan"}
        </p>
        <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground font-light">
          <span className="flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5" />
            {pharmacy.doctor_count || 0} doctors
          </span>
          {pharmacy.phone && (
            <span className="flex items-center gap-1 truncate">
              <Phone className="w-3.5 h-3.5" />
              {pharmacy.phone}
            </span>
          )}
        </div>
        <span className="inline-block py-1 px-3 rounded-full bg-secondary/60 text-secondary-foreground text-[10px] font-semibold tracking-wider">
          {tags}
        </span>
      </div>
    </motion.button>
  );
}

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
        if (list.length > 0) {
          setPharmacies((prev) => (append ? [...prev, ...list] : list));
          setHasMore(list.length >= PAGE_SIZE);
        } else {
          let dummy = [...DUMMY_PHARMACIES] as PharmacyListItem[];
          if (q)
            dummy = dummy.filter(
              (p) =>
                p.name.toLowerCase().includes(q.toLowerCase()) ||
                p.city.toLowerCase().includes(q.toLowerCase())
            );
          if (city) dummy = dummy.filter((p) => p.city === city);
          setPharmacies(dummy);
          setHasMore(false);
        }
      } catch {
        let dummy = [...DUMMY_PHARMACIES] as PharmacyListItem[];
        if (q)
          dummy = dummy.filter(
            (p) =>
              p.name.toLowerCase().includes(q.toLowerCase()) ||
              p.city.toLowerCase().includes(q.toLowerCase())
          );
        if (city) dummy = dummy.filter((p) => p.city === city);
        setPharmacies(dummy);
        setHasMore(false);
      }
      setLoading(false);
    },
    []
  );

  const handleNearMe = useCallback(() => {
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
  }, []);

  useEffect(() => {
    loadPharmacies("", "", 0, false);
    fetch("/pharmacy/api/cities")
      .then((r) => r.json())
      .then((d) => {
        const list = d.cities || [];
        setCities(list.length > 0 ? list : DUMMY_CITIES);
      })
      .catch(() => setCities(DUMMY_CITIES));
    if (searchParams.get("nearme") === "1") {
      handleNearMe();
    }
  }, [loadPharmacies, searchParams, handleNearMe]);

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

  const handleSelectPharmacy = (p: PharmacyListItem) => {
    selectPharmacy(p as PharmacyInfo);
    navigate(`/pharmacy/${p.slug}`);
  };

  return (
    <div className="bg-background">
      <main className="max-w-[1440px] mx-auto">
        {/* ── Hero ── */}
        <section className="relative h-[560px] flex items-center px-6 lg:px-10 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={HERO_IMG}
              alt="Pharmacy network"
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
                Healthcare Redefined
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.05] tracking-tight">
                Find your nearest verified pharmacy.
              </h1>
              <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed font-light">
                Connecting patients with trusted pharmaceutical expertise.
                Discover precision care near you with our verified network of
                modern clinical pharmacies.
              </p>

              {/* Search bar + Near me */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search by name or city..."
                    className="w-full bg-card border-0 rounded-full pl-14 pr-6 h-14 text-sm focus:ring-2 focus:ring-foreground focus:outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-foreground text-background px-8 h-14 rounded-full font-semibold text-sm hover:scale-[1.02] transition-all"
                >
                  Search
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleNearMe}
                  disabled={locating}
                  className="glass-card text-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-muted transition-all flex items-center gap-2"
                >
                  <Navigation
                    className={`w-4 h-4 ${
                      locating ? "animate-pulse" : ""
                    }`}
                  />
                  {locating ? "Locating..." : "Near Me"}
                </button>
                <Link
                  to="/pharmacy/register"
                  className="glass-card text-foreground px-6 py-3 rounded-full font-semibold text-sm hover:bg-muted transition-all flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Register Your Pharmacy
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Nearby Pharmacies ── */}
        {nearby.length > 0 && (
          <section className="py-20 lg:py-24 px-6 lg:px-10 bg-muted/40 rounded-[48px] mx-6 lg:mx-10 mb-12">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-xs font-semibold tracking-[0.15em] text-secondary-foreground mb-2 block uppercase">
                  Near You
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                  Pharmacies Nearby
                </h2>
              </div>
              <span className="text-sm text-muted-foreground font-light">
                {nearby.length} found
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearby.map((p) => (
                <PharmacyCard
                  key={p.id}
                  pharmacy={p}
                  showDistance
                  onSelect={() => handleSelectPharmacy(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── All Pharmacies + City Filters ── */}
        <section className="py-20 lg:py-24 px-6 lg:px-10">
          <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                Our Trusted Network
              </h2>
              <p className="text-muted-foreground mt-2 font-light">
                {activeCity
                  ? `Pharmacies in ${activeCity}`
                  : "Connecting with certified clinical institutions across Pakistan."}
              </p>
            </div>
          </div>

          {/* City pills */}
          {cities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => handleCity("")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCity === ""
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground border border-border hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                All Cities
              </button>
              {cities.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleCity(c.name)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCity === c.name
                      ? "bg-foreground text-background"
                      : "bg-card text-muted-foreground border border-border hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {c.name}{" "}
                  <span className="text-xs opacity-60">({c.count})</span>
                </button>
              ))}
            </div>
          )}

          {pharmacies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pharmacies.map((p) => (
                  <PharmacyCard
                    key={p.id}
                    pharmacy={p}
                    onSelect={() => handleSelectPharmacy(p)}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="bg-foreground text-background px-8 py-4 rounded-full font-semibold text-sm hover:scale-[1.02] transition-all inline-flex items-center gap-2"
                  >
                    {loading ? "Loading..." : "Load More Pharmacies"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 tracking-tight">
                No pharmacies found
              </h3>
              <p className="text-muted-foreground font-light">
                Try a different search term or browse all cities.
              </p>
            </div>
          )}
        </section>

        {/* ── Register CTA ── */}
        <section className="py-20 lg:py-24 px-6 lg:px-10">
          <div className="bg-foreground rounded-[48px] p-12 md:p-20 text-center text-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -ml-48 -mb-48" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5 text-left">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                    Own a Pharmacy?
                  </h3>
                  <p className="text-background/70 font-light">
                    Join Pakistan's largest verified pharmacy network — free
                    registration, instant visibility.
                  </p>
                </div>
              </div>
              <Link
                to="/pharmacy/register"
                className="bg-background text-foreground px-8 py-4 rounded-full font-semibold text-sm hover:scale-105 transition-all inline-flex items-center gap-2 shrink-0"
              >
                Register Your Pharmacy
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
