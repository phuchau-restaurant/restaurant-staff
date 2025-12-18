import React from 'react';
import { Upload } from 'lucide-react';

const RestaurantInfoStep = ({ restaurantInfo, setRestaurantInfo }) => {
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestaurantInfo({ ...restaurantInfo, logo: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Thông tin nhà hàng</h2>
      <p className="text-gray-600">Nhập thông tin cơ bản về nhà hàng của bạn</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tên nhà hàng</label>
          <input
            type="text"
            value={restaurantInfo.name}
            onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Nhà hàng ABC"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Loại hình</label>
          <input
            type="text"
            value={restaurantInfo.type}
            onChange={(e) => setRestaurantInfo({ ...restaurantInfo, type: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Ẩm thực Việt, Hải sản..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
          <input
            type="text"
            value={restaurantInfo.address}
            onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Logo nhà hàng</label>
          <div className="flex items-center gap-4">
            {restaurantInfo.logo ? (
              <img src={restaurantInfo.logo} alt="Logo" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300" />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <label className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-all">
              Tải lên
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Loại mô hình</label>
          <div className="grid grid-cols-3 gap-4">
            {['Cafe', 'Nhà hàng', 'Bar'].map((model) => (
              <button
                key={model}
                onClick={() => setRestaurantInfo({ ...restaurantInfo, model })}
                className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                  restaurantInfo.model === model
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfoStep;
