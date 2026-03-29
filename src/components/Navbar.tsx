import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown, Pill, Video, Bot, Calendar, Sun, Moon, Building2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { usePharmacy } from "@/contexts/PharmacyContext";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { to: "/", label: "Home", icon: Building2 },
  { to: "/pharmacies", label: "Find Pharmacies", icon: Building2 },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { pharmacy: selectedPharmacy } = usePharmacy();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | "pharmacy-login" | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [pharmacyLoginError, setPharmacyLoginError] = useState<string | null>(null);
  const [pharmacyPending, setPharmacyPending] = useState<string | null>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await login(fd.get("email") as string, fd.get("password") as string);
    setAuthLoading(false);
    if (result.success) {
      setAuthModal(null);
      toast({ title: "Welcome back!", description: "You've been logged in successfully." });
    } else {
      toast({ title: "Login failed", description: result.message, variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await register(
      fd.get("name") as string,
      fd.get("email") as string,
      fd.get("phone") as string,
      fd.get("password") as string
    );
    setAuthLoading(false);
    if (result.success) {
      setAuthModal(null);
      toast({ title: "Account created!", description: "Welcome to Red Dot Pharmacy." });
    } else {
      toast({ title: "Registration failed", description: result.message, variant: "destructive" });
    }
  };

  const handlePharmacyLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    setPharmacyLoginError(null);
    setPharmacyPending(null);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    try {
      const res = await fetch("/pharmacy-admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: fd.get("password") }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("pharmacy_admin_token", data.token);
        localStorage.setItem("pharmacy_admin", JSON.stringify(data.admin));
        setAuthModal(null);
        toast({ title: `Welcome, ${data.admin.name}!` });
        window.location.href = "/pharmacy-admin";
      } else if (res.status === 403) {
        setPharmacyPending(email);
      } else {
        setPharmacyLoginError(data.error || "Invalid email or password.");
      }
    } catch {
      setPharmacyLoginError("Connection error. Is the server running?");
    }
    setAuthLoading(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-pharmacy-dark backdrop-blur-xl border-b border-pharmacy-dark-foreground/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-primary-glow transition-transform group-hover:scale-105">
                <span className="text-primary-foreground font-heading font-bold text-sm">PN</span>
              </div>
              <div className="hidden sm:block">
                {selectedPharmacy ? (
                  <div>
                    <span className="text-pharmacy-dark-foreground font-heading font-bold text-sm leading-none block">
                      {selectedPharmacy.name}
                    </span>
                    <span className="text-pharmacy-dark-foreground/40 text-[10px] leading-none">
                      {selectedPharmacy.city}
                    </span>
                  </div>
                ) : (
                  <span className="text-pharmacy-dark-foreground font-heading font-bold text-lg">
                    Pharma<span className="text-primary">Network</span>
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.to
                      ? "bg-primary/15 text-primary"
                      : "text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground hover:bg-pharmacy-dark-foreground/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground hover:bg-pharmacy-dark-foreground/5"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground hover:bg-pharmacy-dark-foreground/5"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>

              {isAuthenticated ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground hover:bg-pharmacy-dark-foreground/5 gap-2"
                    onClick={() => setUserDropdown(!userDropdown)}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                  <AnimatePresence>
                    {userDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                        onMouseLeave={() => setUserDropdown(false)}
                      >
                        <div className="p-3 border-b border-border">
                          <p className="text-sm font-semibold truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <Link to="/appointments" className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors" onClick={() => setUserDropdown(false)}>
                          <Calendar className="w-4 h-4" /> My Appointments
                        </Link>
                        <button onClick={() => { logout(); setUserDropdown(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5 w-full transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground" onClick={() => setAuthModal("login")}>
                    Login
                  </Button>
                  <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg gap-1.5" onClick={() => setAuthModal("pharmacy-login")}>
                    <Building2 className="w-3.5 h-3.5" /> Pharmacy Login
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground rounded-lg" onClick={() => setAuthModal("register")}>
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-pharmacy-dark-foreground/70"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-pharmacy-dark-foreground/10 overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      pathname === link.to ? "bg-primary/15 text-primary" : "text-pharmacy-dark-foreground/70"
                    }`}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="flex gap-2 pt-3 border-t border-pharmacy-dark-foreground/10">
                    <Button variant="outline" size="sm" className="flex-1 border-pharmacy-dark-foreground/20 text-pharmacy-dark-foreground" onClick={() => { setAuthModal("login"); setMobileOpen(false); }}>
                      Login
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary text-primary-foreground" onClick={() => { setAuthModal("register"); setMobileOpen(false); }}>
                      Register
                    </Button>
                  </div>
                )}
                <div className="pt-2">
                  <button onClick={() => { setAuthModal("pharmacy-login"); setMobileOpen(false); }} className="text-xs text-pharmacy-dark-foreground/50 hover:text-primary flex items-center gap-1 transition-colors">
                    <Building2 className="w-3 h-3" /> Pharmacy Login
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modals */}
      <Dialog open={authModal === "login"} onOpenChange={(o) => !o && setAuthModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Welcome Back</DialogTitle>
            <DialogDescription>Sign in to your patient account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><Label>Email</Label><Input name="email" type="email" placeholder="you@example.com" required /></div>
            <div><Label>Password</Label><Input name="password" type="password" placeholder="••••••••" required /></div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={authLoading}>
              {authLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" className="text-primary font-medium" onClick={() => setAuthModal("register")}>Register</button>
            </div>
            <div className="flex justify-center pt-2 border-t border-border">
              <button type="button" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1" onClick={() => setAuthModal("pharmacy-login")}>
                <Building2 className="w-3 h-3" /> Pharmacy Login
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={authModal === "register"} onOpenChange={(o) => !o && setAuthModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Create Account</DialogTitle>
            <DialogDescription>Join Red Dot Pharmacy Network as a patient.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div><Label>Full Name</Label><Input name="name" placeholder="Your name" required /></div>
            <div><Label>Email</Label><Input name="email" type="email" placeholder="you@example.com" required /></div>
            <div><Label>Phone</Label><Input name="phone" placeholder="03XX-XXXXXXX" required /></div>
            <div><Label>Password</Label><Input name="password" type="password" placeholder="••••••••" required minLength={6} /></div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={authLoading}>
              {authLoading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" className="text-primary font-medium" onClick={() => setAuthModal("login")}>Sign in</button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={authModal === "pharmacy-login"} onOpenChange={(o) => { if (!o) { setAuthModal(null); setPharmacyLoginError(null); setPharmacyPending(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Pharmacy Login
            </DialogTitle>
            <DialogDescription>Sign in to your pharmacy admin dashboard.</DialogDescription>
          </DialogHeader>

          {/* Pending approval state */}
          {pharmacyPending ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm">
                <p className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Application Under Review</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  The account for <strong>{pharmacyPending}</strong> is awaiting super admin approval.
                  You'll be able to sign in once your pharmacy is approved. This typically takes 1–2 business days.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setPharmacyPending(null)}>
                Try a different account
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                New pharmacy?{" "}
                <Link to="/pharmacy/register" className="text-primary font-medium" onClick={() => { setAuthModal(null); setPharmacyPending(null); }}>
                  Register here
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handlePharmacyLogin} className="space-y-4">
              {pharmacyLoginError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                  {pharmacyLoginError}
                </div>
              )}
              <div><Label>Email</Label><Input name="email" type="email" placeholder="admin@yourpharmacy.com" required /></div>
              <div><Label>Password</Label><Input name="password" type="password" placeholder="••••••••" required /></div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={authLoading}>
                {authLoading ? "Signing in..." : "Sign In to Dashboard"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Don't have a pharmacy account?{" "}
                <Link to="/pharmacy/register" className="text-primary font-medium" onClick={() => { setAuthModal(null); setPharmacyLoginError(null); }}>
                  Register your pharmacy
                </Link>
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
