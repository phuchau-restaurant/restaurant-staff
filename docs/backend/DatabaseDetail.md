# Physical Database Design - Multi-Tenant Architecture (Updated)

**Phương pháp:** Shared Database, Shared Schema (Pooled)
**Database Engine:** PostgreSQL
**Database Hosting:** Supabase
**Last Updated:** Theo Schema mới nhất

## Lưu ý quan trọng

1. **Tenant Isolation:** Tất cả các bảng thuộc về dữ liệu nhà hàng đều bắt buộc có `tenant_id` để đảm bảo cô lập dữ liệu.
2. **UUID & Sequences:**
   - `tenants.id` sử dụng `uuid_generate_v7()` (hoặc tương đương) để tối ưu hiệu năng sắp xếp.
   - Các bảng con sử dụng `SERIAL/BIGSERIAL` (Integer/Bigint) cho ID nội bộ để tối ưu dung lượng index, nhưng vẫn đi kèm `tenant_id` trong mọi truy vấn.
3. **User-Defined Types:** Các trạng thái (Status) sử dụng `USER-DEFINED` (Enum) của PostgreSQL để đảm bảo tính nhất quán dữ liệu.

---

## PHẦN 1: GLOBAL / SYSTEM TABLES (Super Admin)

_Các bảng này dùng để quản lý hệ thống SaaS hoặc cấu hình chung._

### 1. Bảng `tenants` (Nhà hàng / Khách thuê)

Lưu trữ thông tin các nhà hàng đăng ký sử dụng hệ thống.

| Tên trường            | Kiểu dữ liệu + Ràng buộc                   | Mô tả ngắn                          |
| :-------------------- | :----------------------------------------- | :---------------------------------- |
| **id**                | `UUID` (PK, Default: `uuid_generate_v7()`) | Định danh duy nhất của nhà hàng.    |
| **name**              | `VARCHAR` NOT NULL                         | Tên hiển thị của nhà hàng.          |
| **slug**              | `VARCHAR` UNIQUE NOT NULL                  | Đường dẫn định danh (URL friendly). |
| **owner_email**       | `VARCHAR` NOT NULL                         | Email chủ sở hữu.                   |
| **status**            | `VARCHAR` DEFAULT `'active'`               | Trạng thái hoạt động.               |
| **subscription_plan** | `VARCHAR` DEFAULT `'basic'`                | Gói dịch vụ đăng ký.                |
| **created_at**        | `TIMESTAMPTZ` DEFAULT `now()`              | Ngày tạo.                           |

### 2. Bảng `platform_users` (Super Admin)

Quản trị viên cấp cao của toàn bộ hệ thống SaaS.

| Tên trường        | Kiểu dữ liệu + Ràng buộc          | Mô tả ngắn          |
| :---------------- | :-------------------------------- | :------------------ |
| **id**            | `INTEGER` (PK, Serial)            | ID nội bộ.          |
| **email**         | `VARCHAR` UNIQUE NOT NULL         | Email đăng nhập.    |
| **password_hash** | `VARCHAR` NOT NULL                | Mật khẩu đã mã hóa. |
| **role**          | `VARCHAR` DEFAULT `'super_admin'` | Vai trò hệ thống.   |

---

## PHẦN 2: TENANT RESOURCES (Cấu hình & Tài nguyên)

### 3. Bảng `app_settings` (Cấu hình ứng dụng)

**[MỚI]** Lưu trữ các cài đặt động cho từng nhà hàng (VD: Giờ mở cửa, Logo, Màu sắc chủ đạo).

| Tên trường     | Kiểu dữ liệu + Ràng buộc  | Mô tả ngắn                                                |
| :------------- | :------------------------ | :-------------------------------------------------------- |
| **id**         | `INTEGER` (PK, Serial)    | ID cấu hình.                                              |
| **tenant_id**  | `UUID` (FK) NOT NULL      | Thuộc nhà hàng nào.                                       |
| **key**        | `VARCHAR` NOT NULL        | Tên cấu hình (VD: `wifi_password`).                       |
| **value**      | `TEXT` NOT NULL           | Giá trị cấu hình.                                         |
| **value_type** | `VARCHAR` NOT NULL        | Kiểu dữ liệu của value (VD: `string`, `boolean`, `json`). |
| **category**   | `VARCHAR` NOT NULL        | Nhóm cấu hình (VD: `general`, `printer`).                 |
| **is_system**  | `BOOLEAN` DEFAULT `false` | Cờ đánh dấu cấu hình hệ thống (không cho phép user xóa).  |

### 4. Bảng `users` (Nhân viên nhà hàng)

Tài khoản nhân viên làm việc tại nhà hàng.

| Tên trường        | Kiểu dữ liệu + Ràng buộc     | Mô tả ngắn                                 |
| :---------------- | :--------------------------- | :----------------------------------------- |
| **id**            | `INTEGER` (PK, Serial)       | ID nhân viên.                              |
| **tenant_id**     | `UUID` (FK) NOT NULL         | Thuộc nhà hàng nào.                        |
| **email**         | `VARCHAR` NOT NULL           | Email đăng nhập.                           |
| **password_hash** | `VARCHAR` NOT NULL           | Mật khẩu.                                  |
| **full_name**     | `VARCHAR`                    | Tên hiển thị.                              |
| **role**          | `VARCHAR` DEFAULT `'waiter'` | Vai trò (VD: `manager`, `chef`, `waiter`). |
| **is_active**     | `BOOLEAN` DEFAULT `true`     | Trạng thái hoạt động.                      |

### 5. Bảng `tables` (Bàn ăn)

Quản lý sơ đồ bàn và trạng thái hiện tại.

| Tên trường           | Kiểu dữ liệu + Ràng buộc          | Mô tả ngắn                                     |
| :------------------- | :-------------------------------- | :--------------------------------------------- |
| **id**               | `INTEGER` (PK, Serial)            | ID bàn.                                        |
| **tenant_id**        | `UUID` (FK) NOT NULL              | Thuộc nhà hàng nào.                            |
| **table_number**     | `VARCHAR` UNIQUE NOT NULL         | Số/Tên bàn.                                    |
| **capacity**         | `INTEGER` CHECK (1-20)            | Sức chứa của bàn.                              |
| **location**         | `USER-DEFINED` DEFAULT `'Indoor'` | Vị trí (VD: `Indoor`, `Outdoor`, `Rooftop`).   |
| **status**           | `USER-DEFINED` DEFAULT `'Active'` | Trạng thái bàn (VD: `Active`, `Maintenance`).  |
| **qr_token**         | `VARCHAR`                         | Token dùng để tạo QR code hoặc Deep link.      |
| **current_order_id** | `BIGINT` (FK -> orders)           | ID đơn hàng đang phục vụ tại bàn này (nếu có). |

---

## PHẦN 3: MENU MANAGEMENT (Thực đơn)

### 6. Bảng `categories` (Danh mục món)

| Tên trường        | Kiểu dữ liệu + Ràng buộc | Mô tả ngắn               |
| :---------------- | :----------------------- | :----------------------- |
| **id**            | `INTEGER` (PK, Serial)   | ID danh mục.             |
| **tenant_id**     | `UUID` (FK) NOT NULL     | Thuộc nhà hàng nào.      |
| **name**          | `VARCHAR` NOT NULL       | Tên danh mục.            |
| **display_order** | `INTEGER` DEFAULT 0      | Thứ tự hiển thị.         |
| **url_icon**      | `TEXT`                   | Đường dẫn icon minh họa. |
| **is_active**     | `BOOLEAN` DEFAULT `true` | Ẩn/Hiện danh mục.        |

### 7. Bảng `dishes` (Món ăn)

_(Tên cũ: menu_items)_

| Tên trường       | Kiểu dữ liệu + Ràng buộc | Mô tả ngắn                  |
| :--------------- | :----------------------- | :-------------------------- |
| **id**           | `INTEGER` (PK, Serial)   | ID món ăn.                  |
| **tenant_id**    | `UUID` (FK) NOT NULL     | Thuộc nhà hàng nào.         |
| **category_id**  | `INTEGER` (FK)           | Thuộc danh mục nào.         |
| **name**         | `VARCHAR` NOT NULL       | Tên món.                    |
| **description**  | `TEXT`                   | Mô tả chi tiết.             |
| **price**        | `NUMERIC` NOT NULL       | Giá bán.                    |
| **image_url**    | `TEXT`                   | Ảnh món ăn.                 |
| **is_available** | `BOOLEAN` DEFAULT `true` | Tình trạng còn món/hết món. |

---

## PHẦN 4: OPERATIONS (Vận hành & Kinh doanh)

### 8. Bảng `orders` (Đơn hàng)

| Tên trường       | Kiểu dữ liệu + Ràng buộc            | Mô tả ngắn                                               |
| :--------------- | :---------------------------------- | :------------------------------------------------------- |
| **id**           | `BIGINT` (PK, Serial)               | ID đơn hàng (dùng Bigint cho transaction lớn).           |
| **tenant_id**    | `UUID` (FK) NOT NULL                | Đơn của nhà hàng nào.                                    |
| **table_id**     | `INTEGER` (FK)                      | Đơn tại bàn nào.                                         |
| **total_amount** | `NUMERIC` DEFAULT 0                 | Tổng tiền tạm tính.                                      |
| **status**       | `USER-DEFINED` DEFAULT `'Unsubmit'` | Trạng thái đơn (VD: `Unsubmit`, `Pending`, `Completed`). |
| **created_at**   | `TIMESTAMPTZ` DEFAULT `now()`       | Thời gian tạo.                                           |
| **completed_at** | `TIMESTAMPTZ`                       | Thời gian hoàn tất.                                      |

### 9. Bảng `order_details` (Chi tiết đơn hàng)

_(Tên cũ: order_items)_

| Tên trường      | Kiểu dữ liệu + Ràng buộc | Mô tả ngắn                                |
| :-------------- | :----------------------- | :---------------------------------------- |
| **id**          | `BIGINT` (PK, Serial)    | ID chi tiết.                              |
| **tenant_id**   | `UUID` (FK) NOT NULL     | **Bắt buộc** để tối ưu Partitioning.      |
| **order_id**    | `BIGINT` (FK) NOT NULL   | Thuộc đơn hàng nào.                       |
| **dish_id**     | `INTEGER` (FK)           | Món nào (Liên kết bảng dishes).           |
| **quantity**    | `INTEGER` CHECK (> 0)    | Số lượng đặt.                             |
| **unit_price**  | `NUMERIC` NOT NULL       | Giá tại thời điểm đặt.                    |
| **total_price** | `NUMERIC`                | Thành tiền (`quantity * unit_price`).     |
| **note**        | `VARCHAR`                | Ghi chú món (ít cay, không hành...).      |
| **status**      | `USER-DEFINED`           | Trạng thái món (VD: `Cooking`, `Served`). |

### 11. Bảng `payments` (Thanh toán)

| Tên trường                | Kiểu dữ liệu + Ràng buộc                            | Mô tả ngắn                                 |
| :------------------------ | :-------------------------------------------------- | :----------------------------------------- |
| **id**                    | `INTEGER` (PK, Serial)                              | ID giao dịch.                              |
| **tenant_id**             | `UUID` (FK) NOT NULL                                | Thuộc nhà hàng nào.                        |
| **order_id**              | `BIGINT` (FK, UNIQUE)                               | Thanh toán cho đơn hàng nào (1-1).         |
| **payment_method**        | `USER-DEFINED` DEFAULT `'Cash'`                     | Phương thức (`Cash`, `Card`, `E-Wallet`).  |
| **is_paid**               | `BOOLEAN` DEFAULT `false`                           | Đã thanh toán hay chưa.                    |
| **subtotal**              | `NUMERIC` DEFAULT 0                                 | Tổng tiền món ăn gốc (chưa thuế, phí).     |
| **tax_rate**              | `DECIMAL(5,2)` DEFAULT 0                            | Phần trăm thuế VAT áp dụng.                |
| **tax_amount**            | `NUMERIC` DEFAULT 0                                 | Số tiền thuế VAT.                          |
| **service_charge_rate**   | `DECIMAL(5,2)` DEFAULT 0                            | Phần trăm phí dịch vụ.                     |
| **service_charge_amount** | `NUMERIC` DEFAULT 0                                 | Số tiền phí dịch vụ.                       |
| **discount_percent**      | `DECIMAL(5,2)` DEFAULT 0                            | Phần trăm giảm giá.                        |
| **discount_amount**       | `NUMERIC` DEFAULT 0                                 | Số tiền giảm giá.                          |
| **amount**                | `NUMERIC` NOT NULL                                  | Số tiền thực tế thanh toán (tổng cuối).    |
| **transaction_id**        | `VARCHAR`                                           | Mã giao dịch tham chiếu (nếu có).          |
| **paid_at**               | `TIMESTAMPTZ`                                       | Thời gian xác nhận thanh toán.             |

