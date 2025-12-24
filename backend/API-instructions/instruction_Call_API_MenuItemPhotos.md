## Hướng dẫn chi tiết gọi API quản lý ảnh món ăn (Menu Item Photos)

**Lưu ý chung:**

* **Header bắt buộc cho tất cả request:**

```text
x-tenant-id: 019abac9-846f-75d0-8dfd-bcf9c9457866

```

* **Lưu ý quan trọng**: Tên file ảnh nên đặt không dấu để tránh lỗi khi lưu trữ (vd: "com-tam-suon.jpg").
* **Công cụ**: Sử dụng **Postman** để test tốt nhất (đặc biệt là các API Upload và GET có Body).

---

### 1. API: Upload ảnh cho món ăn (Upload one/multiple)

API này cho phép upload một hoặc nhiều ảnh cùng lúc và gắn liền chúng với một món ăn cụ thể (`dishId`).

**URL:** `POST /api/admin/menu/items/photos`

**Content-Type:** `Form` hay `multipart/form-data` (ở mục Body)

**Body (Form Data): Điền các key như sau:**

| Key | Value | Loại | Ghi chú |
| --- | --- | --- | --- |
| `dishId` | 12 | Text | ID của món ăn cần thêm ảnh (**Bắt buộc**) |
| `images` | [File 1.jpg] | File | Chọn file ảnh từ máy tính |
| `images` | [File 2.png] | File | Chọn file ảnh tiếp theo (nếu có) |

**Hướng dẫn thao tác trên Postman:**

1. Chọn tab **Body** -> chọn **form-data**.
2. Điền Key `dishId` -> Value là ID món ăn (VD: `10`).
3. Điền Key `images` -> Đổi loại từ **Text** sang **File** -> Nhấn nút "Select Files" để chọn ảnh từ máy tính.
* *Mẹo:* có thể giữ phím `Ctrl` (hoặc `Shift`) để chọn nhiều ảnh cùng lúc cho trường `images`.



---

### 2. API: Xóa một ảnh (Remove Photo)

Xóa hoàn toàn một ảnh khỏi Database và xóa file gốc trên Cloud Storage.

**URL:** `DELETE /api/admin/menu/items/photos/:id`

**Params (Trên đường dẫn):**

* `:id`: Thay bằng ID của bức ảnh (lấy từ bảng `menu_item_photos`).

**Ví dụ:**
`DELETE /api/admin/menu/items/photos/5`

**Body:** Không có (Trống).

---

### 3. API: Thiết lập ảnh đại diện (Set Primary Photo)

Đặt một ảnh làm ảnh chính (Primary) cho món ăn. Hệ thống sẽ tự động chuyển tất cả các ảnh khác của món đó về trạng thái phụ (`false`) và chỉ set ảnh này là chính (`true`).

**URL:** `PATCH /api/admin/menu/items/photos/:id`

**Params (Trên đường dẫn):**

* `:id`: Thay bằng ID của bức ảnh muốn chọn làm đại diện.

**Ví dụ:**
`PATCH /api/admin/menu/items/photos/5`

**Body:** Không có (Trống).

---

### 4. API: Lấy ảnh đại diện của món ăn (Get Primary Photo)

Lấy thông tin bức ảnh đang được set là Primary của một món ăn cụ thể.

**URL:** `GET /api/admin/menu/items/photos/primary`

**Content-Type:** `application/json` (ở mục Body)

**Body (JSON):**

```json
{
  "dish_id": 12
}

```

**Hướng dẫn thao tác trên Postman:**

* Mặc dù là method `GET`, API này yêu cầu truyền dữ liệu qua Body (do thiết kế Controller).
* Chọn tab **Body** -> chọn **raw**.
* Chọn định dạng **JSON** (Menu thả xuống bên phải).
* Nhập JSON chứa `dish_id` như mẫu trên.