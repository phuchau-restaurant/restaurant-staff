// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CustomerProvider } from "./contexts/CustomerContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeScreen from "./screens/HomeScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import MenuScreen from "./screens/MenuScreen";
import KitchenScreen from "./screens/KitchenScreen";
import WaiterScreen from "./screens/WaiterScreen";
import TestScreen from "./screens/TestScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import CustomerLoginScreen from "./screens/CustomerLoginScreen";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/customer/login" replace />} />

          {/* Customer Flow */}
          <Route
            path="/customer/*"
            element={
              <CustomerProvider>
                <Routes>
                  <Route path="login" element={<CustomerLoginScreen />} />
                  <Route path="menu" element={<MenuScreen />} />
                  <Route
                    path="*"
                    element={<Navigate to="/customer/login" replace />}
                  />
                </Routes>
              </CustomerProvider>
            }
          />

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
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <TestScreen />
              </ProtectedRoute>
            }
          />
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

          <Route path="*" element={<Navigate to="/customer/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
