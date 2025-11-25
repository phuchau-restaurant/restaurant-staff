import React from 'react';
import { 
  Home,
  ShoppingBag, 
  Package, 
  BarChart3, 
  MessageSquare, 
  Users
} from 'lucide-react';

const Sidebar = ({ activeMenu = 'dashboard', onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Order Management', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory Management', icon: Package },
    { id: 'sales', label: 'Sales Reports', icon: BarChart3 },
    { id: 'feedback', label: 'Customer Feedback', icon: MessageSquare },
    { id: 'customers', label: 'Customer Detail', icon: Users },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Romdol<span className="text-blue-500">.</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Modern Admin Dashboard</p>
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
                  ? 'text-blue-500 bg-blue-50 border-r-4 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
