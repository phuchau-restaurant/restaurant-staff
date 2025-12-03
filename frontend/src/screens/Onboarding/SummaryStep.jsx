import React from 'react';

const SummaryStep = ({ restaurantInfo, tableAreas, menuGroups, staff, kdsStations, posConfig }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tóm tắt thiết lập</h2>
      <p className="text-gray-600">Xem lại thông tin trước khi hoàn tất</p>

      <div className="space-y-4">
        <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Thông tin nhà hàng</h3>
          <p><strong>Tên:</strong> {restaurantInfo.name || 'Chưa nhập'}</p>
          <p><strong>Loại hình:</strong> {restaurantInfo.type || 'Chưa nhập'}</p>
          <p><strong>Địa chỉ:</strong> {restaurantInfo.address || 'Chưa nhập'}</p>
          <p><strong>Mô hình:</strong> {restaurantInfo.model || 'Chưa chọn'}</p>
        </div>

        <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Khu vực bàn</h3>
          <p>{tableAreas.length} khu vực, tổng {tableAreas.reduce((sum, area) => sum + area.tables, 0)} bàn</p>
        </div>

        <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Thực đơn</h3>
          <p>{menuGroups.length} nhóm món, {menuGroups.reduce((sum, g) => sum + g.dishes.length, 0)} món ăn</p>
        </div>

        <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
          <h3 className="font-bold text-lg mb-2 text-blue-600">Nhân viên</h3>
          <p>{staff.length} tài khoản nhân viên</p>
        </div>

        <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
          <h3 className="font-bold text-lg mb-2 text-blue-600">KDS & POS</h3>
          <p>{kdsStations.length} station bếp</p>
          <p>POS: {posConfig.posType}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryStep;
