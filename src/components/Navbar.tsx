import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown, Pill, Video, Bot, Calendar, Shield, Stethoscope, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop", icon: Pill },
  { to: "/consultation", label: "Consultation", icon: Video },
  { to: "/appointments", label: "Appointments", icon: Calendar },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | "doctor-login" | "admin-login" | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

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

  const handleDoctorLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/doctor/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.doctor));
        setAuthModal(null);
        toast({ title: "Welcome, Doctor!" });
        window.location.href = "/doctor/dashboard";
      } else {
        toast({ title: "Login failed", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
    setAuthLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        setAuthModal(null);
        toast({ title: "Admin access granted" });
        window.location.href = "/admin";
      } else {
        toast({ title: "Login failed", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
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
                <span className="text-primary-foreground font-heading font-bold text-sm">RD</span>
              </div>
              <span className="text-pharmacy-dark-foreground font-heading font-bold text-lg hidden sm:block">
                Red Dot <span className="text-primary">Pharmacy</span>
              </span>
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
                  <Button size="sm" className="bg-primary text-primary-foreground rounded-lg" onClick={() => setAuthModal("register")}>
                    Register
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
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setAuthModal("doctor-login"); setMobileOpen(false); }} className="text-xs text-pharmacy-dark-foreground/40 hover:text-pharmacy-dark-foreground/60 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" /> Doctor Login
                  </button>
                  <button onClick={() => { setAuthModal("admin-login"); setMobileOpen(false); }} className="text-xs text-pharmacy-dark-foreground/40 hover:text-pharmacy-dark-foreground/60 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
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
            <div className="flex justify-center gap-4 pt-2 border-t border-border">
              <button type="button" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1" onClick={() => setAuthModal("doctor-login")}>
                <Stethoscope className="w-3 h-3" /> Doctor Login
              </button>
              <button type="button" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1" onClick={() => setAuthModal("admin-login")}>
                <Shield className="w-3 h-3" /> Admin Login
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={authModal === "register"} onOpenChange={(o) => !o && setAuthModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Create Account</DialogTitle>
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

      <Dialog open={authModal === "doctor-login"} onOpenChange={(o) => !o && setAuthModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2"><Stethoscope className="w-5 h-5 text-primary" /> Doctor Login</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDoctorLogin} className="space-y-4">
            <div><Label>Email</Label><Input name="email" type="email" placeholder="doctor@reddot.com" required /></div>
            <div><Label>Password</Label><Input name="password" type="password" placeholder="••••••••" required /></div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={authLoading}>
              {authLoading ? "Signing in..." : "Doctor Sign In"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={authModal === "admin-login"} onOpenChange={(o) => !o && setAuthModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Admin Login</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div><Label>Email</Label><Input name="email" type="email" placeholder="admin@reddot.com" required /></div>
            <div><Label>Password</Label><Input name="password" type="password" placeholder="••••••••" required /></div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={authLoading}>
              {authLoading ? "Signing in..." : "Admin Sign In"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
