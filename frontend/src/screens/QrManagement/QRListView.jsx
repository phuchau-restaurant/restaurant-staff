import { QrCode, Loader2 } from "lucide-react";

const QRListView = ({
  tables,
  onDownloadPDF,
  onPrint,
  onRegenerateQR,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Số Bàn
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Khu Vực
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Mã QR
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              QR Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ngày Tạo
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Thao Tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tables.map((table) => (
            <tr key={table.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <span className="text-lg font-semibold">
                  Bàn {table.tableNumber}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-700">{table.area}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    table.hasQR
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {table.hasQR ? "Có" : "Chưa có"}
                </span>
              </td>
              <td className="px-6 py-4">
                {table.hasQR && (
                  <div className="flex justify-center">
                    {table.qrLoading ? (
                      <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      </div>
                    ) : table.qrCodeData?.qrCode ? (
                      <img
                        src={table.qrCodeData.qrCode}
                        alt={`QR ${table.tableNumber}`}
                        className="w-20 h-20 object-contain bg-gray-50 rounded p-1"
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded">
                        <QrCode className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {table.qrGeneratedAt
                  ? new Date(table.qrGeneratedAt).toLocaleDateString("vi-VN")
                  : new Date(table.createdAt).toLocaleDateString("vi-VN")}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 justify-end">
                  {table.hasQR ? (
                    <>
                      <button
                        onClick={() => onDownloadPDF(table)}
                        className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => onPrint(table)}
                        className="px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm"
                      >
                        In
                      </button>
                      <button
                        onClick={() => onRegenerateQR(table)}
                        className="px-3 py-1 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 text-sm"
                      >
                        Tạo lại
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onRegenerateQR(table)}
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
  );
};

export default QRListView;
