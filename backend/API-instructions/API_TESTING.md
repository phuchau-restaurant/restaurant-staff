# HOW TO TEST API - by Duong Nguyen
-----

````markdown
# 🛠️ Backend API Testing Guide

Tài liệu này hướng dẫn cách khởi chạy Server và thực hiện kiểm thử API (sử dụng Thunder Client hoặc Postman), đặc biệt lưu ý về cấu hình **Multi-tenancy** bắt buộc.

---

## 1. Khởi chạy Server

Trước khi test, hãy đảm bảo bạn đã cài đặt đầy đủ các thư viện (`npm install`).

### Bước 1: Di chuyển vào thư mục Backend
Mở Terminal và trỏ vào thư mục `backend` của dự án:

```bash
cd backend
````

### Bước 2: Chạy lệnh khởi động

Sử dụng lệnh sau để bật server:

```bash
node server.js
```

> **Thành công:** Khi terminal hiện thông báo Server đã lắng nghe tại port (ví dụ: `Server running on port 3000...`), bạn có thể bắt đầu test.

-----

## 2\. Cấu hình Headers (QUAN TRỌNG ⚠️)

Hệ thống hoạt động theo kiến trúc **Multi-tenancy** (Đa khách hàng). Để thao tác thêm/xóa/sửa (CRUD) vào các tài nguyên như **Categories**, bạn **BẮT BUỘC** phải giả lập định danh Tenant thông qua HTTP Headers.

Nếu thiếu Header này, Server sẽ trả về lỗi hoặc không xác định được database schema.

### Thông tin cấu hình:

| Key | Value | Mô tả |
| :--- | :--- | :--- |
| **`x-tenant-id`** | `019abac9-846f-75d0-8dfd-bcf9c9457866` | ID định danh của nhà hàng/cửa hàng test mặc định. |

### Hướng dẫn cài đặt trên Thunder Client / Postman:

1.  Mở tab **Headers** trong request của bạn.
2.  Thêm dòng mới với thông tin sau:
      * **Header:** `x-tenant-id`
      * **Value:** `019abac9-846f-75d0-8dfd-bcf9c9457866`

> **Lưu ý:** Header Key thường không phân biệt hoa thường, nhưng khuyến khích để **chữ thường** (`x-tenant-id`) để đúng chuẩn quy ước.

-----

## 3\. Ví dụ mẫu (Sample Request)

Dưới đây là ví dụ để test API tạo mới Category.

**Endpoint:** `POST http://localhost:3000/api/categories`

**Headers:**

```json
{
  "Content-Type": "application/json", //đây là dòng mặc định -- hẳn là vậy :D
  "x-tenant-id": "019abac9-846f-75d0-8dfd-bcf9c9457866" //đây là dòng bạn cần  tự thêm
}
```

**Body (JSON):**

```json
{
  "name": "Món Khai Vị",
  "description": "Các món ăn nhẹ đầu bữa"
}
```

-----

## 4\. Xử lý lỗi thường gặp

  * **Lỗi `Missing Tenant ID header`:**

      * *Nguyên nhân:* Bạn quên thêm header `x-tenant-id` hoặc nhập sai tên header.
      * *Khắc phục:* Kiểm tra lại tab Headers xem đã tick chọn (enable) dòng `x-tenant-id` chưa.

  * **Lỗi `Connection Refused`:**

      * *Nguyên nhân:* Server chưa chạy.
      * *Khắc phục:* Kiểm tra lại terminal xem lệnh `node server.js` có đang chạy không.

<!-- end list -->

```

***

### Lời khuyên thêm từ góc độ chuyên gia:

Để chuyên nghiệp hơn và đỡ tốn công copy-paste mỗi lần tạo request mới trong Thunder Client/Postman, bạn nên sử dụng tính năng **Collection Variables** hoặc **Environment Variables**.

1.  Tạo một Environment tên là `Local Test`.
2.  Tạo biến `tenant_id` = `019abac9-846f-75d0-8dfd-bcf9c9457866`.
3.  Trong phần Header của tất cả request, bạn chỉ cần điền:
    * Key: `x-tenant-id`
    * Value: `{{tenant_id}}`

Cách này giúp bạn chỉ cần sửa ID ở một chỗ nếu sau này muốn test sang nhà hàng khác.
```