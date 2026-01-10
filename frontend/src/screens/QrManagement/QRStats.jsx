import { Download, Archive, FileImage, FileText } from "lucide-react";

const QRStats = ({ tables, onDownloadAll, socketConnected }) => {
  const totalTables = tables.length;
  const tablesWithQR = tables.filter((t) => t.hasQR).length;
  const tablesWithoutQR = totalTables - tablesWithQR;
  const percentageWithQR =
    totalTables > 0 ? ((tablesWithQR / totalTables) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header với socket indicator */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Quản Lý Mã QR
          </h2>
          <p className="text-gray-600">
            Tạo và quản lý mã QR cho bàn
            {/* Socket connection indicator */}
            <span
              className={`ml-3 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                socketConnected
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              {socketConnected ? "Live" : "Offline"}
            </span>
          </p>
        </div>
        {/* Original stats line, now placed here */}
        <p className="text-gray-600 mt-1">
          Tổng số: {tablesWithQR}/{totalTables} bàn có mã QR
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => onDownloadAll("png")}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            title="Tải tất cả PNG"
          >
            <FileImage className="w-4 h-4" />
            Tải tất cả PNG
          </button>
          <button
            onClick={() => onDownloadAll("pdf")}
            className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            title="Tải tất cả PDF"
          >
            <FileText className="w-4 h-4" />
            Tải tất cả PDF
          </button>
          <button
            onClick={() => onDownloadAll("all")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            title="Tải tất cả (ZIP)"
          >
            <Archive className="w-4 h-4" />
            Tải tất cả PNG & PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRStats;
