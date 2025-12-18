import { Download, Printer } from "lucide-react";

const QRDetailModal = ({
  selectedTable,
  onClose,
  onDownloadPNG,
  onDownloadPDF,
  onPrint,
}) => {
  if (!selectedTable) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            Bàn {selectedTable.tableNumber}
          </h2>
          <p className="text-gray-600 mb-6">{selectedTable.area}</p>

          {selectedTable.qrCodeData?.qrCode ? (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 inline-block">
              <img
                src={selectedTable.qrCodeData.qrCode}
                alt={`QR Code Bàn ${selectedTable.tableNumber}`}
                className="w-[300px] h-[300px] object-contain"
              />
            </div>
          ) : (
            <div
              className="bg-gray-50 p-6 rounded-lg mb-6 flex items-center justify-center"
              style={{ width: "300px", height: "300px" }}
            >
              <div className="text-gray-500">Đang tải QR code...</div>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            Ngày tạo:{" "}
            {new Date(
              selectedTable.qrGeneratedAt || selectedTable.createdAt
            ).toLocaleDateString("vi-VN")}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => onDownloadPNG(selectedTable)}
              className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="w-6 h-6 text-gray-700" />
              <span className="text-xs font-medium">PNG</span>
            </button>
            <button
              onClick={() => onDownloadPDF(selectedTable)}
              className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="w-6 h-6 text-gray-700" />
              <span className="text-xs font-medium">PDF</span>
            </button>
            <button
              onClick={() => onPrint(selectedTable)}
              className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Printer className="w-6 h-6 text-gray-700" />
              <span className="text-xs font-medium">In</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRDetailModal;
