import React from 'react';
import { STATIONS, STATUS_CONFIG } from './constants.jsx';

const FilterBar = ({ filterStation, setFilterStation, filterStatus, setFilterStatus }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Station Filter */}
      <div className="flex gap-2">
        {STATIONS.map(station => (
          <button
            key={station.id}
            onClick={() => setFilterStation(station.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-sm ${
              filterStation === station.id
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg scale-105'
                : 'bg-gradient-to-r from-orange-100 to-amber-200 text-gray-800 hover:from-orange-300 hover:to-amber-300 border border-orange-300'
            }`}
          >
            {station.icon}
            <span>{station.name}</span>
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 ml-auto">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
            filterStatus === 'all'
              ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg scale-105'
              : 'bg-gradient-to-r from-slate-50 to-gray-50 text-gray-700 hover:from-slate-100 hover:to-gray-100 border border-gray-300'
          }`}
        >
          Tất cả
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const gradientMap = {
            'bg-blue-500': 'from-blue-400 to-blue-500',
            'bg-yellow-500': 'from-yellow-400 to-yellow-500',
            'bg-orange-500': 'from-orange-400 to-orange-500',
            'bg-red-500': 'from-red-400 to-red-500',
            'bg-green-500': 'from-green-400 to-green-500',
            'bg-gray-500': 'from-gray-400 to-gray-500'
          };
          
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                filterStatus === key
                  ? `bg-gradient-to-r ${gradientMap[config.color]} text-white shadow-lg scale-105`
                  : `bg-gradient-to-r from-white to-gray-50 ${config.textColor} hover:from-gray-50 hover:to-gray-100 border-2 border-current opacity-80 hover:opacity-100`
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBar;
