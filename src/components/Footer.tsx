import { Link } from "react-router-dom";
import { Building2, Bot, Search, UserPlus } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-pharmacy-dark border-t border-pharmacy-dark-foreground/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-xs">PN</span>
              </div>
              <span className="text-pharmacy-dark-foreground font-heading font-bold">
                Pharma<span className="text-primary">Network</span>
              </span>
            </Link>
            <p className="text-pharmacy-dark-foreground/50 text-sm leading-relaxed">
              Pakistan's trusted pharmacy discovery platform. Find pharmacies, consult doctors, and order medicines — all in one place.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h6 className="font-heading font-semibold text-pharmacy-dark-foreground mb-4">Platform</h6>
            <ul className="space-y-2.5">
              {[
                { to: "/pharmacies", label: "Find Pharmacies", icon: Search },
                { to: "/assistant", label: "AI Health Assistant", icon: Bot },
                { to: "/pharmacy/register", label: "Register Pharmacy", icon: UserPlus },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-pharmacy-dark-foreground/50 hover:text-primary transition-colors flex items-center gap-2">
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Pharmacies */}
          <div>
            <h6 className="font-heading font-semibold text-pharmacy-dark-foreground mb-4">For Pharmacies</h6>
            <ul className="space-y-2.5">
              {[
                { to: "/pharmacy/register", label: "Join the Network" },
                { to: "/pharmacy-admin", label: "Pharmacy Dashboard" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-pharmacy-dark-foreground/50 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h6 className="font-heading font-semibold text-pharmacy-dark-foreground mb-4">About</h6>
            <p className="text-pharmacy-dark-foreground/50 text-sm leading-relaxed">
              PharmaNetwork connects patients with verified pharmacies across Pakistan. Discover healthcare services, book consultations, and get medicines delivered.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-pharmacy-dark-foreground/10 text-center">
          <p className="text-xs text-pharmacy-dark-foreground/30">
            © {new Date().getFullYear()} PharmaNetwork. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
