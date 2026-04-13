import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, User, Palette, Lock, ChevronRight, ChevronLeft, Check,
  Upload, MapPin, Phone, Mail, FileText, Clock, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

/* ── Constants ────────────────────────────────────────────────────────────── */

const THEMES = [
  { key: "theme-default", name: "Ocean Blue",    color: "#2563eb" },
  { key: "theme-emerald", name: "Forest Green",  color: "#059669" },
  { key: "theme-crimson", name: "Crimson Red",   color: "#dc2626" },
  { key: "theme-violet",  name: "Royal Violet",  color: "#7c3aed" },
  { key: "theme-amber",   name: "Golden Amber",  color: "#d97706" },
  { key: "theme-teal",    name: "Teal",          color: "#0d9488" },
  { key: "theme-rose",    name: "Rose Pink",     color: "#e11d48" },
  { key: "theme-indigo",  name: "Indigo",        color: "#4338ca" },
  { key: "theme-orange",  name: "Sunset Orange", color: "#ea580c" },
  { key: "theme-sky",     name: "Sky Blue",      color: "#0284c7" },
];

const STEPS = [
  { icon: Building2, title: "Pharmacy Details", desc: "Basic information about your pharmacy" },
  { icon: User,      title: "Owner & Photos",   desc: "Your info and storefront visuals" },
  { icon: Palette,   title: "Brand Theme",      desc: "Pick your color identity" },
  { icon: Lock,      title: "Account Setup",    desc: "Create your admin login" },
];

/* ── Form Shape ───────────────────────────────────────────────────────────── */

interface FormData {
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  license_number: string;
  operating_hours: string;
  owner_name: string;
  owner_photo: File | null;
  pharmacy_photo: File | null;
  theme_key: string;
  email: string;
  password: string;
  confirm_password: string;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function PharmacyRegister() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "", address: "", city: "", province: "", phone: "",
    license_number: "", operating_hours: "",
    owner_name: "", owner_photo: null, pharmacy_photo: null,
    theme_key: "theme-default",
    email: "", password: "", confirm_password: "",
  });

  const set = (field: keyof FormData, value: string | File | null) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canProceed = (): boolean => {
    if (step === 0) return !!(form.name && form.address && form.city && form.province && form.phone);
    if (step === 1) return !!form.owner_name;
    if (step === 2) return !!form.theme_key;
    if (step === 3) return !!(form.email && form.password && form.password.length >= 8 && form.password === form.confirm_password);
    return false;
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirm_password) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "confirm_password") return;
        if (k === "password") { fd.append("admin_password", v as string); return; }
        if (v instanceof File) fd.append(k, v);
        else if (v !== null && v !== undefined && v !== "") fd.append(k, v as string);
      });

      const res = await fetch("/register/api/pharmacy", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else if (res.status === 409) {
        // Email already registered — send to login with a hint
        toast({
          title: "Already Registered",
          description: "This email is already associated with a pharmacy account. Please log in or check your approval status.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/pharmacy-admin"), 2000);
      } else {
        toast({ title: data.error || data.message || "Registration failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error. Please try again.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pharmacy-dark via-purple-900/40 to-pharmacy-dark px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-card to-card/50 border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-3">Application Submitted!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Your pharmacy registration is under review. Our team will verify your details within 1–2 business days and notify you at <strong>{form.email}</strong>.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
              <Link to="/">Browse Pharmacies</Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-xl border-primary text-primary hover:bg-primary/5">
              <Link to="/pharmacy-admin">Go to Admin Login</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Wizard ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-pharmacy-dark via-purple-900/40 to-pharmacy-dark flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-5"
          >
            <Building2 className="w-4 h-4" /> Join the Network
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl font-heading font-bold text-pharmacy-dark-foreground"
          >
            Register Your Pharmacy
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-pharmacy-dark-foreground/50 text-sm mt-2"
          >
            Join Pakistan's trusted pharmacy network — free forever
          </motion.p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all font-semibold ${
                  i < step ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                    : i === step ? "bg-gradient-to-r from-primary to-pink-600 text-white shadow-lg shadow-primary/50"
                    : "bg-card border border-border text-muted-foreground"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <p className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>
                  {s.title}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${i < step ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-card via-card/50 to-card/30 border border-border/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm"
        >
          <h2 className="text-xl font-heading font-bold mb-1">{STEPS[step].title}</h2>
          <p className="text-sm text-muted-foreground mb-7">{STEPS[step].desc}</p>

          {/* Step 0: Pharmacy Details */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label>Pharmacy Name *</Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="e.g. Al-Shifa Pharmacy" value={form.name} onChange={(e) => set("name", e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label>Full Address *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea placeholder="Shop #, Street, Area" value={form.address} onChange={(e) => set("address", e.target.value)} className="pl-10 min-h-[72px] resize-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input placeholder="Islamabad" value={form.city} onChange={(e) => set("city", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Province *</Label>
                  <Input placeholder="ICT / Punjab / Sindh..." value={form.province} onChange={(e) => set("province", e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="051-XXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label>License No.</Label>
                  <div className="relative mt-1">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Optional" value={form.license_number} onChange={(e) => set("license_number", e.target.value)} className="pl-10" />
                  </div>
                </div>
              </div>
              <div>
                <Label>Operating Hours</Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={form.operating_hours.split("–")[0]?.trim() || ""}
                      onChange={(e) => {
                        const close = form.operating_hours.split("–")[1]?.trim() || "10:00 PM";
                        set("operating_hours", `${e.target.value} – ${close}`);
                      }}
                    >
                      <option value="">Opens at...</option>
                      {["6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={form.operating_hours.split("–")[1]?.trim() || ""}
                      onChange={(e) => {
                        const open = form.operating_hours.split("–")[0]?.trim() || "9:00 AM";
                        set("operating_hours", `${open} – ${e.target.value}`);
                      }}
                    >
                      <option value="">Closes at...</option>
                      {["5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM","11:00 PM","12:00 AM","1:00 AM","2:00 AM"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Owner & Photos */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <Label>Owner / Manager Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Full name" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} className="pl-10" />
                </div>
              </div>
              {/* Owner Photo */}
              <div>
                <Label>Owner Photo</Label>
                <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all">
                  {form.owner_photo ? (
                    <div className="flex items-center gap-3">
                      <img src={URL.createObjectURL(form.owner_photo)} className="w-16 h-16 rounded-full object-cover" alt="" />
                      <div>
                        <p className="text-sm font-medium">{form.owner_photo.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Upload owner photo</p>
                      <p className="text-xs text-muted-foreground/60">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => set("owner_photo", e.target.files?.[0] ?? null)} />
                </label>
              </div>
              {/* Pharmacy Photo */}
              <div>
                <Label>Pharmacy / Storefront Photo</Label>
                <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all">
                  {form.pharmacy_photo ? (
                    <div className="flex items-center gap-3">
                      <img src={URL.createObjectURL(form.pharmacy_photo)} className="w-20 h-16 rounded-lg object-cover" alt="" />
                      <div>
                        <p className="text-sm font-medium">{form.pharmacy_photo.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Upload pharmacy photo</p>
                      <p className="text-xs text-muted-foreground/60">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => set("pharmacy_photo", e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Theme */}
          {step === 2 && (
            <div>
              <p className="text-sm text-muted-foreground mb-5">
                Choose a color theme for your pharmacy's branded profile page.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => set("theme_key", t.key)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all card-hover ${
                      form.theme_key === t.key ? "scale-105 shadow-lg" : "border-border hover:border-muted-foreground/40 hover:shadow-md"
                    }`}
                    style={{ borderColor: form.theme_key === t.key ? t.color : undefined }}
                  >
                    <div className="w-12 h-12 rounded-xl mb-3 shadow-md" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}dd)` }} />
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    {form.theme_key === t.key && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{ background: t.color }}>
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {form.name && (
                <div className="mt-6 rounded-xl overflow-hidden border border-border">
                  <div className="p-4 text-white" style={{ background: THEMES.find((t) => t.key === form.theme_key)?.color }}>
                    <p className="font-heading font-bold">{form.name}</p>
                    <p className="text-xs opacity-70">{form.city || "Your City"}</p>
                  </div>
                  <div className="p-3 bg-muted/30 text-xs text-muted-foreground">Preview of your pharmacy header</div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Account */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="admin@yourpharmacy.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="pl-10" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Used for your pharmacy admin login</p>
              </div>
              <div>
                <Label>Password *</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)} className="pl-10 pr-10" minLength={8} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>Confirm Password *</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"} placeholder="Repeat password"
                    value={form.confirm_password}
                    onChange={(e) => set("confirm_password", e.target.value)}
                    className={`pl-10 pr-10 ${form.confirm_password && form.password !== form.confirm_password ? "border-destructive" : ""}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirm_password && form.password !== form.confirm_password && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
                By registering, you agree that your pharmacy will be reviewed by our admin team before going live. We'll notify you at the email provided.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="rounded-xl gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <Button asChild variant="ghost" className="text-muted-foreground">
                <Link to="/">Cancel</Link>
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="bg-primary text-primary-foreground rounded-xl gap-2 px-6">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || submitting} className="bg-primary text-primary-foreground rounded-xl gap-2 px-6">
                {submitting ? "Submitting..." : "Submit Application"} <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
