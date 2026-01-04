import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardContent from "../../screens/Dashboard/DashboardContent";
import OrderManagementContent from "../../screens/Dashboard/OrderManagementContent";
import CategoryManagementContent from "../../screens/Dashboard/CategoryManagementContent";
import MenuManagementContent from "../../screens/Dashboard/MenuManagementContent";
import ModifierManagementContent from "../../screens/Dashboard/ModifierManagementContent";
import SalesContent from "../../screens/Dashboard/SalesContent";
import FeedbackContent from "../../screens/Dashboard/FeedbackContent";
import TablesScreen from "../../screens/TablesScreen";
import StaffScreen from "../../screens/StaffScreen";

const DashboardLayout = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");

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
      case "sales":
        return <SalesContent />;
      case "feedback":
        return <FeedbackContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Always visible */}
      <Sidebar activeMenu={activeMenu} onNavigate={setActiveMenu} />

      {/* Main Content - Changes based on active menu */}
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default DashboardLayout;
