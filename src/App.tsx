import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Layout from "./components/Layout";
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
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/consultation" element={<Consultation />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/video" element={<VideoRoom />} />
              </Route>
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
