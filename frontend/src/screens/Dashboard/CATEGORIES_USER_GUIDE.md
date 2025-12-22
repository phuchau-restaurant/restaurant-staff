# Hướng Dẫn Sử Dụng Quản Lý Danh Mục

## 🚀 Khởi Động

1. **Truy Cập Màn Hình**
   - Dashboard → Menu "inventory" → Danh mục sẽ tự động hiển thị (thay thế Inventory Management)

2. **Giao Diện Mặc Định**
   - Hiển thị dạng Grid (lưới) với card danh mục
   - Thanh filter ở trên với: tìm kiếm, lọc, sắp xếp, toggle view

## 🎯 Các Chức Năng

### 1️⃣ Tìm Kiếm (Search)
```
👤 Người dùng: Nhập "Snack" vào ô tìm kiếm
✅ Kết quả: Chỉ hiển thị danh mục có tên hoặc mô tả chứa "Snack"
```

### 2️⃣ Lọc (Filter)
```
👤 Người dùng: Chọn "Đang hoạt động" từ dropdown Status
✅ Kết quả: Chỉ hiển thị danh mục có isActive = true
```

### 3️⃣ Sắp Xếp (Sort)
```
👤 Người dùng: Chọn "Sắp xếp theo ngày tạo"
✅ Kết quả: Danh mục sắp xếp từ mới nhất đến cũ nhất
```

### 4️⃣ Chuyển Chế Độ Hiển Thị
```
📊 Grid Mode:
   - Hiển thị card vuông
   - Dễ xem hình ảnh
   - Click card → Bấm "Chỉnh sửa"

📋 List Mode:
   - Hiển thị bảng
   - Thông tin chi tiết
   - Click "Edit" icon → Chỉnh sửa
   - Click "Delete" icon → Xóa (có xác nhận)
```

### 5️⃣ Thêm Danh Mục Mới
```
1️⃣  Click nút "Thêm Danh Mục" (header, bên phải)
2️⃣  Modal form mở lên
3️⃣  Điền thông tin:
     • Tên danh mục (bắt buộc) *
     • Mô tả (tùy chọn)
     • Hình ảnh (tùy chọn)
     • Trạng thái (checkbox "Danh mục đang hoạt động")
4️⃣  Click "Lưu" → Thêm thành công
```

### 6️⃣ Chỉnh Sửa Danh Mục
```
🔄 Trong Grid View:
   1. Tìm danh mục cần sửa
   2. Click nút "Chỉnh Sửa" (blue button)
   3. Form điền sẵn thông tin cũ
   4. Cập nhật các trường cần sửa
   5. Click "Lưu"

🔄 Trong List View:
   1. Tìm hàng cần sửa
   2. Click icon edit (bút) ở cuối hàng
   3. Form điền sẵn thông tin cũ
   4. Cập nhật các trường cần sửa
   5. Click "Lưu"
```

### 7️⃣ Xóa Danh Mục
```
⚠️  Chỉ có trong List View:
   1. Tìm hàng cần xóa
   2. Click icon trash (thùng rác) ở cuối hàng
   3. Dialog xác nhận: "Bạn có chắc chắn muốn xóa danh mục này?"
   4. Click "Xác nhận" → Xóa thành công
   5. Hoặc click "Hủy" để không xóa
```

## 📝 Form Validation

### Tên Danh Mục
```
❌ Lỗi: Để trống
✅ Đúng: "Snack", "Thức ăn chính", v.v.
⚠️  Tối đa: 100 ký tự
```

### Mô Tả
```
✅ Tùy chọn (không bắt buộc)
⚠️  Tối đa: 500 ký tự
```

### Hình Ảnh
```
✅ Tùy chọn (không bắt buộc)
📸 Định dạng: JPG, PNG, GIF, WebP
📏 Khuyến nghị: Hình vuông, tối thiểu 200x200px
```

## 💬 Thông Báo & Phản Hồi

### ✅ Thành Công
- "Tạo danh mục thành công!" → Thêm mới
- "Cập nhật danh mục thành công!" → Chỉnh sửa
- "Xóa danh mục thành công!" → Xóa

### ❌ Lỗi
- "Lỗi khi tạo danh mục. Vui lòng thử lại!"
- "Lỗi khi cập nhật danh mục. Vui lòng thử lại!"
- "Lỗi khi xóa danh mục. Vui lòng thử lại!"

## 🎨 Trạng Thái Hiển Thị

### Badge Trạng Thái (nhãn)
```
🟢 Hoạt động:        Badge xanh "Hoạt động"
🔴 Không hoạt động:  Badge đỏ "Không hoạt động"
```

### Hover Effects
```
🖱️  Card/Button: Hiệu ứng shadow và scale
🖱️  Links: Underline xuất hiện
🖱️  Buttons: Màu sáng hơn
```

## 🔍 Tìm Kiếm Nâng Cao

### Combine Multiple Filters
```
Ví dụ:
1. Tìm kiếm "Drink" 
2. Chọn Filter: "Đang hoạt động"
3. Sắp xếp: "Sắp xếp theo ngày tạo"
4. Kết quả: Danh mục "Drink" đang hoạt động, sắp xếp mới nhất
```

## 📱 Responsive Design

```
Mobile (< 640px):
  • 1 cột grid
  • Filter stacked vertically
  • Full-width form modal

Tablet (640px - 1024px):
  • 2 cột grid
  • Filter horizontal
  • Modal centered

Desktop (> 1024px):
  • 3-4 cột grid
  • Filter horizontal
  • Modal centered, max-width
```

## ⌨️ Keyboard Shortcuts (Future)

```
Ctrl + N    → Thêm danh mục mới
Ctrl + F    → Focus search box
Esc         → Đóng modal form
```

## 🐛 Troubleshooting

### Danh mục không hiển thị
```
❓ Vấn đề: Trang trắng, không có dữ liệu
✅ Giải pháp:
   1. Refresh trang (F5)
   2. Kiểm tra kết nối mạng
   3. Check backend API
   4. Chế độ development dùng mock data
```

### Form không submit
```
❓ Vấn đề: Nút "Lưu" không hoạt động
✅ Giải pháp:
   1. Kiểm tra validate (đỏ) trên form
   2. Điền tên danh mục (bắt buộc)
   3. Kiểm tra lỗi console (F12 → Console)
```

### Xóa không thành công
```
❓ Vấn đề: Danh mục không bị xóa sau xác nhận
✅ Giải pháp:
   1. Kiểm tra console lỗi
   2. Thử lại
   3. Kiểm tra backend API
```

## 🔗 API Tích Hợp (Backend)

### Các endpoint cần thiết
```javascript
// Lấy danh sách
GET /api/admin/categories?search=...

// Tạo mới
POST /api/admin/categories
Body: { name, description, image, isActive }

// Cập nhật
PUT /api/admin/categories/{id}
Body: { name, description, image, isActive }

// Xóa
DELETE /api/admin/categories/{id}
```

## 📊 Data Example

```javascript
{
  "id": "cat-1",
  "name": "Snack",
  "description": "Các loại thực phẩm ăn nhẹ",
  "image": "https://example.com/snack.jpg",
  "isActive": true,
  "createdAt": "2024-01-10T10:00:00Z"
}
```

## 🎓 Best Practices

### Khi Sử Dụng
1. ✅ Dùng tên rõ ràng, không viết tắt quá nhiều
2. ✅ Thêm mô tả chi tiết để dễ nhận biết
3. ✅ Dùng hình ảnh chuẩn (cùng kích thước)
4. ✅ Deactivate thay vì xóa nếu có dữ liệu liên quan

### Tránh Làm
1. ❌ Tên trùng lặp
2. ❌ Mô tả quá dài
3. ❌ Hình ảnh chất lượng thấp
4. ❌ Xóa ngay nếu không chắc chắn

---

**Cập nhật**: 2024-12-22
**Phiên bản**: 1.0
