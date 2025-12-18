// Định nghĩa một Object đóng vai trò như Enum giả lập
const OrderDetailStatus = {
    PENDING: 'Pending',
    READY: 'Ready',
    SERVED: 'Served',
    CANCELLED: 'Cancelled'
};

// Đóng băng object để không thể thay đổi
Object.freeze(OrderDetailStatus);

export default OrderDetailStatus;