// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeScreen from "./screens/HomeScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import KitchenScreen from "./screens/KitchenScreen";
import WaiterScreen from "./screens/WaiterScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import TablesScreen from "./screens/TablesScreen";

// Super Admin Screens
import SuperAdminLoginScreen from "./screens/SuperAdmin/SuperAdminLoginScreen";
import SuperAdminDashboard from "./screens/SuperAdmin/SuperAdminDashboard";
import TenantManagement from "./screens/SuperAdmin/TenantManagement";
import SuperAdminManagement from "./screens/SuperAdmin/SuperAdminManagement";
import SuperAdminSettings from "./screens/SuperAdmin/SuperAdminSettings";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin/Staff Flow */}
          <Route path="/login" element={<HomeScreen />} />
          <Route path="/verify-email" element={<VerifyEmailScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />

          {/* Protected Routes - Yêu cầu đăng nhập */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route path="/tables" element={<TablesScreen />} />
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute>
                <KitchenScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiter"
            element={
              <ProtectedRoute>
                <WaiterScreen />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route path="/super-admin/login" element={<SuperAdminLoginScreen />} />
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />}>
            <Route index element={<TenantManagement />} />
            <Route path="tenants" element={<TenantManagement />} />
            <Route path="admins" element={<SuperAdminManagement />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;