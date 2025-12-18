const RegenerateConfirmModal = ({ selectedTable, onConfirm, onCancel }) => {
  if (!selectedTable) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedTable.hasQR ? "Tạo Lại Mã QR?" : "Tạo Mã QR?"}
        </h2>
        <p className="text-gray-600 mb-6">
          {selectedTable.hasQR
            ? `Bạn có chắc muốn tạo lại mã QR cho Bàn ${selectedTable.tableNumber}? Mã QR cũ sẽ không còn hoạt động.`
            : `Tạo mã QR mới cho Bàn ${selectedTable.tableNumber}?`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {selectedTable.hasQR ? "Tạo Lại" : "Tạo Mã"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegenerateConfirmModal;
