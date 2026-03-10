import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User, LogIn, UserPlus, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/shop", label: "Medicines", icon: "💊" },
  { href: "/consultation", label: "Consultation", icon: "📹" },
  { href: "/appointments", label: "Appointments", icon: "📅" },
  { href: "/assistant", label: "AI Assistant", icon: "🤖" },
];

export default function Navbar() {
  const location = useLocation();
  const { toast } = useToast();
  const [cartCount] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: (form.elements.namedItem("password") as HTMLInputElement).value }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
          setUserName(data.user?.name || "User");
          setShowLogin(false);
          toast({ title: "Welcome back!", description: "You've logged in successfully." });
        } else {
          toast({ title: "Login failed", description: data.message || "Invalid credentials", variant: "destructive" });
        }
      })
      .catch(() => toast({ title: "Error", description: "Could not connect to server", variant: "destructive" }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setShowRegister(false);
          setShowLogin(true);
          toast({ title: "Account created!", description: "Please log in with your credentials." });
        } else {
          toast({ title: "Registration failed", description: data.message || "Try again", variant: "destructive" });
        }
      })
      .catch(() => toast({ title: "Error", description: "Could not connect to server", variant: "destructive" }));
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-pharmacy-dark/95 backdrop-blur-md border-b border-pharmacy-dark-foreground/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Circle className="w-5 h-5 fill-primary text-primary animate-pulse-dot" />
            <span className="text-lg font-heading font-bold text-pharmacy-dark-foreground">
              Red Dot Pharmacy
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground hover:bg-pharmacy-dark-foreground/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-pharmacy-dark-foreground/70">{userName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground"
                  onClick={() => { setIsLoggedIn(false); localStorage.removeItem("token"); }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground"
                  onClick={() => setShowLogin(true)}
                >
                  <LogIn className="w-4 h-4 mr-1" /> Login
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setShowRegister(true)}
                >
                  <UserPlus className="w-4 h-4 mr-1" /> Register
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground"
              onClick={() => toast({ title: "Cart", description: "Cart feature coming soon" })}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-pharmacy-dark-foreground">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-pharmacy-dark border-pharmacy-dark-foreground/10">
                <div className="flex flex-col gap-2 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === link.href
                          ? "bg-primary text-primary-foreground"
                          : "text-pharmacy-dark-foreground/70 hover:text-pharmacy-dark-foreground hover:bg-pharmacy-dark-foreground/5"
                      }`}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                  <hr className="border-pharmacy-dark-foreground/10 my-2" />
                  {!isLoggedIn && (
                    <>
                      <Button variant="ghost" className="justify-start text-pharmacy-dark-foreground/70" onClick={() => setShowLogin(true)}>
                        <LogIn className="w-4 h-4 mr-2" /> Login
                      </Button>
                      <Button className="bg-primary text-primary-foreground" onClick={() => setShowRegister(true)}>
                        <UserPlus className="w-4 h-4 mr-2" /> Register
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading">
              <LogIn className="w-5 h-5 text-primary" /> Login to Red Dot Pharmacy
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground">Login</Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" className="text-primary hover:underline" onClick={() => { setShowLogin(false); setShowRegister(true); }}>
                Register
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading">
              <UserPlus className="w-5 h-5 text-primary" /> Create Account
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input name="name" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" type="tel" placeholder="03XX-XXXXXXX" required />
            </div>
            <div>
              <Label>Password</Label>
              <Input name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground">Create Account</Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" className="text-primary hover:underline" onClick={() => { setShowRegister(false); setShowLogin(true); }}>
                Login
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
