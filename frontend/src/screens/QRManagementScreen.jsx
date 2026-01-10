import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import QRStats from "./QrManagement/QRStats";
import QRGridView from "./QrManagement/QRGridView";
import QRListView from "./QrManagement/QRListView";
import RegenerateConfirmModal from "./QrManagement/RegenerateConfirmModal";
import AlertModal from "../components/Modal/AlertModal";
import QRFilterBar from "../components/qr/QRFilterBar";
import { useAlert } from "../hooks/useAlert";
import * as tableService from "../services/tableService";
import { sortByTableNumber } from "../utils/tableUtils";

// Socket hooks for real-time updates
import { useQRSocket } from "../hooks/useQRSocket";

const QRManagementScreen = () => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedTable, setSelectedTable] = useState(null);
  const {
    alert: alertState,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert,
  } = useAlert();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [qrStatusFilter, setQRStatusFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("");
  const [sortBy, setSortBy] = useState("tableNumber");
  const [areaOptions, setAreaOptions] = useState([
    { value: "", label: "Tất cả khu vực" },
  ]);

  // ==================== SOCKET REAL-TIME UPDATES ====================

  // Handler for QR generated/regenerated (from other tabs/users)
  const handleSocketQRGenerated = useCallback(async (data) => {
    console.log("🔔 [Socket] QR generated:", data);
    await fetchTables(); // Re-fetch để có dữ liệu mới nhất
  }, []);

  // Handler for QR deleted (from other tabs/users)
  const handleSocketQRDeleted = useCallback(async (data) => {
    console.log("🔔 [Socket] QR deleted:", data);
    await fetchTables(); // Re-fetch để có dữ liệu mới nhất
  }, []);

  // Connect socket listeners and get connection status
  const { isConnected: socketConnected } = useQRSocket({
    onQRGenerated: handleSocketQRGenerated,
    onQRDeleted: handleSocketQRDeleted,
  });

  // ==================== LIFECYCLE ====================

  useEffect(() => {
    fetchTables();
    fetchLocationOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAndSortTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables, searchTerm, qrStatusFilter, areaFilter, sortBy]);

  const fetchLocationOptions = async () => {
    try {
      const options = await tableService.fetchLocationOptions();
      setAreaOptions(options);
    } catch (error) {
      console.error("Error fetching area options:", error);
    }
  };

  const filterAndSortTables = () => {
    let result = [...tables];

    // Filter theo search term
    if (searchTerm) {
      result = result.filter(
        (table) =>
          table.tableNumber
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          table.area?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter theo QR status
    if (qrStatusFilter === "generated") {
      result = result.filter((table) => table.hasQR);
    } else if (qrStatusFilter === "notGenerated") {
      result = result.filter((table) => !table.hasQR);
    }

    // Filter theo khu vực
    if (areaFilter) {
      result = result.filter((table) => table.area === areaFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "tableNumber") {
        return sortByTableNumber(a, b);
      }
      if (sortBy === "area") {
        return (a.area || "").localeCompare(b.area || "");
      }
      if (sortBy === "qrGeneratedAt") {
        const dateA = new Date(a.qrGeneratedAt || 0);
        const dateB = new Date(b.qrGeneratedAt || 0);
        return dateB - dateA; // Mới nhất trước
      }
      return 0;
    });

    setFilteredTables(result);
  };

  // TODO: [API INTEGRATION] Kết nối API lấy QR code cho từng bàn
  // Endpoint: GET /api/admin/tables/:id/qr/view
  // Response: { data: { tableId, tableNumber, qrCode (base64), customerLoginUrl, qrTokenCreatedAt, expiresAt } }
  const fetchQRForTable = async (tableId) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, qrLoading: true } : t))
    );

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/tables/${tableId}/qr/view`,
        {
          headers: {
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const result = await response.json();

      if (response.ok && result.data) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === tableId
              ? { ...t, qrCodeData: result.data, qrLoading: false }
              : t
          )
        );
      }
    } catch (error) {
      console.error("Error fetching QR:", error);
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, qrLoading: false } : t))
      );
    }
  };

  // TODO: [API INTEGRATION] Kết nối API lấy danh sách bàn
  // Endpoint: GET /api/admin/tables
  // Headers: x-tenant-id
  // Response: { success: true, data: [{ id, tableNumber, area, qrToken, qrTokenCreatedAt, ... }] }
  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables`,
        {
          headers: {
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
          },
        }
      );
      const result = await response.json();

      if (result.success) {
        const tablesData = result.data.map((table) => ({
          ...table,
          area: table.location,
          hasQR: !!table.qrToken,
          qrGeneratedAt: table.qrTokenCreatedAt,
          qrCodeData: null,
          qrLoading: false,
        }));

        setTables(tablesData);

        // Fetch QR codes cho các bàn có QR
        tablesData.forEach((table) => {
          if (table.hasQR) {
            fetchQRForTable(table.id);
          }
        });
      } else {
        setTables([]);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateQR = (table) => {
    setSelectedTable(table);
  };

  // TODO: [API INTEGRATION] Kết nối API tạo/tạo lại QR code
  // Endpoint: POST /api/admin/tables/:id/qr/generate
  // Headers: Authorization, x-tenant-id
  // Response: { success: true, message: "...", data: { ... } }
  const confirmRegenerateQR = async () => {
    if (!selectedTable) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables/${
          selectedTable.id
        }/qr/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const result = await response.json();

      if (response.ok) {
        showSuccess(
          `Đã tạo ${selectedTable.hasQR ? "lại" : ""} mã QR cho Bàn ${
            selectedTable.tableNumber
          } thành công!`
        );
        setSelectedTable(null);
        fetchTables(); // Reload danh sách bàn
      } else {
        showError(result.message || "Tạo mã QR thất bại");
      }
    } catch (error) {
      console.error("Error generating QR:", error);
      showError("Lỗi kết nối server");
    }
  };

  // TODO: [FEATURE] Download QR code dạng PNG
  // Sử dụng qrCodeData.qrCode (base64) để tải xuống
  const handleDownloadPNG = async (table) => {
    if (!table.hasQR) {
      showWarning("Bàn này chưa có mã QR");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables/${
          table.id
        }/qr/download?format=png`,
        {
          headers: {
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-Ban-${table.tableNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR:", error);
      showError("Có lỗi khi tải mã QR");
    }
  };

  // TODO: [FEATURE] Download QR code dạng PDF
  // Có thể sử dụng thư viện jsPDF hoặc gọi API backend để generate PDF
  const handleDownloadPDF = async (table) => {
    if (!table.hasQR) {
      showWarning("Bàn này chưa có mã QR");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables/${
          table.id
        }/qr/download?format=pdf`,
        {
          headers: {
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-Ban-${table.tableNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR PDF:", error);
      showError("Có lỗi khi tải mã QR PDF");
    }
  };

  // TODO: [FEATURE] Download tất cả QR codes (batch)
  const handleDownloadAll = async (format) => {
    showInfo("Đang chuẩn bị file tải xuống...");
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/tables/qr/download-all?format=${format}`,
        {
          headers: {
            "x-tenant-id": import.meta.env.VITE_TENANT_ID,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-All-${format.toUpperCase()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess("Tải xuống thành công!");
    } catch (error) {
      console.error("Error downloading all QRs:", error);
      showError("Có lỗi khi tải tất cả mã QR");
    }
  };

  // TODO: [FEATURE] In QR code
  // Mở cửa sổ in với template HTML chứa QR code
  const handlePrint = (table) => {
    if (!table.qrCodeData?.qrCode) {
      showWarning("QR code chưa được tải. Vui lòng đợi...");
      return;
    }

    const printWindow = window.open("", "", "width=800,height=600");
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
            <p>${table.area || ""}</p>
            <div class="qr-container">
              <img src="${table.qrCodeData.qrCode}" alt="QR Code" />
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
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* QR Stats */}
      <div className="mb-6">
        <QRStats 
          tables={tables} 
          onDownloadAll={handleDownloadAll}
          socketConnected={socketConnected}
        />
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <QRFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          qrStatusFilter={qrStatusFilter}
          onQRStatusChange={setQRStatusFilter}
          areaFilter={areaFilter}
          onAreaChange={setAreaFilter}
          areaOptions={areaOptions}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* QR Codes Display */}
      {viewMode === "grid" ? (
        <QRGridView
          tables={filteredTables}
          onDownloadPNG={handleDownloadPNG}
          onDownloadPDF={handleDownloadPDF}
          onPrint={handlePrint}
          onRegenerateQR={handleRegenerateQR}
        />
      ) : (
        <QRListView
          tables={filteredTables}
          onDownloadPDF={handleDownloadPDF}
          onPrint={handlePrint}
          onRegenerateQR={handleRegenerateQR}
        />
      )}

      {/* Regenerate Confirmation Modal */}
      <RegenerateConfirmModal
        selectedTable={selectedTable}
        onConfirm={confirmRegenerateQR}
        onCancel={() => setSelectedTable(null)}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  );
};

export default QRManagementScreen;
