# Hướng dẫn Cài đặt Database (Supabase)

Tài liệu này hướng dẫn cách khởi tạo cấu trúc Database (Migration) và tạo dữ liệu mẫu (Seeding) cho dự án Backend.

---

## 1️. Yêu cầu Tiên quyết (Prerequisites)

### Cài đặt cần thiết
Đảm bảo máy tính đã cài đặt:
- **Node.js** (v18 trở lên)
- **Supabase CLI** (Cài đặt qua npm: `npm install supabase --save-dev`)

### Cấu hình biến môi trường
Tạo file `.env` tại thư mục gốc `backend/` và điền đầy đủ thông tin kết nối Supabase:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
DATABASE_URL=postgres://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

---

## 2️. Database Migration (Tạo cấu trúc bảng)

Bước này sẽ tạo các bảng (tenants, tables, app_settings,...) và các Type Enum trên Supabase Cloud.

### Cách 1: Sử dụng CLI (Khuyên dùng)

Tại thư mục `backend`, chạy lệnh sau:

```bash
npx supabase db push --no-verify
```

**Lưu ý:** Flag `--no-verify` được sử dụng để:
- Bỏ qua bước kiểm tra bằng Docker local
- Giúp quá trình đẩy lên Cloud nhanh chóng
- Tránh lỗi môi trường

### Cách 2: Chạy thủ công (Fallback)

Nếu lệnh trên gặp lỗi kết nối, thực hiện theo các bước sau:

1. Mở file migration mới nhất trong thư mục `supabase/migrations/*.sql`
2. Copy toàn bộ nội dung SQL
3. Truy cập **Supabase Dashboard** → **SQL Editor**
4. Dán code và nhấn **Run**

---

## 3️. Database Seeding (Tạo dữ liệu mẫu)

Dự án sử dụng script Node.js để tạo dữ liệu mẫu thông minh (kiểm tra trùng lặp trước khi thêm), đảm bảo an toàn khi chạy nhiều lần.

### Dữ liệu sẽ được tạo bao gồm:
- **Tables:** Danh sách bàn (Indoor, Outdoor, VIP...)
- **App Settings:** Cấu hình hệ thống (Tax rate, Wifi, Printer...)

### Chạy seeding

Thực hiện lệnh:

```bash
npm run db:seed
```

### Kết quả mong đợi

Terminal sẽ hiển thị danh sách các bản ghi được tạo:

```
* Starting database seeding...
+ Created table: Bàn 01
+ Created table: VIP 01
+ Created setting: tax_rate
✅ Seeding completed successfully!
```

---

## 4️. Kiểm tra Dữ liệu

Sau khi hoàn tất, có thể kiểm tra dữ liệu bằng cách:

### Qua Supabase Dashboard
Truy cập **Supabase Dashboard** → **Table Editor**

### Qua API
Gọi API lấy danh sách bàn:

```
GET http://localhost:3000/api/admin/tables
```

---

## Ghi chú
- Luôn chạy migration trước khi chạy seeding
- Có thể chạy seeding nhiều lần mà không gây lỗi (script tự kiểm tra trùng lặp)
- Nếu gặp vấn đề, kiểm tra biến môi trường `.env` đã cấu hình đúng chưa
---
