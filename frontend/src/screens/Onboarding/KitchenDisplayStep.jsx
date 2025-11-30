import React from 'react';
import { Plus, Trash2, Info } from 'lucide-react';

const KitchenDisplayStep = ({ kdsStations, setKdsStations }) => {
  const addStation = () => {
    setKdsStations([...kdsStations, { id: Date.now(), name: `Station ${kdsStations.length + 1}`, dishes: [] }]);
  };

  const updateStationName = (id, name) => {
    setKdsStations(kdsStations.map(station => 
      station.id === id ? { ...station, name } : station
    ));
  };

  const deleteStation = (id) => {
    setKdsStations(kdsStations.filter(station => station.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <Info className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-blue-900 mb-1">Kitchen Display System (KDS) là gì?</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            KDS giúp quản lý màn hình bếp theo từng khu vực. Ví dụ:
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
            <li><strong>Station Nướng:</strong> Hiển thị các món nướng, BBQ</li>
            <li><strong>Station Chiên/Xào:</strong> Hiển thị các món chiên, xào</li>
            <li><strong>Station Đồ uống:</strong> Hiển thị các món nước, cafe</li>
          </ul>
          <p className="text-sm text-blue-800 mt-2">
            Mỗi station sẽ chỉ nhận đơn hàng của các món thuộc station đó, giúp bếp làm việc hiệu quả hơn.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800">Màn hình bếp (KDS)</h2>
      <p className="text-gray-600">Tạo các station bếp theo khu vực chế biến</p>

      <div className="space-y-4">
        {kdsStations.map((station) => (
          <div key={station.id} className="p-4 bg-white border-2 border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={station.name}
                onChange={(e) => updateStationName(station.id, e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
                placeholder="VD: Station Nướng, Station Đồ uống..."
              />
              <button
                onClick={() => deleteStation(station.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Xóa station"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                💡 <strong>Lưu ý:</strong> Sau khi hoàn tất onboarding, bạn có thể gán món ăn cho station này trong phần cài đặt menu.
              </p>
            </div>
          </div>
        ))}

        <button
          onClick={addStation}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm station bếp
        </button>
      </div>
    </div>
  );
};

export default KitchenDisplayStep;
