import React from "react";
import {
  Home,
  ShoppingBag,
  Table,
  Package,
  Users,
  BarChart3,
  MessageSquare,
  UtensilsCrossed,
  Settings2,
  Building2,
} from "lucide-react";
import { ProfileDropup } from "../Profile";
import { useRestaurant } from "../../context/RestaurantContext";

const Sidebar = ({
  activeMenu = "dashboard",
  onNavigate,
  user,
  onLogout,
  onUserUpdate,
}) => {
  const { restaurantInfo } = useRestaurant();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "orders", label: "Order Management", icon: ShoppingBag },
    { id: "staff", label: "Staff Management", icon: Users },
    { id: "tables", label: "Table Management", icon: Table },
    { id: "inventory", label: "Category Management", icon: Package },
    { id: "menus", label: "Menu Management", icon: UtensilsCrossed },
    { id: "modifiers", label: "Modifier Management", icon: Settings2 },
    { id: "restaurant", label: "Restaurant Settings", icon: Building2 },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      {/* Logo */}
      <div className="pt-6">
        <div className="flex flex-row items-center pl-4">
          <img
            src={restaurantInfo.logoUrl || "/images/logo.png"}
            alt="Logo"
            className="h-15 w-15 object-contain"
          />
          <h1 className="pl-2 text-3xl font-bold text-gray-800">
            {restaurantInfo.name}<span className="text-blue-500">.</span>
          </h1>
        </div>

        <p className="ml-5 text-xs text-gray-400 mt-1">
          Modern Admin Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 font-medium transition-colors ${isActive
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

      {/* Profile Dropup - Bottom */}
      <div className="border-t border-gray-100 p-2">
        <ProfileDropup
          user={user}
          onLogout={onLogout}
          onUserUpdate={onUserUpdate}
        />
      </div>
    </div>
  );
};

export default Sidebar;
