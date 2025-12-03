import React, { useState } from "react";
import { STATIONS, STATUS_CONFIG } from "../OrderCard/constants.jsx";
import { ChevronDown, Search } from "lucide-react";

const FilterBar = ({
  filterStation,
  setFilterStation,
  filterStatus,
  setFilterStatus,
  searchOrderId,
  setSearchOrderId,
}) => {
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const selectedStation = STATIONS.find(s => s.id === filterStation);
  const selectedStatusConfig = filterStatus === "all" 
    ? { label: "Tất cả", color: "bg-slate-500" } 
    : STATUS_CONFIG[filterStatus];

  const statusGradientMap = {
    "bg-blue-500": "from-blue-400 to-blue-500",
    "bg-yellow-500": "from-yellow-400 to-yellow-500",
    "bg-orange-500": "from-orange-400 to-orange-500",
    "bg-red-500": "from-red-400 to-red-500",
    "bg-green-500": "from-green-400 to-green-500",
    "bg-gray-500": "from-gray-400 to-gray-500",
    "bg-slate-500": "from-slate-500 to-slate-600",
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Thanh tìm kiếm */}
      <div className="relative w-full">
        <input
          type="text"
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
          placeholder="Tìm mã đơn 001.."
          className="w-full px-3 py-2 pl-9 bg-white border-2 border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all shadow-sm"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      
      {/* 2 Dropdown lọc - bên phải */}
      <div className="flex gap-3 justify-center">
      {/* Loại món Dropdown */}
      <div className="relative w-56">
        <button
          onClick={() => {
            setShowStationDropdown(!showStationDropdown);
            setShowStatusDropdown(false);
          }}
          className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:border-gray-400 transition-all flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Loại món:</span>
            <span className="w-4 h-4">{selectedStation?.icon}</span>
            <span className="truncate">{selectedStation?.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${showStationDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showStationDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {STATIONS.map((station) => (
              <button
                key={station.id}
                onClick={() => {
                  setFilterStation(station.id);
                  setShowStationDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left font-semibold transition-all flex items-center gap-2 ${
                  filterStation === station.id
                    ? "bg-linear-to-r from-orange-400 to-orange-500 text-white shadow-lg"
                    : "bg-white text-gray-800 hover:bg-orange-50"
                }`}
              >
                <span className="w-5 h-5">{station.icon}</span>
                <span>{station.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tình trạng đơn Dropdown */}
      <div className="relative w-56">
        <button
          onClick={() => {
            setShowStatusDropdown(!showStatusDropdown);
            setShowStationDropdown(false);
          }}
          className={`w-full px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-between shadow-sm bg-linear-to-r ${
            statusGradientMap[selectedStatusConfig?.color]
          } text-white border-2 border-gray-400 hover:border-gray-500`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">Tình trạng:</span>
            <span className="truncate">{selectedStatusConfig?.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${showStatusDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showStatusDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            <button
              onClick={() => {
                setFilterStatus("all");
                setShowStatusDropdown(false);
              }}
              className={`w-full px-4 py-2 text-left font-semibold transition-all shadow-sm ${
                filterStatus === "all"
                  ? "bg-linear-to-r from-slate-500 to-slate-600 text-white shadow-lg"
                  : "bg-linear-to-r from-slate-50 to-gray-50 text-gray-700 hover:from-slate-100 hover:to-gray-100 border border-gray-300"
              }`}
            >
              Tất cả
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const gradientMap = {
                "bg-blue-500": "from-blue-400 to-blue-500",
                "bg-yellow-500": "from-yellow-400 to-yellow-500",
                "bg-orange-500": "from-orange-400 to-orange-500",
                "bg-red-500": "from-red-400 to-red-500",
                "bg-green-500": "from-green-400 to-green-500",
                "bg-gray-500": "from-gray-400 to-gray-500",
              };

              const hoverGradientMap = {
                "bg-blue-500": "hover:from-blue-300 hover:to-blue-400",
                "bg-yellow-500": "hover:from-yellow-300 hover:to-yellow-400",
                "bg-orange-500": "hover:from-orange-300 hover:to-orange-400",
                "bg-red-500": "hover:from-red-300 hover:to-red-400",
                "bg-green-500": "hover:from-green-300 hover:to-green-400",
                "bg-gray-500": "hover:from-gray-300 hover:to-gray-400",
              };

              return (
                <button
                  key={key}
                  onClick={() => {
                    setFilterStatus(key);
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left font-semibold transition-all shadow-sm ${
                    filterStatus === key
                      ? `bg-linear-to-r ${
                          gradientMap[config.color]
                        } text-white shadow-lg`
                      : `bg-linear-to-r from-white to-gray-50 ${
                          config.textColor
                        } ${hoverGradientMap[config.color]} hover:text-white opacity-80 hover:opacity-100`
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default FilterBar;
