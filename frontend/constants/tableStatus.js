/**
* Định nghĩa các trạng thái của bàn (Table Status)
* Tương ứng với ENUM table_status trong Database
*/
const TableStatus = {
ACTIVE: 'Active',       // Bàn đang được phép sử dụng (Logic hệ thống)
INACTIVE: 'Inactive',   // Bàn tạm ngưng hoạt động (Bảo trì, hỏng...)
AVAILABLE: 'Available', // Bàn trống, sẵn sàng đón khách
OCCUPIED: 'Occupied'    // Bàn đang có khách ngồi
};

// Đóng băng object để không thể thay đổi
Object.freeze(TableStatus);

export default TableStatus;