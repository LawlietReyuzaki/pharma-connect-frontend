import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-pharmacy-dark border-t border-pharmacy-dark-foreground/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-xs">RD</span>
              </div>
              <span className="text-pharmacy-dark-foreground font-heading font-bold">Red Dot Pharmacy</span>
            </Link>
            <p className="text-pharmacy-dark-foreground/50 text-sm leading-relaxed">
              Your trusted healthcare partner in Islamabad. Quality medicines and expert consultations delivered to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h6 className="font-heading font-semibold text-pharmacy-dark-foreground mb-4">Quick Links</h6>
            <ul className="space-y-2.5">
              {[
                { to: "/shop", label: "Medicine Store" },
                { to: "/consultation", label: "Book Consultation" },
                { to: "/appointments", label: "My Appointments" },
                { to: "/assistant", label: "AI Assistant" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-pharmacy-dark-foreground/50 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h6 className="font-heading font-semibold text-pharmacy-dark-foreground mb-4">Contact Us</h6>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-pharmacy-dark-foreground/50">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                G11 Markaz, Islamabad, Pakistan
              </li>
              <li className="flex items-center gap-2.5 text-sm text-pharmacy-dark-foreground/50">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                +92 XXX XXXXXXX
              </li>
              <li className="flex items-center gap-2.5 text-sm text-pharmacy-dark-foreground/50">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                info@reddotpharmacy.pk
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h6 className="font-heading font-semibold text-pharmacy-dark-foreground mb-4">Working Hours</h6>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-pharmacy-dark-foreground/50">
                <Clock className="w-4 h-4 shrink-0 text-primary" />
                Mon - Sat: 9:00 AM - 10:00 PM
              </li>
              <li className="flex items-center gap-2.5 text-sm text-pharmacy-dark-foreground/50">
                <Clock className="w-4 h-4 shrink-0 text-primary" />
                Sunday: 10:00 AM - 8:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-pharmacy-dark-foreground/10 text-center">
          <p className="text-xs text-pharmacy-dark-foreground/30">
            © {new Date().getFullYear()} Red Dot Pharmacy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
