import { Link } from "react-router-dom";
import { Globe, Share2, ArrowRight, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/40 dark:bg-card/60 pt-20 pb-12 px-6 lg:px-10 mt-20 border-t border-border/40">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1">
            <span className="text-2xl font-bold text-foreground block mb-6 tracking-tight">
              Red Dot Pharmacy
            </span>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 font-light">
              Pakistan's trusted healthcare network — connecting patients with
              verified pharmacies, qualified doctors, and AI-driven care.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Website"
                className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground shadow-sm hover:bg-foreground hover:text-background transition-all"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground shadow-sm hover:bg-foreground hover:text-background transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground shadow-sm hover:bg-foreground hover:text-background transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Share"
                className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground shadow-sm hover:bg-foreground hover:text-background transition-all"
              >
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Healthcare */}
          <div>
            <h5 className="font-bold mb-6 text-foreground tracking-tight">
              Healthcare
            </h5>
            <ul className="space-y-4 text-muted-foreground font-light">
              <li>
                <Link
                  to="/shop"
                  className="hover:text-foreground transition-colors"
                >
                  Medical Store
                </Link>
              </li>
              <li>
                <Link
                  to="/pharmacies"
                  className="hover:text-foreground transition-colors"
                >
                  Find Pharmacies
                </Link>
              </li>
              <li>
                <Link
                  to="/consultation"
                  className="hover:text-foreground transition-colors"
                >
                  Doctor Consultation
                </Link>
              </li>
              <li>
                <Link
                  to="/assistant"
                  className="hover:text-foreground transition-colors"
                >
                  AI Health Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="font-bold mb-6 text-foreground tracking-tight">
              Resources
            </h5>
            <ul className="space-y-4 text-muted-foreground font-light">
              <li>
                <Link
                  to="/pharmacy/register"
                  className="hover:text-foreground transition-colors"
                >
                  Register Pharmacy
                </Link>
              </li>
              <li>
                <Link
                  to="/pharmacy-admin"
                  className="hover:text-foreground transition-colors"
                >
                  Pharmacy Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Support Center
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="font-bold mb-6 text-foreground tracking-tight">
              Newsletter
            </h5>
            <p className="text-muted-foreground mb-6 text-sm font-light leading-relaxed">
              Stay updated with the latest in healthcare innovation across our
              network.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input
                className="w-full bg-card border-0 rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-foreground focus:outline-none placeholder:text-muted-foreground"
                placeholder="Your email address"
                type="email"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-90 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-border/40 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm font-light">
            © {new Date().getFullYear()} Red Dot Pharmacy Network. All rights
            reserved.
          </p>
          <div className="flex gap-8 text-sm text-muted-foreground font-light">
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              HIPAA Compliance
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
