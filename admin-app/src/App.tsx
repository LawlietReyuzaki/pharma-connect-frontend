import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "./components/Layout";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import PharmacyAppsPage from "./pages/PharmacyApps";
import UsersPage from "./pages/Users";
import MedicinesPage from "./pages/Medicines";
import OrdersPage from "./pages/Orders";
import AppointmentsPage from "./pages/Appointments";
import PaymentsPage from "./pages/Payments";
import ChatLogsPage from "./pages/ChatLogs";

const qc = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("super_admin_token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function AdminApp() {
  return (
    <QueryClientProvider client={qc}>
      <Toaster />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pharmacy-apps" element={<PharmacyAppsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/chat-logs" element={<ChatLogsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
