# Hướng dẫn nhanh - Tính năng Gọi Nhân Viên

## 🚀 Cài đặt Socket.IO Client

```bash
cd frontend
npm install socket.io-client
```

## 📱 Sử dụng cho ứng dụng Nhân Viên

### 1. Import và sử dụng component

```jsx
import StaffNotificationPanel from './components/StaffNotificationPanel';

function App() {
  return (
    <div>
      {/* Component này sẽ tự động lắng nghe và hiển thị thông báo */}
      <StaffNotificationPanel />
    </div>
  );
}
```

### 2. Hoặc sử dụng hook trực tiếp

```jsx
import { useStaffNotifications } from './hooks/useStaffNotifications';

function MyComponent() {
  const { notifications, isConnected, unreadCount } = useStaffNotifications();
  
  return (
    <div>
      <p>Kết nối: {isConnected ? '✅' : '❌'}</p>
      <p>Thông báo chưa đọc: {unreadCount}</p>
    </div>
  );
}
```

## 👥 Sử dụng cho ứng dụng Khách hàng

### Import và sử dụng button

```jsx
import CustomerCallStaffButton from './components/CustomerCallStaffButton';

function OrderPage() {
  const tableNumber = "A1";
  const tableId = 1;
  const orderId = 123;
  
  return (
    <div>
      {/* Nút gọi thanh toán */}
      <CustomerCallStaffButton
        tableNumber={tableNumber}
        tableId={tableId}
        orderId={orderId}
        requestType="payment"
      />
      
      {/* Nút gọi phục vụ */}
      <CustomerCallStaffButton
        tableNumber={tableNumber}
        tableId={tableId}
        orderId={orderId}
        requestType="service"
      />
    </div>
  );
}
```

## 🔧 Cấu hình

### Environment Variables (.env)

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Token Storage

Đảm bảo token được lưu trong localStorage:

**Nhân viên:**
```javascript
localStorage.setItem('token', 'your-staff-token');
```

**Khách hàng:**
```javascript
localStorage.setItem('customerToken', 'your-customer-token');
// hoặc
localStorage.setItem('token', 'your-customer-token');
```

## 🎵 Âm thanh thông báo

Component đã tích hợp sẵn âm thanh sử dụng Web Audio API. Không cần file âm thanh bên ngoài!

Nếu muốn sử dụng file âm thanh riêng:

1. Đặt file âm thanh vào `public/sounds/notification.mp3`
2. Sửa trong `notificationSound.js`:

```javascript
playNotificationFromFile('/sounds/notification.mp3');
```

## 📋 API Reference

### Socket Events

**Khách hàng emit:**
- Event: `customer:call_staff`
- Data: `{ tableNumber, tableId, orderId, requestType, message }`

**Nhân viên nhận:**
- Event: `staff:customer_call`
- Data: `{ tableNumber, tableId, orderId, requestType, message, timestamp }`

### HTTP Endpoint

```bash
POST /api/customer/call-staff
Headers: x-tenant-id: <tenant-id>
Body: {
  "tableNumber": "A1",
  "tableId": 1,
  "orderId": 123,
  "requestType": "payment"
}
```

## ✅ Checklist triển khai

- [ ] Cài đặt `socket.io-client`
- [ ] Copy các file components vào project
- [ ] Cấu hình VITE_BACKEND_URL
- [ ] Đảm bảo token được lưu trong localStorage
- [ ] Test kết nối socket
- [ ] Test gọi nhân viên từ khách hàng
- [ ] Test nhận thông báo bên nhân viên
- [ ] Test âm thanh thông báo

## 🐛 Troubleshooting

**Socket không kết nối:**
- Kiểm tra backend đang chạy
- Kiểm tra token hợp lệ
- Kiểm tra CORS settings

**Không nhận thông báo:**
- Kiểm tra tenant ID khớp nhau
- Kiểm tra event name đúng
- Xem console log

**Âm thanh không phát:**
- Kiểm tra permission trên browser
- User phải tương tác với trang trước (click, tap)
- Thử sử dụng Web Audio API thay vì Audio element

## 📚 Tài liệu chi tiết

Xem file `SOCKET_CALL_STAFF_GUIDE.md` để biết thêm chi tiết.
