import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PharmacyProvider } from "@/contexts/PharmacyContext";
import Layout from "./components/Layout";
import PlatformHome from "./pages/PlatformHome";
import PharmacyNetwork from "./pages/PharmacyNetwork";
import PharmacyLanding from "./pages/PharmacyLanding";
import PharmacyRegister from "./pages/PharmacyRegister";
import PharmacyAdminDashboard from "./pages/PharmacyAdminDashboard";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Consultation from "./pages/Consultation";
import Appointments from "./pages/Appointments";
import Assistant from "./pages/Assistant";
import Admin from "./pages/Admin";
import DoctorDashboard from "./pages/DoctorDashboard";
import VideoRoom from "./pages/VideoRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <PharmacyProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Pages inside Layout (with Navbar + Footer) */}
                <Route element={<Layout />}>
                  <Route path="/" element={<PlatformHome />} />
                  <Route path="/pharmacies" element={<PharmacyNetwork />} />
                  <Route path="/pharmacy/:slug" element={<PharmacyLanding />} />
                  <Route path="/home" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/consultation" element={<Consultation />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/video" element={<VideoRoom />} />
                </Route>

                {/* Standalone pages (no Navbar wrapper) */}
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/pharmacy/register" element={<PharmacyRegister />} />
                <Route path="/pharmacy-admin" element={<PharmacyAdminDashboard />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PharmacyProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
