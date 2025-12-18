import { QrCode, Download, Printer, RefreshCw } from "lucide-react";

const QRGridView = ({
  tables,
  onDownloadPNG,
  onDownloadPDF,
  onPrint,
  onRegenerateQR,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tables.map((table) => (
        <div
          key={table.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
        >
          {/* Table Info */}
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              Bàn {table.tableNumber}
            </h3>
            <p className="text-sm text-gray-600">{table.area}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                table.hasQR
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {table.hasQR ? "Có mã QR" : "Chưa có mã QR"}
            </span>
          </div>

          {/* QR Code Preview */}
          {table.hasQR && (
            <div className="flex justify-center mb-4 bg-gray-50 p-4 rounded-lg">
              {table.qrLoading ? (
                <div className="w-[180px] h-[180px] flex items-center justify-center">
                  <div className="text-gray-500 text-sm">Đang tải...</div>
                </div>
              ) : table.qrCodeData?.qrCode ? (
                <img
                  src={table.qrCodeData.qrCode}
                  alt={`QR Code Bàn ${table.tableNumber}`}
                  className="w-[180px] h-[180px] object-contain"
                />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
          )}

          {/* QR Info */}
          {table.qrGeneratedAt && (
            <p className="text-xs text-gray-500 text-center mb-4">
              Tạo ngày:{" "}
              {new Date(
                table.qrGeneratedAt || table.createdAt
              ).toLocaleDateString("vi-VN")}
            </p>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {table.hasQR ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onDownloadPNG(table)}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs"
                    title="Tải PNG"
                  >
                    <Download className="w-4 h-4" />
                    PNG
                  </button>
                  <button
                    onClick={() => onDownloadPDF(table)}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs"
                    title="Tải PDF"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => onPrint(table)}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs"
                    title="In"
                  >
                    <Printer className="w-4 h-4" />
                    PRINT
                  </button>
                </div>
                <button
                  onClick={() => onRegenerateQR(table)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tạo Lại Mã QR
                </button>
              </>
            ) : (
              <button
                onClick={() => onRegenerateQR(table)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <QrCode className="w-4 h-4" />
                Tạo Mã QR
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QRGridView;
