import React from "react";
import { ShoppingBag, Package, MessageSquare, BarChart3, Calendar, ChevronDown } from "lucide-react";
import StatCard from "../../components/Dashboard/StatCard";

const DashboardContent = () => {
  const stats = [
    {
      label: "Total Orders",
      value: "75",
      change: "+3% (30 days)",
      icon: ShoppingBag,
    },
    {
      label: "Total Delivered",
      value: "357",
      change: "+3% (30 days)",
      icon: Package,
    },
    {
      label: "Total Cancelled",
      value: "65",
      change: "+3% (30 days)",
      icon: MessageSquare,
    },
    {
      label: "Total Revenue",
      value: "$128",
      change: "+3% (30 days)",
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">
              Hi, Samantha. Welcome back to Sedap Admin!
            </p>
          </div>

          {/* Date Filter */}
          <button className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <Calendar className="text-blue-500" size={20} />
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-700">
                Filter Periode
              </div>
              <div className="text-xs text-gray-500">
                17 April 2020 - 21 May 2020
              </div>
            </div>
            <ChevronDown className="text-gray-400" size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-8 bg-gray-100 min-h-screen">
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
    </>
  );
};

export default DashboardContent;
