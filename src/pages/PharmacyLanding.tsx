import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Phone, Clock, Star, Stethoscope, MessageCircle, ChevronLeft,
  Bot, Pill, Send, User, ShieldCheck, Heart, Building2, ArrowRight,
  Video, Truck, ChevronRight, Mail, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePharmacy, PharmacyInfo } from "@/contexts/PharmacyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatPKR } from "@/lib/api";
import { DUMMY_PHARMACIES, DUMMY_DOCTORS, DUMMY_REVIEWS } from "@/lib/dummyData";
import { supabase } from "@/integrations/supabase/client";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience_years?: number;
  qualification?: string;
  fee?: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  owner_reply?: string;
  user_name: string;
  created_at: string;
}

interface Medicine {
  id: number;
  name: string;
  chemical?: string;
  price: number;
  image_path?: string;
  category?: string;
}

/* ── Theme Colors ─────────────────────────────────────────────────────────── */

const themeColors: Record<string, { primary: string; primaryDark: string }> = {
  "theme-default": { primary: "#2563eb", primaryDark: "#1d4ed8" },
  "theme-emerald": { primary: "#059669", primaryDark: "#047857" },
  "theme-crimson": { primary: "#dc2626", primaryDark: "#b91c1c" },
  "theme-violet":  { primary: "#7c3aed", primaryDark: "#6d28d9" },
  "theme-amber":   { primary: "#d97706", primaryDark: "#b45309" },
  "theme-teal":    { primary: "#0d9488", primaryDark: "#0f766e" },
  "theme-rose":    { primary: "#e11d48", primaryDark: "#be123c" },
  "theme-indigo":  { primary: "#4338ca", primaryDark: "#3730a3" },
  "theme-orange":  { primary: "#ea580c", primaryDark: "#c2410c" },
  "theme-sky":     { primary: "#0284c7", primaryDark: "#0369a1" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cls}
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
  if (!path) return "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80";
  if (path.startsWith("http")) return path;
  return `/static/uploads/pharmacies/${path}`;
}

function ownerPhotoUrl(path?: string) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `/static/uploads/pharmacies/${path}`;
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export default function PharmacyLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { pharmacy: ctxPharmacy, selectPharmacy } = usePharmacy();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [pharmacy, setPharmacy] = useState<PharmacyInfo | null>(ctxPharmacy);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // Fetch pharmacy profile + doctors + reviews from backend
    fetch(`/pharmacy/api/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPharmacy(d.pharmacy);
          selectPharmacy(d.pharmacy);
          setDoctors(d.doctors || []);
          setReviews(d.reviews || []);
        } else {
          // Fallback to dummy data
          const dummyMatch = DUMMY_PHARMACIES.find(p => p.slug === slug);
          if (dummyMatch) {
            const pharmacyInfo: PharmacyInfo = { ...dummyMatch };
            setPharmacy(pharmacyInfo);
            selectPharmacy(pharmacyInfo);
            setDoctors(DUMMY_DOCTORS as Doctor[]);
            setReviews(DUMMY_REVIEWS as Review[]);
          } else {
            setNotFound(true);
          }
        }
      })
      .catch(() => {
        // Fallback to dummy data
        const dummyMatch = DUMMY_PHARMACIES.find(p => p.slug === slug);
        if (dummyMatch) {
          const pharmacyInfo: PharmacyInfo = { ...dummyMatch };
          setPharmacy(pharmacyInfo);
          selectPharmacy(pharmacyInfo);
          setDoctors(DUMMY_DOCTORS as Doctor[]);
          setReviews(DUMMY_REVIEWS as Review[]);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));

    // Fetch medicines from database
    supabase
      .from("medicines")
      .select("id, name, chemical, price, image_path, category")
      .eq("status", "in_stock")
      .limit(8)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMedicines(data);
        }
      });
  }, [slug, selectPharmacy]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please log in to leave a review", variant: "destructive" });
      return;
    }
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/pharmacy/api/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Review submitted!" });
        setReviewComment("");
        setReviewRating(5);
        setReviews((prev) => [data.review, ...prev]);
      } else {
        toast({ title: data.message || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
    setSubmittingReview(false);
  };

  /* ── Loading / Not Found ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading pharmacy...</p>
        </div>
      </div>
    );
  }

  if (notFound || !pharmacy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold mb-2">Pharmacy Not Found</h2>
          <p className="text-muted-foreground mb-6">This pharmacy doesn't exist or has been removed.</p>
          <Button asChild><Link to="/pharmacies"><ChevronLeft className="w-4 h-4 mr-1" /> Browse Pharmacies</Link></Button>
        </div>
      </div>
    );
  }

  const theme = themeColors[pharmacy.theme_key] || themeColors["theme-default"];
  const heroPhoto = pharmacyPhotoUrl(pharmacy.pharmacy_photo_path);
  const ownerPhoto = ownerPhotoUrl(pharmacy.owner_photo_path);

  return (
    <div>
      {/* ── Hero Banner ── */}
      <section className="relative min-h-[50vh] overflow-hidden">
        <img
          src={heroPhoto}
          alt={pharmacy.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        {/* Theme accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.primaryDark})` }} />

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-10 pt-24">
          {/* Back link */}
          <Link
            to="/pharmacies"
            className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6 transition-colors w-fit"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Pharmacies
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Owner photo */}
            {ownerPhoto ? (
              <img
                src={ownerPhoto}
                alt={pharmacy.owner_name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white/20 object-cover shadow-xl shrink-0"
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white/20 flex items-center justify-center text-white text-2xl font-heading font-bold shrink-0"
                style={{ background: theme.primary }}
              >
                {pharmacy.name.charAt(0)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">
                  {pharmacy.name}
                </h1>
                {pharmacy.status === "approved" && (
                  <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-400/20">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              {pharmacy.owner_name && (
                <p className="text-white/50 text-sm mb-2">by {pharmacy.owner_name}</p>
              )}

              <div className="flex items-center gap-4 flex-wrap text-sm">
                <span className="text-white/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {pharmacy.address}, {pharmacy.city}
                </span>
                <span className="flex items-center gap-1.5 text-white/80">
                  <StarRating rating={pharmacy.avg_rating} />
                  <span className="font-bold text-white">
                    {(pharmacy.avg_rating || 0).toFixed(1)}
                  </span>
                  <span className="text-white/40">
                    ({pharmacy.review_count} reviews)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Actions Bar ── */}
      <div
        className="sticky top-16 z-30 border-b shadow-sm"
        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})` }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            <Button
              asChild
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl gap-2 shrink-0 backdrop-blur-sm"
            >
              <Link to="/shop">
                <Pill className="w-4 h-4" /> Shop Medicines
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl gap-2 shrink-0 backdrop-blur-sm"
            >
              <Link to="/consultation">
                <Video className="w-4 h-4" /> Book Doctor
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl gap-2 shrink-0 backdrop-blur-sm"
            >
              <Link to="/assistant">
                <Bot className="w-4 h-4" /> AI Assistant
              </Link>
            </Button>
            {pharmacy.phone && (
              <a
                href={`tel:${pharmacy.phone}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-white/70 hover:text-white text-sm shrink-0 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> {pharmacy.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* ── Left: Main Content ── */}
          <div className="lg:col-span-2 space-y-14">

            {/* Services CTA Cards */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-6">Services</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Pill,
                    title: "Medicine Store",
                    desc: "Browse & order medicines with same-day delivery",
                    link: "/shop",
                    cta: "Shop Now",
                  },
                  {
                    icon: Video,
                    title: "Doctor Consultation",
                    desc: "Book video consultations with our expert doctors",
                    link: "/consultation",
                    cta: "Book Now",
                  },
                  {
                    icon: Bot,
                    title: "AI Health Guide",
                    desc: "Get medical guidance in English & Urdu — 24/7",
                    link: "/assistant",
                    cta: "Chat Now",
                  },
                ].map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i}
                  >
                    <Link
                      to={s.link}
                      className="block bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group h-full"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                        style={{ background: `${theme.primary}15` }}
                      >
                        <s.icon className="w-6 h-6" style={{ color: theme.primary }} />
                      </div>
                      <h5 className="font-heading font-bold text-sm mb-1">{s.title}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {s.desc}
                      </p>
                      <span
                        className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                        style={{ color: theme.primary }}
                      >
                        {s.cta} <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Doctors */}
            <section>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: theme.primary }}>
                    Expert Doctors
                  </span>
                  <h2 className="text-2xl font-heading font-bold mt-1">
                    Our Medical Team
                  </h2>
                </div>
                {doctors.length > 0 && (
                  <Button asChild variant="ghost" size="sm" style={{ color: theme.primary }}>
                    <Link to="/consultation">
                      Book Now <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>

              {doctors.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl">
                  <Stethoscope className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No doctors listed yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {doctors.map((doc, i) => (
                    <motion.div
                      key={doc.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      custom={i % 4}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-heading font-bold text-lg shrink-0 group-hover:scale-105 transition-transform"
                          style={{ background: theme.primary }}
                        >
                          {doc.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-heading font-bold text-sm truncate">
                            {doc.name}
                          </h5>
                          <p className="text-xs font-medium mt-0.5" style={{ color: theme.primary }}>
                            {doc.specialization}
                          </p>
                          {doc.qualification && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {doc.qualification}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {doc.experience_years && (
                              <span className="text-xs text-muted-foreground">
                                {doc.experience_years} yrs exp.
                              </span>
                            )}
                            {doc.fee && (
                              <span className="text-xs font-bold" style={{ color: theme.primary }}>
                                {formatPKR(doc.fee)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="w-full mt-4 rounded-xl text-xs text-white h-9"
                        style={{ background: theme.primary }}
                      >
                        <Link to="/consultation">
                          Book Consultation <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Medicines Preview */}
            {medicines.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: theme.primary }}>
                      Medicine Store
                    </span>
                    <h2 className="text-2xl font-heading font-bold mt-1">
                      Popular Medicines
                    </h2>
                  </div>
                  <Button asChild variant="ghost" size="sm" style={{ color: theme.primary }}>
                    <Link to="/shop">
                      View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {medicines.slice(0, 8).map((med, i) => (
                    <motion.div
                      key={med.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      custom={i % 4}
                      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-all group"
                    >
                      <div className="aspect-square bg-muted/50 overflow-hidden">
                        <img
                          src={med.image_path || "/static/images/default-medicine.png"}
                          alt={med.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/static/images/default-medicine.png";
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <h6 className="font-heading font-semibold text-xs truncate">
                          {med.name}
                        </h6>
                        {med.chemical && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {med.chemical}
                          </p>
                        )}
                        <p className="font-bold text-sm mt-1.5" style={{ color: theme.primary }}>
                          {formatPKR(med.price)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: theme.primary }}>
                    Patient Reviews
                  </span>
                  <h2 className="text-2xl font-heading font-bold mt-1">
                    What People Say
                  </h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {pharmacy.review_count || 0} total
                </span>
              </div>

              {/* Write a review */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                <h3 className="font-heading font-semibold text-sm mb-3">
                  Share Your Experience
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setReviewRating(n)} className="hover:scale-110 transition-transform">
                        <Star
                          className="w-5 h-5"
                          style={{
                            color: n <= reviewRating ? "#f59e0b" : "#d1d5db",
                            fill: n <= reviewRating ? "#f59e0b" : "transparent",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was your experience with this pharmacy?"
                  className="min-h-[80px] mb-3 text-sm resize-none"
                />
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewComment.trim()}
                  size="sm"
                  className="text-white rounded-xl gap-2"
                  style={{ background: theme.primary }}
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev, i) => (
                    <motion.div
                      key={rev.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-card border border-border rounded-2xl p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{ background: `${theme.primary}30`, color: theme.primary }}
                          >
                            {(rev.user_name || "P").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{rev.user_name || "Patient"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(rev.created_at).toLocaleDateString("en-PK", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={rev.rating} />
                      </div>
                      {rev.comment && (
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          {rev.comment}
                        </p>
                      )}
                      {rev.owner_reply && (
                        <div
                          className="mt-3 pl-4 border-l-2 rounded-r-xl bg-muted/50 p-3"
                          style={{ borderColor: theme.primary }}
                        >
                          <p className="text-xs font-semibold mb-1" style={{ color: theme.primary }}>
                            Pharmacy Reply
                          </p>
                          <p className="text-sm text-muted-foreground">{rev.owner_reply}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-5">
            {/* Pharmacy Info Card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-36">
              <div
                className="h-2"
                style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.primaryDark})` }}
              />
              <div className="p-5 space-y-4">
                <h3 className="font-heading font-bold mb-1">Contact & Hours</h3>
                {[
                  { icon: MapPin, label: `${pharmacy.address}, ${pharmacy.city}, ${pharmacy.province}` },
                  { icon: Phone, label: pharmacy.phone },
                  { icon: Mail, label: pharmacy.email },
                  { icon: Clock, label: pharmacy.operating_hours || "9:00 AM – 10:00 PM" },
                  ...(pharmacy.license_number
                    ? [{ icon: ShieldCheck, label: `License: ${pharmacy.license_number}` }]
                    : []),
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <item.icon className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rating summary */}
              <div className="px-5 pb-5 pt-2 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-3xl font-heading font-bold" style={{ color: theme.primary }}>
                      {(pharmacy.avg_rating || 0).toFixed(1)}
                    </p>
                    <StarRating rating={pharmacy.avg_rating} size="md" />
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pharmacy.review_count} reviews
                    </p>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm text-muted-foreground">
                      <Stethoscope className="w-3.5 h-3.5 inline mr-1" />
                      {pharmacy.doctor_count || doctors.length} doctors
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI CTA */}
            <div
              className="rounded-2xl p-5 text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
              }}
            >
              <Bot className="w-8 h-8 mb-3 opacity-80" />
              <h3 className="font-heading font-bold mb-1">
                Need Health Advice?
              </h3>
              <p className="text-sm opacity-70 mb-4">
                Our AI assistant speaks English & Urdu. Get instant medical guidance, 24/7.
              </p>
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="w-full rounded-xl"
              >
                <Link to="/assistant">
                  <MessageCircle className="w-4 h-4 mr-2" /> Chat Now
                </Link>
              </Button>
            </div>

            {/* Quick Features */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-heading font-bold text-sm mb-3">
                Why Choose Us
              </h3>
              <div className="space-y-3">
                {[
                  { icon: ShieldCheck, text: "Verified & Licensed Pharmacy" },
                  { icon: Truck, text: "Same-Day Delivery Available" },
                  { icon: Stethoscope, text: "Expert Doctor Consultations" },
                  { icon: Bot, text: "24/7 AI Health Support" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <item.icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: theme.primary }}
                    />
                    <span className="text-muted-foreground text-xs">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
