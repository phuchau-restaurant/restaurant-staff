# 🔧 Fix Socket.IO "Offline" trên Production (Render)

## ✅ Đã sửa

### **Backend (`backend/configs/socket.js`)**
1. ✅ Cập nhật CORS để sử dụng biến môi trường
2. ✅ Thêm `transports: ["websocket", "polling"]`
3. ✅ Tăng timeout cho production

### **Backend (`backend/server.js`)**
1. ✅ Cập nhật Express CORS để sử dụng biến môi trường

### **Frontend (`frontend/src/context/SocketContext.jsx`)**
1. ✅ Thêm `transports: ["websocket", "polling"]`
2. ✅ Thêm reconnection settings

---

## 📋 Checklist Deploy

### **1. Environment Variables trên Render:**
Đảm bảo đã thêm đầy đủ:
```bash
FRONTEND_URL=https://your-staff-frontend.onrender.com
CUSTOMER_URL=https://your-customer-frontend.onrender.com
```

### **2. Frontend Environment Variables:**
File `.env` của frontend cần có:
```bash
VITE_BACKEND_URL=https://your-backend.onrender.com
```

### **3. Deploy cả Backend và Frontend:**
- Backend: Push code lên GitHub → Render tự động deploy
- Frontend: Build và deploy với `VITE_BACKEND_URL` đúng

---

## 🔍 Kiểm tra Socket.IO hoạt động

### **Trên Browser Console:**
```javascript
// Kiểm tra kết nối
console.log("Socket connected:", socket.isConnected);

// Xem logs
// Nếu thấy "✅ Socket connected: xxx" → OK
// Nếu thấy "❌ Socket connection error" → Có vấn đề
```

### **Các lỗi thường gặp:**

#### 1. **CORS Error**
```
Access to XMLHttpRequest at 'https://backend.onrender.com/socket.io/' 
from origin 'https://frontend.onrender.com' has been blocked by CORS
```
**Giải pháp:** Kiểm tra `FRONTEND_URL` và `CUSTOMER_URL` trong Render env vars

#### 2. **WebSocket transport error**
```
WebSocket connection to 'wss://backend.onrender.com/socket.io/' failed
```
**Giải pháp:** Đã fix bằng cách thêm `transports: ["websocket", "polling"]`

#### 3. **Authentication error**
```
❌ Socket auth error: Invalid token
```
**Giải pháp:** Kiểm tra `JWT_ACCESS_SECRET` giống nhau giữa local và production

---

## 🚀 Tóm tắt thay đổi

### **Backend Socket.IO Config:**
```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.CUSTOMER_URL,
].filter(Boolean);

io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});
```

### **Frontend Socket.IO Client:**
```javascript
const newSocket = io(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  {
    auth: { token: accessToken },
    autoConnect: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  }
);
```

---

## ✅ Kết quả

Sau khi deploy:
- ✅ Socket.IO sẽ kết nối thành công
- ✅ Màn hình sẽ hiển thị "Online" thay vì "Offline"
- ✅ Real-time updates hoạt động bình thường
- ✅ Tự động reconnect khi mất kết nối

---

**Lưu ý:** Nếu vẫn gặp vấn đề, kiểm tra:
1. Render logs (Backend)
2. Browser console (Frontend)
3. Network tab → WS (WebSocket connections)
