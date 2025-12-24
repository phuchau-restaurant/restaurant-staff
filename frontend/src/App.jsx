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

// Features (new architecture)
import { TablesPage } from "./features/tables";
import { CategoriesPage } from "./features/categories";

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
          <Route path="/tables" element={<TablesPage />} />
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

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
