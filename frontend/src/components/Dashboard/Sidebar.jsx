import React from "react";
import {
  Home,
  ShoppingBag,
  Table,
  Package,
  BarChart3,
  MessageSquare,
} from "lucide-react";

const Sidebar = ({ activeMenu = "dashboard", onNavigate }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "orders", label: "Order Management", icon: ShoppingBag },
    { id: "tables", label: "Table Management", icon: Table },
    { id: "inventory", label: "Category Management", icon: Package },
    { id: "sales", label: "Sales Reports", icon: BarChart3 },
    { id: "feedback", label: "Customer Feedback", icon: MessageSquare },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="pt-6">
        <div className="flex flex-row items-center">
          <img src="../images/logo.png" alt="Logo" className="h-20 w-20" />
          <h1 className="text-3xl font-bold text-gray-800">
            RoRi<span className="text-blue-500">.</span>
          </h1>
        </div>

        <p className="ml-5 text-xs text-gray-400 mt-1">
          Modern Admin Dashboard
        </p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 font-medium transition-colors ${
                isActive
                  ? "text-blue-500 bg-blue-50 border-r-4 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
