import React from "react";
import { UtensilsCrossed, Search } from "lucide-react";

const WaiterHeader = ({ searchOrderId, setSearchOrderId }) => {
  return (
    <div className="bg-white shadow-lg border-b-4 border-orange-400 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        {/* Header - Centered */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="bg-linear-to-br from-orange-400 to-orange-500 p-3 rounded-xl shadow-lg">
            <UtensilsCrossed size={32} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-gray-800">
              Waiter Screen
            </h1>
            <p className="text-gray-600 text-sm">
              Monitor the status of dishes from the kitchen
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm mã đơn (ví dụ: O-001)..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterHeader;
