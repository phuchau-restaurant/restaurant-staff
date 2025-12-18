# Customer QR Code Authentication Flow

## Tổng quan

Hệ thống yêu cầu customer phải quét mã QR trước khi có thể đăng nhập. Điều này ngăn chặn việc người dùng truy cập trực tiếp vào endpoint `/api/customers/login` mà không qua QR code.

## ⚠️ Important Notes

- **KHÔNG SỬ DỤNG** route `/api/admin/qr/verify` (deprecated)
- **SỬ DỤNG** route `/api/customers/scan-qr` cho customer verification
- Token phải được pass qua **query parameters** (`?token=xxx`), không phải body

## Flow hoạt động

### Bước 1: Admin tạo QR Code cho bàn

```http
POST /api/admin/tables/:tableId/qr/generate
Authorization: Bearer <admin-token>
x-tenant-id: <tenant-id>
```

**Response:**

```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "qrCodeUrl": "http://restaurant-app.com/customer?token=xxx&table=123",
    "qrCodeBase64": "data:image/png;base64,...",
    "expiresAt": "2025-12-31T23:59:59.000Z"
  }
}
```

### Bước 2: Customer scan QR Code

Customer quét mã QR và được redirect đến URL có chứa `token` và `table` params:

```
http://restaurant-app.com/customer?token=xxx&table=123
```

Frontend gọi API để xác thực QR:

```http
POST /api/customers/scan-qr?token=xxx&table=123
x-tenant-id: <tenant-id>
```

**Response thành công:**

```json
{
  "success": true,
  "message": "QR code scanned successfully",
  "data": {
    "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tableNumber": "A01",
    "tableId": 123,
    "expiresIn": "24h"
  }
}
```

**Response lỗi (không có token):**

```json
{
  "success": false,
  "error": "QR token is required. Please scan the QR code.",
  "statusCode": 400
}
```

**Response lỗi (token hết hạn):**

```json
{
  "success": false,
  "error": "QR code has expired. Please request a new one.",
  "statusCode": 401
}
```

### Bước 3: Customer đăng nhập

Sau khi có `sessionToken`, customer có thể đăng nhập:

```http
POST /api/customers/login?token=<sessionToken>
x-tenant-id: <tenant-id>
Content-Type: application/json

{
  "phoneNumber": "0123456789",
  "fullName": "Nguyen Van A"
}
```

**Response thành công (customer đã tồn tại):**

```json
{
  "success": true,
  "message": "Customer fetched successfully",
  "total": 1,
  "data": {
    "phoneNumber": "0123456789",
    "fullName": "Nguyen Van A",
    "email": "test@example.com",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "tableNumber": "A01",
    "tableId": 123
  }
}
```

**Response thành công (customer mới):**

```json
{
  "success": true,
  "message": "New customer created successfully",
  "data": {
    "phoneNumber": "0123456789",
    "fullName": "Nguyen Van A",
    "email": null,
    "isActive": true,
    "createdAt": "2025-12-17T00:00:00.000Z",
    "updatedAt": "2025-12-17T00:00:00.000Z",
    "tableNumber": "A01",
    "tableId": 123
  }
}
```

**Response lỗi (không có token QR):**

```json
{
  "success": false,
  "error": "Bạn phải quét mã QR trước khi đăng nhập",
  "statusCode": 403
}
```

## Bảo mật

### 1. QR Token Middleware (`verifyQRTokenMiddleware`)

Middleware này kiểm tra:

- ✅ Token có tồn tại không
- ✅ Token có hợp lệ (JWT signature)
- ✅ Token có hết hạn không
- ✅ TableId trong token có khớp với query không
- ✅ Bàn có tồn tại trong database không
- ✅ Token có bị regenerate (vô hiệu hóa) không
- ✅ Bàn có đang active không

### 2. Session Token

Sau khi scan QR thành công, hệ thống tạo `sessionToken` có thời hạn 24h. Token này được dùng cho các request tiếp theo.

### 3. Tenant Isolation

Tất cả các route đều yêu cầu `x-tenant-id` header để đảm bảo dữ liệu được phân tách theo tenant.

## Lưu ý quan trọng

1. **Không thể truy cập trực tiếp `/api/customers/login`** mà không qua QR scan
2. **Token có thời hạn** - Customer phải scan lại QR nếu token hết hạn
3. **Token bị vô hiệu hóa** khi admin regenerate QR code mới
4. **Mỗi bàn có QR riêng** - Token chỉ hợp lệ cho bàn được chỉ định

## Example Frontend Implementation

```javascript
// 1. Customer scan QR và được redirect đến:
// http://restaurant-app.com/customer?token=xxx&table=123

// 2. Frontend lấy token từ URL
const urlParams = new URLSearchParams(window.location.search);
const qrToken = urlParams.get("token");
const tableId = urlParams.get("table");

// 3. Gọi API scan-qr để lấy sessionToken
const scanResponse = await fetch(
  `/api/customers/scan-qr?token=${qrToken}&table=${tableId}`,
  {
    method: "POST",
    headers: {
      "x-tenant-id": tenantId,
    },
  }
);

const {
  data: { sessionToken },
} = await scanResponse.json();

// 4. Lưu sessionToken vào localStorage
localStorage.setItem("qr-session-token", sessionToken);

// 5. Khi customer login, sử dụng sessionToken
const loginResponse = await fetch(
  `/api/customers/login?token=${sessionToken}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
    },
    body: JSON.stringify({
      phoneNumber: "0123456789",
      fullName: "Nguyen Van A",
    }),
  }
);
```

## Error Handling

| Status Code | Message                                  | Giải pháp                            |
| ----------- | ---------------------------------------- | ------------------------------------ |
| 400         | QR token is required                     | Phải quét QR code                    |
| 401         | Invalid or tampered QR code              | QR code không hợp lệ hoặc bị sửa đổi |
| 401         | QR code has expired                      | Yêu cầu admin tạo QR mới             |
| 401         | QR code is no longer valid               | QR đã bị regenerate, scan lại QR mới |
| 403         | Token does not match the requested table | Token không khớp với bàn             |
| 403         | This table is currently inactive         | Bàn đang không hoạt động             |
| 403         | Bạn phải quét mã QR trước khi đăng nhập  | Phải scan QR trước                   |
| 404         | Table not found                          | Bàn không tồn tại                    |
