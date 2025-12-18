/**
 * Table Utils - Hàm tiện ích cho xử lý dữ liệu bàn
 */

/**
 * Lọc bàn theo từ khóa tìm kiếm
 * @param {Array} tables - Danh sách bàn
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @returns {Array} Danh sách bàn đã lọc
 */
export const filterTablesBySearch = (tables, searchTerm) => {
  if (!searchTerm) return tables;

  const term = searchTerm.toLowerCase();
  return tables.filter(
    (table) =>
      table.tableNumber?.toString().toLowerCase().includes(term) ||
      table.location?.toLowerCase().includes(term)
  );
};

/**
 * Sắp xếp bàn theo số bàn (bàn thường trước, VIP sau, sau đó theo số)
 * @param {Object} a - Bàn thứ nhất
 * @param {Object} b - Bàn thứ hai
 * @returns {number} Kết quả so sánh
 */
export const sortByTableNumber = (a, b) => {
  const parseTableNumber = (value) => {
    const str = String(value ?? "").trim().toLowerCase();
    const isVip = str.includes("vip") ? 1 : 0;
    const match = str.match(/\d+/);
    const number = match ? Number(match[0]) : 0;
    return { isVip, number };
  };

  const A = parseTableNumber(a.tableNumber);
  const B = parseTableNumber(b.tableNumber);

  // Bàn thường trước, VIP sau
  if (A.isVip !== B.isVip) {
    return A.isVip - B.isVip;
  }

  // Cùng loại thì sort theo số
  return A.number - B.number;
};

/**
 * Sắp xếp bàn theo tiêu chí
 * @param {Array} tables - Danh sách bàn
 * @param {string} sortBy - Tiêu chí sắp xếp (tableNumber, capacity, createdAt)
 * @returns {Array} Danh sách bàn đã sắp xếp
 */
export const sortTables = (tables, sortBy) => {
  const sorted = [...tables];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "tableNumber":
        return sortByTableNumber(a, b);
      
      case "capacity":
        return a.capacity - b.capacity;
      
      case "createdAt": {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB - dateA; // Mới nhất trước
      }
      
      default:
        return 0;
    }
  });

  return sorted;
};

/**
 * Lọc và sắp xếp bàn
 * @param {Array} tables - Danh sách bàn gốc
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string} sortBy - Tiêu chí sắp xếp
 * @returns {Array} Danh sách bàn đã lọc và sắp xếp
 */
export const filterAndSortTables = (tables, searchTerm, sortBy) => {
  let result = filterTablesBySearch(tables, searchTerm);
  result = sortTables(result, sortBy);
  return result;
};

/**
 * Format ngày tháng cho hiển thị
 * @param {string|Date} date - Ngày cần format
 * @returns {string} Ngày đã format
 */
export const formatDate = (date) => {
  if (!date) return "N/A";
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Lấy class CSS cho trạng thái bàn
 * @param {string} status - Trạng thái bàn
 * @returns {string} Class CSS
 */
export const getStatusColorClass = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-100 text-green-800";
    case "OCCUPIED":
      return "bg-red-100 text-red-800";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Lấy text hiển thị cho trạng thái bàn
 * @param {string} status - Trạng thái bàn
 * @returns {string} Text hiển thị
 */
export const getStatusText = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "Trống";
    case "OCCUPIED":
      return "Có khách";
    case "INACTIVE":
      return "Không hoạt động";
    default:
      return "N/A";
  }
};
