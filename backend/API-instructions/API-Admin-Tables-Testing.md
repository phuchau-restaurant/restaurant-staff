# Admin Tables API Testing Guide

Tài liệu hướng dẫn cách thực hiện kiểm thử các API quản lý bàn bằng Thunder Client.

## Yêu cầu chung

### Headers bắt buộc cho tất cả API:

| Key | Value | Mô tả |
| :--- | :--- | :--- |
| **`x-tenant-id`** | `019abac9-846f-75d0-8dfd-bcf9c9457866` | ID của nhà hàng/cửa hàng test |
| **`Content-Type`** | `application/json` | Định dạng request body |

> **Lưu ý:** Các API liên quan đến QR code (generate, download) **yêu cầu xác thực Admin** - thêm header `Authorization: Bearer <admin_token>`

## Chi tiết từng API

### 1. GET: Lấy danh sách tất cả bàn (có lọc)

**Endpoint:** `GET http://localhost:3000/api/admin/tables`

**Query Parameters (tuỳ chọn):**

```
?location=<tableLocation>&status=<tableStatus>
```

**Ví dụ:**

```
GET http://localhost:3000/api/admin/tables?location=Indoor&status=Available
```

**Headers:**

```json
{
  "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Tables fetched successfully with location 'MAIN' and status 'AVAILABLE'",
  "total": 5,
  "data": [
    {
      "id": 1,
      "tableNumber": "T001",
      "location": "Indoor",
      "status": "Available",
      "capacity": 4,
      "isActive": true,
      "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "createdAt": "2025-12-15T10:30:00Z",
      "updatedAt": "2025-12-15T10:30:00Z"
    }
  ]
}
```

**Thông tin tham số:**

| Tham số | Kiểu dữ liệu | Mô tả | Ví dụ |
| :--- | :--- | :--- | :--- |
| **location** | string | Vị trí bàn | `Indoor`, `Outdoor`, `Patio`, `VIP_Room` |
| **status** | string | Trạng thái bàn | `Available`, `Occupied`, `Active`, `Inactive` |

### 2. GET: Lấy chi tiết bàn theo ID

**Endpoint:** `GET http://localhost:3000/api/admin/tables/:id`

**Path Parameter:**

```
:id = Mã ID của bàn (UUID)
```

**Ví dụ:**

```
GET http://localhost:3000/api/admin/tables/550e8400-e29b-41d4-a716-446655440000
```

**Headers:**

```json
{
   
  "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Table with id {id} fetched successfully",
  "data": {
    "tableNumber": "T001",
    "location": "MAIN",
    "status": "AVAILABLE",
    "capacity": 4,
    "isActive": true,
    "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Table not found"
}
```

### 3. POST: Tạo bàn mới

**Endpoint:** `POST http://localhost:3000/api/admin/tables`

**Headers:**

```json
{
   
  "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866"
}
```

**Request Body:**

```json
{
  "tableNumber": "T010",
  "location": "Indoor",
  "capacity": 4,
  "status": "Available"
}
```

**Thông tin trường:**

| Trường | Kiểu dữ liệu | Yêu cầu | Mô tả | Ví dụ |
| :--- | :--- | :--- | :--- | :--- |
| **tableNumber** | string | Bắt buộc | Mã số bàn | `T001`, `T010` |
| **location** | string | Bắt buộc | Vị trí bàn | `Indoor`, `Outdoor`, `Patio`, `VIP_Room` |
| **capacity** | integer | Bắt buộc | Số chỗ ngồi | `2`, `4`, `6` |
| **status** | string | Tuỳ chọn | Trạng thái mặc định | `Available` (mặc định) |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Table created successfully",
  "data": {
    "tableNumber": "T010",
    "location": "Indoor",
    "capacity": 4,
    "status": "Available",
    "isActive": true,
    "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2025-12-15T11:00:00Z",
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "tableNumber is required"
}
```

### 4. PUT: Cập nhật toàn bộ thông tin bàn

**Endpoint:** `PUT http://localhost:3000/api/admin/tables/:id`

**Path Parameter:**

```
:id = Mã ID của bàn
```

**Headers:**

```json
{
   
  "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866"
}
```

**Request Body:**

```json
{
  "tableNumber": "T010",
  "location": "VIP_Room",
  "capacity": 6,
  "status": "Available"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Table with id 550e8400-e29b-41d4-a716-446655440000 updated successfully",
  "data": {
    "tableNumber": "T010",
    "location": "VIP_Room",
    "capacity": 6,
    "status": "Available",
    "isActive": true,
    "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T11:15:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Table not found"
}
```

### 5. PATCH: Cập nhật trạng thái bàn

**Endpoint:** `PATCH http://localhost:3000/api/admin/tables/:id/status`

**Path Parameter:**

```
:id = Mã ID của bàn
```

**Headers:**

```json
{
   
  "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866"
}
```

**Request Body:**

```json
{
  "status": "Occupied"
}
```

**Giá trị Status hợp lệ:**

| Giá trị | Mô tả |
| :--- | :--- |
| `Available` | Bàn trống, sẵn sàng phục vụ |
| `Occupied` | Bàn đang có khách |
| `Active` | Bàn đang được phép sử dụng |
| `Inactive` | Bàn tạm ngưng hoạt động |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Table status updated successfully",
  "data": {
    "tableNumber": "_Room",
    "capacity": 6,
    "status": "Occupied",
    "status": "OCCUPIED",
    "isActive": true,
    "updatedAt": "2025-12-15T11:30:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid status value"
}
```

### 6. POST: Tạo mã QR cho bàn (Yêu cầu Admin)

**Endpoint:** `POST http://localhost:3000/api/admin/tables/:id/qr/generate`

**Path Parameter:**

```
:id = Mã ID của bàn
```

**Headers:**

```json
{
   
  "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866",
  "Authorization": "Bearer <admin_token>"
}
```

**Request Body:** (để trống)

```json
{}
```

**Success Response (200):**

```json
{
  "message": "QR code generated successfully",
  "data": {
    "tableId": "550e8400-e29b-41d4-a716-446655440000",
    "tableNumber": "T010",
    "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "qrCodeUrl": "https://api.example.com/qr/550e8400-e29b-41d4-a716-446655440000.png",
    "expiresAt": "2025-12-17T11:45:00Z"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Admin authorization required"
}
```

### 7. GET: Tải QR code (PNG/PDF) (Yêu cầu Admin)

**Endpoint:** `GET http://localhost:3000/api/admin/tables/:id/qr/download`

**Path Parameter:**

```
:id = Mã ID của bàn
```

**Query Parameter:**

```
?format=png  (hoặc pdf)
```

**Ví dụ:**

```
GET http://localhost:3000/api/admin/tables/550e8400-e29b-41d4-a716-446655440000/qr/download?format=png
```

**Headers:**

```json
{
  "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866",
  "Authorization": "Bearer <admin_token>"
}
```

**Success Response (200):**

```
Content-Type: image/png (hoặc application/pdf)
Content-Disposition: attachment; filename="table_T010_qr.png"

[Binary file data]
```

**Format hỗ trợ:**

| Format | Content-Type | Mô tả |
| :--- | :--- | :--- |
| **png** | `image/png` | Hình ảnh PNG |
| **pdf** | `application/pdf` | Tài liệu PDF |

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid format. Use 'png' or 'pdf'"
}
```

### 8. GET: Tải tất cả QR code (ZIP) (Yêu cầu Admin)

**Endpoint:** `GET http://localhost:3000/api/admin/tables/qr/download-all`

**Query Parameter (tuỳ chọn):**

```
?format=png|pdf|all
```

**Ví dụ:**

```
GET http://localhost:3000/api/admin/tables/qr/download-all?format=png
```

**Headers:**

```json
{
  "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866",
  "Authorization": "Bearer <admin_token>"
}
```

**Success Response (200):**

```
Content-Type: application/zip
Content-Disposition: attachment; filename="qr_codes_all.zip"

[Binary ZIP file containing QR codes]
```

**Cấu trúc ZIP:**

```
//Nếu dùng format = all
qr-all.zip
├── T001_qr.png
├── T002_qr.png
├── T003_qr.png
├── T001_qr.pdf
├── T002_qr.pdf
├── T003_qr.pdf
└── ...

//Nếu dùng format = pdf
qr-all-pdf.zip
├── T001_qr.pdf
├── T002_qr.pdf
├── T003_qr.pdf
└── ...
```

**Format hỗ trợ:**

| Format | Nội dung |
| :--- | :--- |
| **png** | Chỉ chứa các file PNG |
| **pdf** | Chỉ chứa các file PDF |
| **all** | Chứa cả PNG và PDF |

## Hướng dẫn xác thực Admin

### Cách lấy Admin Token:

1. **Đăng nhập với tài khoản Admin:**

```
POST http://localhost:3000/api/auth/login
```

**Body:**

```json
{
  "email": "testadmin@gmail.com",
  "password": "123456"
}
```

2. **Sao chép token từ response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "role": "admin"
    }
  }
}
```

3. **Thêm vào header của API QR:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Ghi chú quan trọng

| Điểm | Chi tiết |
| :--- | :--- |
| **Tenant ID** | Bắt buộc cho tất cả API. Giá trị test: `019abac9-846f-75d0-8dfd-bcf9c9457866` |
| **Admin Auth** | Các API QR (generate, download) **yêu cầu** token Admin trong header `Authorization` |
| **Format** | Tất cả request body phải là JSON |
| **Port** | Mặc định server chạy tại `http://localhost:3000` |
| **Status bàn** | `Available`, `Occupied`, `Active`, `Inactive` |
| **Vị trí bàn** | `Indoor`, `Outdoor`, `Patio`, `VIP_Room` |

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Khắc phục |
| :--- | :--- | :--- |
| **Missing Tenant ID header** | Quên thêm `x-tenant-id` | Kiểm tra tab Headers, thêm header `x-tenant-id` |
| **Invalid or expired token** | Token QR hết hạn hoặc sai | Tạo lại mã QR mới bằng API generate |
| **Table not found** | ID bàn không tồn tại | Kiểm tra lại ID bàn hoặc tạo bàn mới |
| **Admin authorization required** | Chưa đăng nhập hoặc không phải Admin | Đăng nhập với tài khoản Admin và thêm token |
| **Connection refused** | Server chưa chạy | Kiểm tra lại lệnh `node server.js` |

**Tài liệu cập nhật:** 17/12/2025
