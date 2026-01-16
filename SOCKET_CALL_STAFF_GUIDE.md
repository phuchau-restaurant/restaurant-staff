# Tài liệu tích hợp Socket.IO - Tính năng Gọi Nhân Viên

## Tổng quan
Tính năng này cho phép khách hàng gọi nhân viên khi cần thanh toán hoặc hỗ trợ. Khi khách hàng bấm nút gọi, nhân viên sẽ nhận được thông báo âm thanh trên điện thoại.

## Backend đã được thiết lập

### 1. Socket.IO Event Handler
File: `backend/configs/socket.js`

**Event từ khách hàng:** `customer:call_staff`
```javascript
socket.emit("customer:call_staff", {
  tableNumber: "A1",
  tableId: 1,
  orderId: 123,
  requestType: "payment", // hoặc "service", "help"
  message: "Bàn A1 cần thanh toán"
});
```

**Event đến nhân viên:** `staff:customer_call`
```javascript
socket.on("staff:customer_call", (data) => {
  // data = {
  //   tableNumber: "A1",
  //   tableId: 1,
  //   orderId: 123,
  //   requestType: "payment",
  //   message: "Bàn A1 cần hỗ trợ thanh toán!",
  //   timestamp: "2026-01-16T06:07:48.000Z"
  // }
  
  // Phát âm thanh thông báo
  playNotificationSound();
  
  // Hiển thị thông báo
  showNotification(data.message);
});
```

### 2. HTTP API Endpoint (Alternative)
**Endpoint:** `POST /api/customer/call-staff`

**Headers:**
```
Content-Type: application/json
x-tenant-id: your-tenant-id
```

**Request Body:**
```json
{
  "tableNumber": "A1",
  "tableId": 1,
  "orderId": 123,
  "requestType": "payment",
  "message": "Bàn A1 cần thanh toán"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã gọi nhân viên thành công"
}
```

### 3. Utility Function
File: `backend/utils/customerSocketEmitters.js`

```javascript
import { emitCustomerCallStaff } from './utils/customerSocketEmitters.js';

// Sử dụng trong controller hoặc service
emitCustomerCallStaff(tenantId, {
  tableNumber: "A1",
  tableId: 1,
  orderId: 123,
  requestType: "payment",
  message: "Bàn A1 cần thanh toán"
});
```

## Frontend - Tích hợp cho ứng dụng Khách hàng

### 1. Kết nối Socket.IO

```javascript
import { io } from 'socket.io-client';

// Lấy token từ localStorage hoặc context
const token = localStorage.getItem('customerToken');
const tenantId = localStorage.getItem('tenantId');

// Kết nối socket
const socket = io('http://localhost:3000', {
  auth: {
    token: token
  },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});
```

### 2. Gọi nhân viên khi bấm nút

```javascript
const handleCallStaff = () => {
  const tableNumber = "A1"; // Lấy từ context hoặc state
  const tableId = 1;
  const orderId = currentOrder?.id;
  
  // Emit socket event
  socket.emit("customer:call_staff", {
    tableNumber: tableNumber,
    tableId: tableId,
    orderId: orderId,
    requestType: "payment",
    message: `Bàn ${tableNumber} cần thanh toán`
  });
  
  // Hiển thị thông báo cho khách hàng
  alert("Đã gọi nhân viên! Vui lòng đợi trong giây lát.");
};
```

### 3. Component ví dụ (React)

```jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const CustomerPaymentButton = ({ tableNumber, tableId, orderId }) => {
  const [socket, setSocket] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    // Kết nối socket khi component mount
    const token = localStorage.getItem('customerToken');
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCallStaff = () => {
    if (!socket) return;
    
    setIsCalling(true);
    
    socket.emit("customer:call_staff", {
      tableNumber,
      tableId,
      orderId,
      requestType: "payment",
      message: `Bàn ${tableNumber} cần thanh toán`
    });
    
    // Reset sau 3 giây
    setTimeout(() => {
      setIsCalling(false);
    }, 3000);
  };

  return (
    <button 
      onClick={handleCallStaff}
      disabled={isCalling}
      className="call-staff-button"
    >
      {isCalling ? '⏳ Đang gọi...' : '🔔 Gọi nhân viên thanh toán'}
    </button>
  );
};

export default CustomerPaymentButton;
```

## Frontend - Tích hợp cho ứng dụng Nhân viên

### 1. Lắng nghe sự kiện gọi nhân viên

```javascript
import { io } from 'socket.io-client';

const token = localStorage.getItem('staffToken');

const socket = io('http://localhost:3000', {
  auth: { token }
});

// Lắng nghe sự kiện khách hàng gọi
socket.on('staff:customer_call', (data) => {
  console.log('🔔 Khách hàng gọi:', data);
  
  // Phát âm thanh
  playNotificationSound();
  
  // Hiển thị thông báo
  showNotification({
    title: 'Khách hàng cần hỗ trợ!',
    message: data.message,
    tableNumber: data.tableNumber,
    requestType: data.requestType
  });
});
```

### 2. Phát âm thanh thông báo

```javascript
// Tạo file âm thanh hoặc sử dụng Web Audio API
const playNotificationSound = () => {
  // Cách 1: Sử dụng file âm thanh
  const audio = new Audio('/sounds/notification.mp3');
  audio.play();
  
  // Cách 2: Sử dụng Web Audio API (tạo âm thanh đơn giản)
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800; // Tần số âm thanh
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};
```

### 3. Component thông báo (React)

```jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const StaffNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    newSocket.on('staff:customer_call', (data) => {
      // Thêm thông báo mới
      setNotifications(prev => [...prev, {
        id: Date.now(),
        ...data
      }]);
      
      // Phát âm thanh
      playNotificationSound();
      
      // Tự động xóa sau 10 giây
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== Date.now()));
      }, 10000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(err => console.error('Error playing sound:', err));
  };

  return (
    <div className="notifications-container">
      {notifications.map(notif => (
        <div key={notif.id} className="notification-card">
          <h3>🔔 {notif.message}</h3>
          <p>Bàn: {notif.tableNumber}</p>
          <p>Loại: {notif.requestType}</p>
          <p>Thời gian: {new Date(notif.timestamp).toLocaleTimeString()}</p>
        </div>
      ))}
    </div>
  );
};

export default StaffNotifications;
```

## Testing

### 1. Test Socket.IO connection
```javascript
// Trong browser console (Customer app)
socket.emit("customer:call_staff", {
  tableNumber: "A1",
  tableId: 1,
  orderId: 123,
  requestType: "payment"
});
```

### 2. Test HTTP API
```bash
curl -X POST http://localhost:3000/api/customer/call-staff \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: your-tenant-id" \
  -d '{
    "tableNumber": "A1",
    "tableId": 1,
    "orderId": 123,
    "requestType": "payment"
  }'
```

## Lưu ý quan trọng

1. **Authentication**: Socket.IO yêu cầu token trong `auth` khi kết nối
2. **Tenant ID**: Mỗi tenant có room riêng, chỉ nhân viên cùng tenant mới nhận được thông báo
3. **Permission**: Cần xin permission để phát âm thanh trên mobile (iOS/Android)
4. **Background**: Trên mobile, app cần chạy foreground hoặc có background service để nhận socket events

## Các loại request type

- `payment`: Khách hàng cần thanh toán
- `service`: Khách hàng cần phục vụ thêm
- `help`: Khách hàng cần hỗ trợ khác

## Troubleshooting

### Socket không kết nối được
- Kiểm tra token có hợp lệ không
- Kiểm tra CORS settings trong `backend/server.js`
- Kiểm tra backend có chạy không

### Không nhận được thông báo
- Kiểm tra socket đã connect chưa
- Kiểm tra tenant ID có đúng không
- Kiểm tra event name có đúng không (`staff:customer_call`)

### Âm thanh không phát
- Kiểm tra permission audio
- Kiểm tra file âm thanh có tồn tại không
- Thử sử dụng Web Audio API thay vì Audio element
