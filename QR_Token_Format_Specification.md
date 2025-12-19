# Đặc Tả Định Dạng QR Token

Tài liệu này mô tả cấu trúc và nội dung của QR token được sử dụng để xác thực khách hàng và nhận diện bàn trong hệ thống quản lý nhà hàng.

## 1. Tổng Quan

QR token là một JWT (JSON Web Token) được mã hóa trong định dạng mã QR, chứa thông tin nhận diện bàn và tenant để khách hàng có thể quét và truy cập menu đặt món.

## 2. Kiến Trúc Token

### 2.1 Cấu Trúc Tổng Thể

QR token bao gồm 3 lớp:

1. **Lớp QR Code**: Biểu diễn trực quan dưới dạng mã QR có thể quét
2. **Lớp JWT**: Token được mã hóa theo chuẩn JWT (Header.Payload.Signature)
3. **Lớp Dữ Liệu**: Thông tin bàn và tenant được cấu trúc

### 2.2 Cấu Trúc JWT

Token tuân theo chuẩn JWT với 3 phần được phân cách bởi dấu chấm:

```
HEADER.PAYLOAD.SIGNATURE
```

#### 2.2.1 Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- `alg`: Thuật toán mã hóa (HS256 - HMAC SHA-256)
- `typ`: Loại token (JWT)

#### 2.2.2 Payload

Chứa thông tin bàn và tenant:

```json
{
  "tenantId": "uuid-cua-nha-hang",
  "tableId": 15,
  "tableNumber": "A15",
  "tableLocation": "INSIDE",
  "iat": 1702920000,
  "exp": 1734542400,
  "purpose": "customer_qr_access"
}
```

**Các trường bắt buộc:**

| Trường          | Loại    | Mô Tả                           |
| --------------- | ------- | ------------------------------- |
| `tenantId`      | UUID    | Mã định danh nhà hàng           |
| `tableId`       | Integer | ID bàn trong database           |
| `tableNumber`   | String  | Số bàn hiển thị (VD: "A15")     |
| `tableLocation` | String  | Vị trí bàn (INSIDE/OUTSIDE/VIP) |
| `iat`           | Number  | Thời điểm phát hành (Unix)      |
| `exp`           | Number  | Thời điểm hết hạn (Unix)        |
| `purpose`       | String  | Luôn là "customer_qr_access"    |

#### 2.2.3 Signature

Chữ ký được tạo bằng HMAC-SHA256 để đảm bảo tính toàn vẹn:

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

## 3. Mã QR Code

### 3.1 Cấu Hình Mã QR

| Tham Số           | Giá Trị                 |
| ----------------- | ----------------------- |
| Phiên Bản         | Tự động (4-6)           |
| Sửa Lỗi           | M (15%)                 |
| Kích Thước Module | 8-10 pixels             |
| Kích Thước In     | 5cm x 5cm (khuyến nghị) |

### 3.2 URL Trong Mã QR

Định dạng URL được nhúng trong mã QR:

```
https://{domain}/customer/login?token={JWT_TOKEN}
```

**Ví dụ:**

```
https://restaurant-app.com/customer/login?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Ví Dụ Token Hoàn Chỉnh

**JWT Token:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTBhYiIsInRhYmxlSWQiOjE1LCJ0YWJsZU51bWJlciI6IkExNSIsInRhYmxlTG9jYXRpb24iOiJJTlNJREUiLCJpYXQiOjE3MDI5MjAwMDAsImV4cCI6MTczNDU0MjQwMCwicHVycG9zZSI6ImN1c3RvbWVyX3FyX2FjY2VzcyJ9.signature
```

**Header (giải mã):**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (giải mã):**

```json
{
  "tenantId": "12345678-1234-1234-1234-1234567890ab",
  "tableId": 15,
  "tableNumber": "A15",
  "tableLocation": "INSIDE",
  "iat": 1702920000,
  "exp": 1734542400,
  "purpose": "customer_qr_access"
}
```

---

## 5. Lưu Ý Bảo Mật

- **Khóa bí mật**: Tối thiểu 256 bits, lưu trong biến môi trường
- **Thời hạn token**: Mã QR bàn cố định nên có thời hạn 1+ năm
- **Xác thực**: Luôn kiểm tra chữ ký và thời hạn token trước khi sử dụng
- **HTTPS**: Bắt buộc sử dụng HTTPS cho tất cả endpoint

---

## 6. Quy Trình Xử Lý Token

### 6.1 Khi Khách Quét Mã QR

1. Quét mã QR → Nhận URL chứa JWT token
2. Gửi token đến server để xác thực
3. Server kiểm tra:
   - Chữ ký hợp lệ
   - Token chưa hết hạn
   - TenantId và TableId tồn tại
   - Bàn ở trạng thái khả dụng
4. Nếu hợp lệ → Cấp quyền truy cập menu

### 6.2 Mã Lỗi Cơ Bản

| Mã    | Lỗi               | Mô Tả                      |
| ----- | ----------------- | -------------------------- |
| QR001 | INVALID_FORMAT    | Token không đúng định dạng |
| QR002 | SIGNATURE_INVALID | Chữ ký không hợp lệ        |
| QR003 | TOKEN_EXPIRED     | Token đã hết hạn           |
| QR004 | TENANT_NOT_FOUND  | Không tìm thấy nhà hàng    |
| QR005 | TABLE_NOT_FOUND   | Không tìm thấy bàn         |

---

### 6.2 Danh Sách Kiểm Tra Xác Thực

**Xác Thực Bắt Buộc:**

- [ ] Định dạng token là JWT hợp lệ
- [ ] Xác minh chữ ký thành công
- [ ] Token chưa hết hạn (`exp` > thời gian hiện tại)
- [ ] Token đã được phát hành trong quá khứ (`iat` ≤ thời gian hiện tại)
- [ ] `tenantId` tồn tại trong cơ sở dữ liệu
- [ ] `tableId` tồn tại cho tenant đã chỉ định
- [ ] `tableNumber` khớp với bản ghi trong cơ sở dữ liệu
- [ ] Trường `purpose` bằng "customer_qr_access"
- [ ] Token không nằm trong danh sách thu hồi

**Xác Thực Tùy Chọn:**

- [ ] Trạng thái bàn là "AVAILABLE" hoặc "OCCUPIED"
- [ ] Vị trí bàn khớp với giá trị mong đợi
- [ ] Số lần sử dụng token trong phạm vi chấp nhận
- [ ] Yêu cầu đến từ khu vực địa lý mong đợi

### 6.3 Xử Lý Lỗi

**Mã Lỗi Chuẩn:**

| Mã    | Lỗi               | Mô Tả                          | Hành Động       |
| ----- | ----------------- | ------------------------------ | --------------- |
| QR001 | INVALID_FORMAT    | Token không phải là JWT hợp lệ | Từ chối với 400 |
| QR002 | SIGNATURE_INVALID | Xác minh chữ ký thất bại       | Từ chối với 401 |
| QR003 | TOKEN_EXPIRED     | Token đã quá thời gian hết hạn | Từ chối với 401 |
| QR004 | TENANT_NOT_FOUND  | TenantId không tồn tại         | Từ chối với 404 |
| QR005 | TABLE_NOT_FOUND   | TableId không tồn tại          | Từ chối với 404 |
| QR006 | TABLE_UNAVAILABLE | Bàn không khả dụng để sử dụng  | Từ chối với 403 |
| QR007 | REVOKED_TOKEN     | Token đã bị thu hồi            | Từ chối với 401 |
| QR008 | INVALID_PURPOSE   | Claim purpose không chính xác  | Từ chối với 400 |

---

## 7. Hướng Dẫn Triển Khai

### 7.1 Triển Khai Backend

#### 7.1.1 Dịch Vụ Tạo Token

```javascript
class QRTokenService {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  generateToken(tableData) {
    const payload = {
      tenantId: tableData.tenantId,
      tableId: tableData.id,
      tableNumber: tableData.tableNumber,
      tableLocation: tableData.location,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year
      purpose: "customer_qr_access",
    };

    return jwt.sign(payload, this.secretKey, {
      algorithm: "HS256",
    });
  }

  validateToken(token) {
    try {
      const decoded = jwt.verify(token, this.secretKey, {
        algorithms: ["HS256"],
      });

      // Additional validations
      if (decoded.purpose !== "customer_qr_access") {
        throw new Error("Invalid token purpose");
      }

      return { valid: true, data: decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}
```

#### 7.1.2 Tạo Mã QR

```javascript
const QRCode = require("qrcode");

async function generateQRCode(token, options = {}) {
  const url = `${process.env.FRONTEND_URL}/customer/scan?token=${token}`;

  const qrOptions = {
    errorCorrectionLevel: "M",
    type: "image/png",
    quality: 1,
    margin: 4,
    width: options.width || 300,
    color: {
      dark: options.darkColor || "#000000",
      light: options.lightColor || "#FFFFFF",
    },
  };

  const qrCodeDataURL = await QRCode.toDataURL(url, qrOptions);
  return qrCodeDataURL;
}
```

### 7.2 Triển Khai Frontend

#### 7.2.1 Quét Mã QR

```javascript
import { Html5QrcodeScanner } from "html5-qrcode";

class QRScanner {
  constructor(elementId) {
    this.scanner = new Html5QrcodeScanner(elementId, {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });
  }

  start(onScanSuccess, onScanError) {
    this.scanner.render(onScanSuccess, onScanError);
  }

  stop() {
    this.scanner.clear();
  }
}

// Sử dụng
const scanner = new QRScanner("qr-reader");
scanner.start(
  async (decodedText) => {
    const url = new URL(decodedText);
    const token = url.searchParams.get("token");

    if (token) {
      await validateAndRedirect(token);
    }
  },
  (error) => console.error("Lỗi quét:", error)
);
```

#### 7.2.2 Yêu Cầu Xác Thực Token

```javascript
async function validateAndRedirect(token) {
  try {
    const response = await fetch("/api/customer/validate-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error("Mã QR không hợp lệ");
    }

    const data = await response.json();

    // Lưu phiên và chuyển hướng
    localStorage.setItem("tableToken", token);
    localStorage.setItem("tableInfo", JSON.stringify(data.table));
    window.location.href = `/customer/menu?tableId=${data.table.id}`;
  } catch (error) {
    alert("QR code không hợp lệ hoặc đã hết hạn");
  }
}
```

### 7.3 Khuyến Nghị Schema Cơ Sở Dữ Liệu

```sql
-- Bảng Thu Hồi Token
CREATE TABLE qr_token_revocations (
  id SERIAL PRIMARY KEY,
  jti VARCHAR(255) UNIQUE NOT NULL,
  tenant_id UUID NOT NULL,
  table_id INTEGER NOT NULL,
  revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  INDEX idx_jti (jti),
  INDEX idx_tenant_table (tenant_id, table_id)
);

-- Theo Dõi Sử Dụng Token
CREATE TABLE qr_token_usage (
  id SERIAL PRIMARY KEY,
  token_hash VARCHAR(64) NOT NULL,
  tenant_id UUID NOT NULL,
  table_id INTEGER NOT NULL,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  INDEX idx_token_hash (token_hash),
  INDEX idx_scanned_at (scanned_at)
);
```

---

## 8. Kiểm Thử và Đảm Bảo Chất Lượng

### 8.1 Kiểm Thử Đơn Vị

**Các Trường Hợp Kiểm Thử:**

1. **Tạo Token**

   - Dữ liệu bàn hợp lệ tạo ra JWT hợp lệ
   - Token chứa tất cả các claims bắt buộc
   - Chữ ký token hợp lệ

2. **Xác Thực Token**

   - Token hợp lệ vượt qua tất cả kiểm tra
   - Token hết hạn bị từ chối
   - Chữ ký không hợp lệ bị từ chối
   - Phát hiện claims bị thiếu

3. **Tạo Mã QR**
   - Mã QR chứa URL chính xác
   - Mã QR có thể quét bằng các thiết bị đọc chuẩn
   - Mức độ sửa lỗi chính xác

### 8.2 Kiểm Thử Tích Hợp

**Các Kịch Bản Kiểm Thử:**

1. Luồng khách hàng từ đầu đến cuối từ quét đến truy cập menu
2. Xác minh cô lập đa tenant
3. Xử lý token hết hạn
4. Hiệu quả của cơ chế thu hồi
5. Quét đồng thời cùng một mã QR
6. Khôi phục sau lỗi mạng

### 8.3 Kiểm Thử Bảo Mật

**Danh Sách Kiểm Toán Bảo Mật:**

- [ ] Phát hiện các nỗ lực giả mạo token
- [ ] Token hết hạn không thể sử dụng
- [ ] Khóa bí mật không bị lộ trong logs hoặc lỗi
- [ ] Bắt buộc HTTPS cho tất cả thao tác token
- [ ] Giới hạn tốc độ ngăn chặn tấn công brute force
- [ ] Thu hồi token được thực thi đúng cách

---

## 9. Các Cân Nhắc Về Hiệu Suất

### 9.1 Chiến Lược Tối ưu Hóa

**Tạo Token:**

- Cache các token đã tạo cho mã QR bàn tĩnh
- Tạo token theo lô cho nhiều bàn
- Sử dụng xử lý bất đồng bộ cho việc tạo hàng loạt

**Xác Thực Token:**

- Triển khai cache trong bộ nhớ cho các token được xác thực thường xuyên
- Sử dụng connection pooling cho truy vấn cơ sở dữ liệu
- Tối ưu hóa chỉ mục cơ sở dữ liệu cho việc tìm kiếm tenant và bàn

**Tạo Mã QR:**

- Tạo trước mã QR cho các lắp đặt cố định
- Sử dụng CDN cho việc phân phối hình ảnh mã QR
- Triển khai lazy loading cho thư viện mã QR

### 9.2 Chỉ Số Khả Năng Mở Rộng

**Hiệu Suất Mục Tiêu:**

| Chỉ Số                   | Mục Tiêu  | Phương Pháp Đo Lường     |
| ------------------------ | --------- | ------------------------ |
| Thời Gian Tạo Token      | < 10ms    | Đo thời gian phía server |
| Thời Gian Xác Thực Token | < 50ms    | Bao gồm tra cứu DB       |
| Tạo Mã QR                | < 100ms   | Đầu ra PNG               |
| Quét Đồng Thời           | 1000/giây | Kiểm thử tải             |
| Tỉ Lệ Truyền Cache Token | > 80%     | Giám sát cache           |

---

## 10. Bảo Trì và Vận Hành

### 10.1 Giám Sát

**Các Chỉ Số Chính Cần Theo Dõi:**

- Tốc độ tạo token
- Tỉ lệ xác thực thành công/thất bại
- Tần suất token hết hạn
- Yêu cầu thu hồi
- Tỉ lệ lỗi quét
- Độ trễ xác thực trung bình

### 10.2 Ghi Log

**Các Sự Kiện Log Khuyến Nghị:**

```json
{
  "event": "qr_token_generated",
  "timestamp": "2025-12-18T10:30:00Z",
  "tenantId": "12345678-1234-1234-1234-1234567890ab",
  "tableId": 15,
  "expiresAt": "2026-12-18T10:30:00Z"
}
```

```json
{
  "event": "qr_token_validated",
  "timestamp": "2025-12-18T10:35:00Z",
  "tenantId": "12345678-1234-1234-1234-1234567890ab",
  "tableId": 15,
  "success": true,
  "latency": 45
}
```

### 10.3 Ứng Phó Sự Cố

**Các Vấn Đề Thường Gặp và Giải Pháp:**

| Vấn Đề             | Triệu Chứng                 | Giải Pháp                                                |
| ------------------ | --------------------------- | -------------------------------------------------------- |
| Nhiều lỗi xác thực | Tăng lỗi 401                | Kiểm tra xoay vòng khóa bí mật, xác minh tạo token       |
| Xác thực chậm      | Độ trễ cao                  | Tối ưu hóa truy vấn cơ sở dữ liệu, tăng kích thước cache |
| Lỗi quét mã QR     | Khách hàng phàn nàn         | Xác minh chất lượng mã QR, kiểm tra điều kiện ánh sáng   |
| Trễ thu hồi token  | Token đã thu hồi vẫn hợp lệ | Kiểm tra đồng bộ danh sách thu hồi, xóa cache            |

---

## 11. Di Chuyển và Quản Lý Phiên Bản

### 11.1 Lịch Sử Phiên Bản

| Phiên Bản | Ngày       | Thay Đổi       | Phá Vỡ |
| --------- | ---------- | -------------- | ------ |
| 1.0       | 2025-12-18 | Đặc tả ban đầu | Không  |

### 11.2 Cải Tiến Tương Lai

**Các Tính Năng Dự Kiến:**

1. **Mã QR Động**: Hỗ trợ xoay vòng mã QR dựa trên thời gian
2. **Xác Thực Nhiều Yếu Tố**: Các lớp xác minh bổ sung
3. **Tích Hợp Sinh Trắc Học**: Nhận diện vân tay/khuôn mặt với QR
4. **Bảng Điều Khiển Phân Tích**: Phân tích sử dụng token toàn diện
5. **Tùy Chỉnh Thương Hiệu**: Tùy biến mã QR theo tenant

### 11.3 Tương Thích Ngược

Đặc tả này cam kết duy trì tương thích ngược cho:

- Cấu trúc định dạng token (tối thiểu 2 năm)
- Các endpoint API (với thông báo ngừng sử dụng)
- Định nghĩa mã lỗi

---

## 12. Tuân Thủ và Tiêu Chuẩn

### 12.1 Tuân Thủ Tiêu Chuẩn

Đặc tả này tuân thủ:

- **RFC 7519**: JSON Web Token (JWT)
- **ISO/IEC 18004**: Đặc tả ký hiệu mã vạch QR Code
- **OWASP**: Thực hành lập trình bảo mật
- **GDPR**: Yêu cầu bảo mật dữ liệu (nếu áp dụng)

### 12.2 Bảo Mật Dữ Liệu

**Xử Lý Dữ Liệu Cá Nhân:**

- QR token không chứa thông tin cá nhân của khách hàng
- Log quét token nên được ẩn danh hóa
- Dữ liệu thu hồi token nên có giới hạn lưu trữ
- Tuân thủ quy định bảo vệ dữ liệu địa phương

---

## 13. Tham Khảo

### 13.1 Tiêu Chuẩn Kỹ Thuật

1. RFC 7519 - JSON Web Token (JWT): https://tools.ietf.org/html/rfc7519
2. ISO/IEC 18004:2015 - Đặc Tả QR Code
3. OWASP JWT Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html

### 13.2 Thư Viện và Công Cụ

**Thư Viện Khuyến Nghị:**

- **Node.js**: `jsonwebtoken`, `qrcode`
- **Python**: `PyJWT`, `qrcode`
- **Java**: `jjwt`, `zxing`
- **Frontend**: `html5-qrcode`, `qrcode.react`

### 13.3 Tài Liệu Liên Quan

- [CUSTOMER_QR_FLOW.md](./backend/CUSTOMER_QR_FLOW.md) - Triển khai luồng QR khách hàng
- [AUTH_API_TESTING.md](./backend/AUTH_API_TESTING.md) - Hướng dẫn kiểm thử API xác thực
- [databaseDetail.md](./docs/databaseDetail.md) - Tài liệu schema cơ sở dữ liệu

---

## 14. Phụ Lục

### Phụ Lục A: Ví Dụ Token Đầy Đủ

**Token Đã Tạo:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTBhYiIsInRhYmxlSWQiOjE1LCJ0YWJsZU51bWJlciI6IkExNSIsInRhYmxlTG9jYXRpb24iOiJJTlNJREUiLCJpYXQiOjE3MDI5MjAwMDAsImV4cCI6MTczNDU0MjQwMCwicHVycG9zZSI6ImN1c3RvbWVyX3FyX2FjY2VzcyJ9.xYz9KqpL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3i
```

**Header Đã Giải Mã:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload Đã Giải Mã:**

```json
{
  "tenantId": "12345678-1234-1234-1234-1234567890ab",
  "tableId": 15,
  "tableNumber": "A15",
  "tableLocation": "INSIDE",
  "iat": 1702920000,
  "exp": 1734542400,
  "purpose": "customer_qr_access"
}
```

### Phụ Lục B: Đặc Tả Trực Quan Mã QR

**Kích Thước:**

- Kích thước tối thiểu: 2cm x 2cm (in ấn)
- Kích thước khuyến nghị: 5cm x 5cm (in ấn)
- Hiển thị kỹ thuật số: tối thiểu 300px x 300px

**Hướng Dẫn Về Màu Sắc:**

- Yêu cầu độ tương phản cao (tối trên sáng)
- Tránh kết hợp đỏ/xanh lá
- Kiểm tra khả năng đọc dưới nhiều điều kiện ánh sáng khác nhau

**Khuyến Nghị Về Vị Trí Đặt:**

- Ngang tầm mắt hoặc dễ tiếp cận
- Được bảo vệ khỏi ánh sáng mặt trời trực tiếp
- Bề mặt sạch, phẳng
- Xa các vật liệu phản quang

### Phụ Lục C: Hướng Dẫn Khắc Phục Sự Cố

**Vấn Đề: Mã QR Không Quét Được**

- Kiểm tra quyền camera
- Đảm bảo ánh sáng đầy đủ
- Xác minh mã QR không bị hư hỏng
- Thử các góc quét khác nhau
- Làm sạch ống kính camera

**Vấn Đề: Xác Thực Token Thất Bại**

- Xác minh token chưa hết hạn
- Kiểm tra cấu hình khóa bí mật
- Xác nhận tenant và bàn tồn tại
- Xem lại log server để tìm lỗi cụ thể

**Vấn Đề: Hiệu Suất Chậm**

- Bật cache token
- Tối ưu hóa chỉ mục cơ sở dữ liệu
- Kiểm tra độ trễ mạng
- Xem xét tài nguyên server

---
