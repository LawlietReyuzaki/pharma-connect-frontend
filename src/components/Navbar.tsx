import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingCart,
  Bell,
  LogOut,
  ChevronDown,
  Calendar,
  Sun,
  Moon,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { usePharmacy } from "@/contexts/PharmacyContext";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { to: "/pharmacies", label: "Find Pharmacies" },
  { to: "/shop", label: "Medical Store" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/appointments", label: "Appointments" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { pharmacy: selectedPharmacy } = usePharmacy();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState<
    "login" | "register" | "pharmacy-login" | null
  >(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [pharmacyLoginError, setPharmacyLoginError] = useState<string | null>(
    null
  );
  const [pharmacyPending, setPharmacyPending] = useState<string | null>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showPharmPwd, setShowPharmPwd] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await login(
      fd.get("email") as string,
      fd.get("password") as string
    );
    setAuthLoading(false);
    if (result.success) {
      setAuthModal(null);
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
    } else {
      toast({
        title: "Login failed",
        description: result.message,
        variant: "destructive",
      });
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
      toast({
        title: "Account created!",
        description: "Welcome to Red Dot Pharmacy.",
      });
    } else {
      toast({
        title: "Registration failed",
        description: result.message,
        variant: "destructive",
      });
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

  const isActive = (to: string) =>
    pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 dark:bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.04)]">
        <div className="flex justify-between items-center w-full px-6 lg:px-10 h-20 max-w-[1440px] mx-auto">
          {/* Brand + Desktop Nav */}
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground tracking-tight">
                {selectedPharmacy ? selectedPharmacy.name : "Red Dot Pharmacy"}
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium tracking-tight transition-colors ${
                    isActive(link.to)
                      ? "text-foreground border-b-2 border-foreground pb-1"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 lg:gap-5">
            {/* Icon buttons */}
            <div className="hidden sm:flex items-center gap-1 text-foreground">
              <button
                aria-label="Toggle theme"
                className="p-2 rounded-full hover:bg-muted transition-all"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </button>
              <button
                aria-label="Notifications"
                className="p-2 rounded-full hover:bg-muted transition-all"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                aria-label="Cart"
                className="relative p-2 rounded-full hover:bg-muted transition-all"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Auth Pill */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-background/20 text-background flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-3 w-56 bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
                      onMouseLeave={() => setUserDropdown(false)}
                    >
                      <div className="p-4 border-b border-border">
                        <p className="text-sm font-semibold truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/appointments"
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors"
                        onClick={() => setUserDropdown(false)}
                      >
                        <Calendar className="w-4 h-4" /> My Appointments
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdown(false);
                        }}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/5 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setAuthModal("login")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3"
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthModal("register")}
                  className="bg-foreground text-background px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-full hover:bg-muted transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border/50 overflow-hidden bg-background/95 backdrop-blur-xl"
            >
              <nav className="px-6 py-5 space-y-1 max-w-[1440px] mx-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="flex gap-2 pt-4 border-t border-border/50 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => {
                        setAuthModal("login");
                        setMobileOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="flex-1 bg-foreground text-background rounded-full hover:opacity-90"
                      onClick={() => {
                        setAuthModal("register");
                        setMobileOpen(false);
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
                <button
                  onClick={() => {
                    setAuthModal("pharmacy-login");
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Building2 className="w-3 h-3" /> Pharmacy Login
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modals */}
      <Dialog
        open={authModal === "login"}
        onOpenChange={(o) => !o && setAuthModal(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl tracking-tight">
              Welcome Back
            </DialogTitle>
            <DialogDescription>
              Sign in to your patient account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="rounded-xl bg-muted/50 border-0"
              />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showLoginPwd ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="rounded-xl bg-muted/50 border-0"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowLoginPwd(!showLoginPwd)}
                >
                  {showLoginPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-foreground text-background rounded-full h-12 hover:opacity-90"
              disabled={authLoading}
            >
              {authLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-foreground font-semibold underline"
                onClick={() => setAuthModal("register")}
              >
                Register
              </button>
            </div>
            <div className="flex justify-center pt-2 border-t border-border">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-2"
                onClick={() => setAuthModal("pharmacy-login")}
              >
                <Building2 className="w-3 h-3" /> Pharmacy Login
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={authModal === "register"}
        onOpenChange={(o) => !o && setAuthModal(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl tracking-tight">
              Create Account
            </DialogTitle>
            <DialogDescription>
              Join Red Dot Pharmacy Network as a patient.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                name="name"
                placeholder="Your name"
                required
                className="rounded-xl bg-muted/50 border-0"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="rounded-xl bg-muted/50 border-0"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                name="phone"
                placeholder="03XX-XXXXXXX"
                required
                className="rounded-xl bg-muted/50 border-0"
              />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showRegPwd ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="rounded-xl bg-muted/50 border-0"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowRegPwd(!showRegPwd)}
                >
                  {showRegPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-foreground text-background rounded-full h-12 hover:opacity-90"
              disabled={authLoading}
            >
              {authLoading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-foreground font-semibold underline"
                onClick={() => setAuthModal("login")}
              >
                Sign in
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={authModal === "pharmacy-login"}
        onOpenChange={(o) => {
          if (!o) {
            setAuthModal(null);
            setPharmacyLoginError(null);
            setPharmacyPending(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl flex items-center gap-2 tracking-tight">
              <Building2 className="w-5 h-5" /> Pharmacy Login
            </DialogTitle>
            <DialogDescription>
              Sign in to your pharmacy admin dashboard.
            </DialogDescription>
          </DialogHeader>

          {pharmacyPending ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5 text-sm">
                <p className="font-semibold text-warning mb-1">
                  Application Under Review
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  The account for <strong>{pharmacyPending}</strong> is awaiting
                  super admin approval. You'll be able to sign in once your
                  pharmacy is approved. This typically takes 1–2 business days.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => setPharmacyPending(null)}
              >
                Try a different account
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                New pharmacy?{" "}
                <Link
                  to="/pharmacy/register"
                  className="text-foreground font-semibold underline"
                  onClick={() => {
                    setAuthModal(null);
                    setPharmacyPending(null);
                  }}
                >
                  Register here
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handlePharmacyLogin} className="space-y-4">
              {pharmacyLoginError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                  {pharmacyLoginError}
                </div>
              )}
              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="admin@yourpharmacy.com"
                  required
                  className="rounded-xl bg-muted/50 border-0"
                />
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPharmPwd ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="rounded-xl bg-muted/50 border-0"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPharmPwd(!showPharmPwd)}
                  >
                    {showPharmPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-foreground text-background rounded-full h-12 hover:opacity-90"
                disabled={authLoading}
              >
                {authLoading ? "Signing in..." : "Sign In to Dashboard"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Don't have a pharmacy account?{" "}
                <Link
                  to="/pharmacy/register"
                  className="text-foreground font-semibold underline"
                  onClick={() => {
                    setAuthModal(null);
                    setPharmacyLoginError(null);
                  }}
                >
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
