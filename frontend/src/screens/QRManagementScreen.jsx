import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Download, Printer, RefreshCw, Eye, ArrowLeft, Grid, List } from "lucide-react";
import { getAllTables, updateTable } from "../data/mockTables";

const QRManagementScreen = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedTable, setSelectedTable] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = getAllTables();
      setTables(data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQR = (table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  const handleRegenerateQR = (table) => {
    setSelectedTable(table);
    setShowRegenerateConfirm(true);
  };

  const confirmRegenerateQR = async () => {
    try {
      // Update table to regenerate QR
      await new Promise(resolve => setTimeout(resolve, 300));
      updateTable(selectedTable.id, { 
        hasQR: true,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://restaurant.com/menu?table=${selectedTable.tableNumber}&t=${Date.now()}`,
        qrGeneratedAt: new Date().toISOString()
      });
      
      setShowRegenerateConfirm(false);
      setSelectedTable(null);
      fetchTables();
      alert("Đã tạo lại mã QR thành công!");
    } catch (error) {
      console.error("Error regenerating QR:", error);
      alert("Có lỗi xảy ra khi tạo lại mã QR");
    }
  };

  const handleDownloadPNG = async (table) => {
    if (!table.qrCodeUrl) {
      alert("Bàn này chưa có mã QR");
      return;
    }

    try {
      // Download image directly
      const link = document.createElement('a');
      link.href = table.qrCodeUrl;
      link.download = `QR-Ban-${table.tableNumber}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR:", error);
      alert("Có lỗi khi tải mã QR");
    }
  };

  const handleDownloadPDF = async (table) => {
    if (!table.qrCodeUrl) {
      alert("Bàn này chưa có mã QR");
      return;
    }

    alert("Chức năng tải PDF đang được phát triển");
    // TODO: Implement PDF generation with backend QR URL
  };

  const handleDownloadAllPDF = () => {
    alert("Chức năng tải tất cả PDF đang được phát triển");
    // TODO: Implement batch PDF generation
  };

  const handlePrint = (table) => {
    if (!table.qrCodeUrl) {
      alert("Bàn này chưa có mã QR");
      return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>In mã QR - Bàn ${table.tableNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-print {
              text-align: center;
              padding: 40px;
              border: 2px solid #ddd;
            }
            h1 {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .qr-container {
              margin: 30px 0;
            }
            .qr-container img {
              width: 400px;
              height: 400px;
            }
            p {
              font-size: 24px;
              color: #666;
              margin: 10px 0;
            }
            @media print {
              body { margin: 0; }
              .qr-print { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-print">
            <h1>Bàn ${table.tableNumber}</h1>
            <p>${table.area || ''}</p>
            <div class="qr-container">
              <img src="${table.qrCodeUrl}" alt="QR Code" />
            </div>
            <p style="font-size: 28px; margin-top: 30px;">Scan to Order</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/tables")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách bàn
        </button>

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
                Tổng số: {tables.filter(t => t.hasQR).length}/{tables.length} bàn có mã QR
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadAllPDF}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Tải Tất Cả PDF
            </button>
            
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
      </div>

      {/* QR Codes Display */}
      {viewMode === "grid" ? (
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
              {table.hasQR && table.qrCodeUrl && (
                <div className="flex justify-center mb-4 bg-gray-50 p-4 rounded-lg">
                  <img 
                    src={table.qrCodeUrl} 
                    alt={`QR Code Bàn ${table.tableNumber}`}
                    className="w-[180px] h-[180px] object-contain"
                  />
                </div>
              )}

              {/* QR Info */}
              {table.qrGeneratedAt && (
                <p className="text-xs text-gray-500 text-center mb-4">
                  Tạo ngày: {new Date(table.qrGeneratedAt || table.createdAt).toLocaleDateString('vi-VN')}
                </p>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {table.hasQR ? (
                  <>
                    <button
                      onClick={() => handleViewQR(table)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Xem Chi Tiết
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleDownloadPNG(table)}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs"
                        title="Tải PNG"
                      > 
                        <Download className="w-4 h-4" />PNG
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(table)}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs"
                        title="Tải PDF"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                      <button
                        onClick={() => handlePrint(table)}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs"
                        title="In"
                      >
                        <Printer className="w-4 h-4" />PRINT
                      </button>
                    </div>
                    <button
                      onClick={() => handleRegenerateQR(table)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Tạo Lại Mã QR
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRegenerateQR(table)}
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
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số Bàn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khu Vực</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã QR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Tạo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-lg font-semibold">Bàn {table.tableNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{table.area}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      table.hasQR ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {table.hasQR ? "Có" : "Chưa có"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {table.qrGeneratedAt 
                      ? new Date(table.qrGeneratedAt).toLocaleDateString('vi-VN')
                      : new Date(table.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      {table.hasQR ? (
                        <>
                          <button
                            onClick={() => handleViewQR(table)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(table)}
                            className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => handlePrint(table)}
                            className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm"
                          >
                            In
                          </button>
                          <button
                            onClick={() => handleRegenerateQR(table)}
                            className="px-3 py-1 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 text-sm"
                          >
                            Tạo lại
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRegenerateQR(table)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Tạo QR
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Detail Modal */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Bàn {selectedTable.tableNumber}</h2>
              <p className="text-gray-600 mb-6">{selectedTable.area}</p>
              
              {selectedTable.qrCodeUrl && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6 inline-block">
                  <img 
                    src={selectedTable.qrCodeUrl} 
                    alt={`QR Code Bàn ${selectedTable.tableNumber}`}
                    className="w-[300px] h-[300px] object-contain"
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-500 mb-6">
                Ngày tạo: {new Date(selectedTable.qrGeneratedAt || selectedTable.createdAt).toLocaleDateString('vi-VN')}
              </p>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => handleDownloadPNG(selectedTable)}
                  className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-6 h-6 text-gray-700" />
                  <span className="text-xs font-medium">PNG</span>
                </button>
                <button
                  onClick={() => handleDownloadPDF(selectedTable)}
                  className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-6 h-6 text-gray-700" />
                  <span className="text-xs font-medium">PDF</span>
                </button>
                <button
                  onClick={() => handlePrint(selectedTable)}
                  className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Printer className="w-6 h-6 text-gray-700" />
                  <span className="text-xs font-medium">In</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedTable.hasQR ? "Tạo Lại Mã QR?" : "Tạo Mã QR?"}
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedTable.hasQR 
                ? `Bạn có chắc muốn tạo lại mã QR cho Bàn ${selectedTable.tableNumber}? Mã QR cũ sẽ không còn hoạt động.`
                : `Tạo mã QR mới cho Bàn ${selectedTable.tableNumber}?`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRegenerateConfirm(false);
                  setSelectedTable(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={confirmRegenerateQR}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {selectedTable.hasQR ? "Tạo Lại" : "Tạo Mã"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRManagementScreen;
