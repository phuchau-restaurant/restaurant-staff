import { Download, Grid, List, FileImage, FileText, Archive } from "lucide-react";

const QRStats = ({ tables, viewMode, setViewMode, onDownloadAll }) => {
  const tablesWithQR = tables.filter((t) => t.hasQR).length;
  const totalTables = tables.length;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img
          src="/images/logo.png"
          alt="Restaurant Logo"
          className="h-16 w-16 object-contain"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Mã QR</h1>
          <p className="text-gray-600 mt-1">
            Tổng số: {tablesWithQR}/{totalTables} bàn có mã QR
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => onDownloadAll("png")}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            title="Tải tất cả PNG"
          >
            <FileImage className="w-4 h-4" />
            Tải tất cả PNG
          </button>
          <button
            onClick={() => onDownloadAll("pdf")}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
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

        <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRStats;
