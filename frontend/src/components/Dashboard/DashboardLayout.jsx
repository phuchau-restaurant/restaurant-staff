import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import DashboardContent from "../../screens/Dashboard/DashboardContent";
import OrderManagementContent from "../../screens/Dashboard/OrderManagementContent";
import CategoryManagementContent from "../../screens/Dashboard/CategoryManagementContent";
import MenuManagementContent from "../../screens/Dashboard/MenuManagementContent";
import ModifierManagementContent from "../../screens/Dashboard/ModifierManagementContent";
import TablesScreen from "../../screens/TablesScreen";
import StaffScreen from "../../screens/StaffScreen";

const DashboardLayout = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const handleUserUpdate = (updatedUser) => {
    // Update user data in context and localStorage
    updateUser(updatedUser);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent />;
      case "orders":
        return <OrderManagementContent />;
      case "tables":
        return <TablesScreen />;
      case "inventory":
        return <CategoryManagementContent />;
      case "menus":
        return <MenuManagementContent />;
      case "modifiers":
        return <ModifierManagementContent />;
      case "staff":
        return <StaffScreen />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Always visible */}
      <Sidebar
        activeMenu={activeMenu}
        onNavigate={setActiveMenu}
        user={user}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
      />

      {/* Main Content - Changes based on active menu */}
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default DashboardLayout;
