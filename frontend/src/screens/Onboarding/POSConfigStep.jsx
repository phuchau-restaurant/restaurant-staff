import React from 'react';

const POSConfigStep = ({ posConfig, setPosConfig }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Cấu hình POS</h2>
      <p className="text-gray-600">Chọn loại thiết bị và máy in</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Loại POS</label>
          <div className="grid grid-cols-3 gap-4">
            {['PC', 'Tablet', 'Mobile'].map((type) => (
              <button
                key={type}
                onClick={() => setPosConfig({ ...posConfig, posType: type })}
                className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                  posConfig.posType === type
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Máy in hóa đơn</label>
          <input
            type="text"
            value={posConfig.billPrinter}
            onChange={(e) => setPosConfig({ ...posConfig, billPrinter: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Tên máy in hoặc địa chỉ IP"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Máy in bếp</label>
          <input
            type="text"
            value={posConfig.kitchenPrinter}
            onChange={(e) => setPosConfig({ ...posConfig, kitchenPrinter: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Tên máy in hoặc địa chỉ IP"
          />
        </div>
      </div>
    </div>
  );
};

export default POSConfigStep;
