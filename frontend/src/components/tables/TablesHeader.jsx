import { memo } from "react";
import { Plus, QrCode } from "lucide-react";

/**
 * TablesHeader Component
 * Hiển thị tiêu đề trang và các nút action chính (QR, Thêm bàn mới)
 * 
 * @param {number} totalTables - Tổng số bàn hiện tại
 * @param {function} onCreateTable - Callback khi bấm nút "Thêm Bàn Mới"
 * @param {function} onManageQR - Callback khi bấm nút "Quản Lý QR"
 */
const TablesHeader = memo(({ totalTables, onCreateTable, onManageQR }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        {/* Tiêu đề và thông tin tổng quan */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Bàn</h1>
          <p className="text-gray-600 mt-1">
            Tổng số: {totalTables} bàn
          </p>
        </div>

        {/* Các nút action */}
        <div className="flex gap-3">
          {/* Nút quản lý QR code */}
          <button
            onClick={onManageQR}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <QrCode className="w-5 h-5" />
            Quản Lý QR
          </button>

          {/* Nút thêm bàn mới */}
          <button
            onClick={onCreateTable}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm Bàn Mới
          </button>
        </div>
      </div>
    </div>
  );
});

TablesHeader.displayName = "TablesHeader";

export default TablesHeader;
