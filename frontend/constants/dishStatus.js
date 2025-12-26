// Định nghĩa một Object đóng vai trò như Enum giả lập
const DishStatus = {
    AVAILABLE: 'Available',
    UNAVAILABLE: 'Unavailable',
    SOLD_OUT: 'Sold_out'
};

// Đóng băng object để không thể thay đổi
Object.freeze(DishStatus);
export default DishStatus;