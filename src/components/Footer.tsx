import { Link } from "react-router-dom";
import { Circle, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-pharmacy-dark text-pharmacy-dark-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Circle className="w-5 h-5 fill-primary text-primary" />
              <span className="text-lg font-heading font-bold">Red Dot Pharmacy</span>
            </div>
            <p className="text-pharmacy-dark-foreground/60 text-sm leading-relaxed mb-4">
              Your trusted healthcare partner providing quality medicines and professional medical consultations.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-pharmacy-dark-foreground/5 flex items-center justify-center text-pharmacy-dark-foreground/50 hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h6 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">Services</h6>
            <ul className="space-y-2 text-sm text-pharmacy-dark-foreground/60">
              <li><Link to="/shop" className="hover:text-primary transition-colors">Online Pharmacy</Link></li>
              <li><Link to="/consultation" className="hover:text-primary transition-colors">Video Consultation</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors">Medicine Delivery</Link></li>
              <li><Link to="/assistant" className="hover:text-primary transition-colors">AI Health Assistant</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h6 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">Contact Info</h6>
            <ul className="space-y-3 text-sm text-pharmacy-dark-foreground/60">
              <li className="flex gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Shop #69, Silver City Plaza, G11 Markaz, Islamabad</span>
              </li>
              <li className="flex gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+92515111222" className="hover:text-primary transition-colors">051-5111222</a>
              </li>
              <li className="flex gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:info@reddotpharmacy.com" className="hover:text-primary transition-colors">info@reddotpharmacy.com</a>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h6 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">Emergency</h6>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-3">
              <p className="font-bold text-primary text-lg">1122</p>
              <p className="text-xs text-pharmacy-dark-foreground/60">Emergency Hotline</p>
            </div>
            <p className="text-xs text-pharmacy-dark-foreground/40">
              For medical emergencies, call 1122 immediately or visit the nearest hospital.
            </p>
          </div>
        </div>

        <div className="border-t border-pharmacy-dark-foreground/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-pharmacy-dark-foreground/40">© 2025 Red Dot Pharmacy. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-pharmacy-dark-foreground/40">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
