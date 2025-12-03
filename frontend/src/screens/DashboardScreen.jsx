import React from 'react';
import { ShoppingBag, Package, MessageSquare, BarChart3 } from 'lucide-react';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import StatCard from '../components/Dashboard/StatCard';

const DashboardScreen = ({ onSelectScreen }) => {
  const stats = [
    { label: 'Total Orders', value: '75', change: '+3% (30 days)', icon: ShoppingBag },
    { label: 'Total Delivered', value: '357', change: '+3% (30 days)', icon: Package },
    { label: 'Total Cancelled', value: '65', change: '+3% (30 days)', icon: MessageSquare },
    { label: 'Total Revenue', value: '$128', change: '+3% (30 days)', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar activeMenu="dashboard" onNavigate={onSelectScreen} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <DashboardHeader />

        {/* Stats Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
