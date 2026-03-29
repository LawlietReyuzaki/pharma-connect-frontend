import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Store, Users, Package, ShoppingCart,
  Calendar, CreditCard, MessageSquare, LogOut, Menu, X, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const NAV = [
  { to: "/dashboard",     label: "Dashboard",         icon: LayoutDashboard },
  { to: "/pharmacy-apps", label: "Pharmacy Apps",      icon: Store,    badge: "pending" },
  { to: "/users",         label: "Users",              icon: Users },
  { to: "/medicines",     label: "Medicines",          icon: Package },
  { to: "/orders",        label: "Orders",             icon: ShoppingCart },
  { to: "/appointments",  label: "Appointments",       icon: Calendar },
  { to: "/payments",      label: "Payments",           icon: CreditCard },
  { to: "/chat-logs",     label: "Chat Logs",          icon: MessageSquare },
];

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem("super_admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const adminStr = localStorage.getItem("super_admin");
  const admin = adminStr ? JSON.parse(adminStr) : null;

  const logout = () => {
    localStorage.removeItem("super_admin_token");
    localStorage.removeItem("super_admin");
    toast({ title: "Logged out" });
    navigate("/login");
  };

  const Sidebar = () => (
    <aside className="w-60 bg-card border-r border-border flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-destructive flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-sm leading-tight">Super Admin</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Red Dot Network</p>
          </div>
        </div>
        {admin && (
          <p className="mt-3 text-xs text-muted-foreground truncate">{admin.email}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-destructive/10 text-destructive"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/5 hover:text-destructive gap-3"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 h-full">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-destructive flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-sm">Super Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
