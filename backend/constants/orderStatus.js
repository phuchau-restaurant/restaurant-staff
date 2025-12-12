// Định nghĩa một Object đóng vai trò như Enum giả lập
const OrderStatus = {
    UNSUBMIT: 'Unsubmit',
    APPROVED: 'Approved',
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    SERVED: 'Served',
    PAID: 'Paid',
    CANCELLED: 'Cancelled'
};

// Đóng băng object để không thể thay đổi
Object.freeze(OrderStatus);

export default OrderStatus;