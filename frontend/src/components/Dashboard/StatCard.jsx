import React from 'react';

const StatCard = ({ label, value, change, icon: Icon }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-2">{label}</p>
          <h3 className="text-4xl font-bold text-gray-800 mb-1">{value}</h3>
          <p className="text-xs text-gray-400">{change}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl">
          <Icon className="text-blue-500" size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
