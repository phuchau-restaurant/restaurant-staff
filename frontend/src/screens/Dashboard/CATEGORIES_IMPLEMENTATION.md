# Quản Lý Danh Mục - Tài Liệu Thực Hiện

## 📋 Tổng Quan
Đã chuyển đổi màn hình Inventory Management thành **Quản Lý Danh Mục (Categories Management)** với 2 chế độ hiển thị (Grid/List), các chức năng tìm kiếm, lọc, sắp xếp và chỉnh sửa.

## 🎯 Tính Năng Chính

### 1. **Hai Chế Độ Hiển Thị**
- **Grid View (Lưới)**: Hiển thị danh mục dạng thẻ (card)
- **List View (Danh Sách)**: Hiển thị danh mục dạng bảng (table)
- Có nút toggle ở thanh filter để chuyển giữa 2 chế độ

### 2. **Tìm Kiếm (Search)**
- Tìm kiếm theo tên danh mục
- Tìm kiếm theo mô tả
- Real-time filtering

### 3. **Lọc (Filter)**
- Lọc theo trạng thái: "Hoạt động" / "Không hoạt động"
- Lọc tất cả trạng thái (default)

### 4. **Sắp Xếp (Sort)**
- Sắp xếp theo tên (A-Z)
- Sắp xếp theo ngày tạo (mới nhất)
- Sắp xếp theo trạng thái

### 5. **Chỉnh Sửa Danh Mục**
- Click nút "Chỉnh Sửa" trên card (Grid View) hoặc nút edit trong bảng (List View)
- Modal form hiển thị để:
  - Chỉnh sửa tên danh mục
  - Chỉnh sửa mô tả
  - Thay đổi hình ảnh
  - Cập nhật trạng thái hoạt động

### 6. **Thêm Danh Mục Mới**
- Nút "Thêm Danh Mục" ở header
- Modal form tương tự chỉnh sửa

### 7. **Xóa Danh Mục**
- Nút xóa (Trash icon) chỉ có ở List View
- Yêu cầu xác nhận trước khi xóa

### 8. **Validation & Error Handling**
- Validate tên danh mục (bắt buộc, max 100 ký tự)
- Validate mô tả (max 500 ký tự)
- Error messages thân thiện
- Success/Error notifications

## 📁 Cấu Trúc File

### Services
- **[src/services/categoryService.js](src/services/categoryService.js)** - API calls
  - `fetchCategories()` - Lấy danh sách danh mục
  - `createCategory()` - Tạo danh mục mới
  - `updateCategory()` - Cập nhật danh mục
  - `deleteCategory()` - Xóa danh mục
  - Mock data cho development

### Constants
- **[src/constants/categoryConstants.js](src/constants/categoryConstants.js)** - Hằng số
  - Sort options
  - Status options
  - View modes
  - Messages (success, error, warning)

### Utilities
- **[src/utils/categoryUtils.js](src/utils/categoryUtils.js)** - Hàm tiện ích
  - `filterAndSortCategories()` - Filter và sort danh mục
  - `formatDate()` - Format ngày
  - `validateCategoryData()` - Validate dữ liệu

### Components
- **[src/components/categories/CategoryFilterBar.jsx](src/components/categories/CategoryFilterBar.jsx)** - Thanh tìm kiếm, lọc, sắp xếp
- **[src/components/categories/CategoryCard.jsx](src/components/categories/CategoryCard.jsx)** - Thẻ danh mục cho grid view
- **[src/components/categories/CategoryListView.jsx](src/components/categories/CategoryListView.jsx)** - Bảng danh mục cho list view
- **[src/components/categories/CategoryForm.jsx](src/components/categories/CategoryForm.jsx)** - Form add/edit danh mục

### Screens
- **[src/screens/Dashboard/CategoriesScreen.jsx](src/screens/Dashboard/CategoriesScreen.jsx)** - Main screen
- **[src/screens/Dashboard/InventoryContent.jsx](src/screens/Dashboard/InventoryContent.jsx)** - Updated to use CategoriesScreen

## 🔄 Flow Quy Trình

```
Dashboard (DashboardLayout)
  └── Menu "inventory" 
      └── InventoryContent 
          └── CategoriesScreen (Main)
              ├── CategoryFilterBar (Search, Filter, Sort, Toggle View)
              ├── Grid View (CategoryCard list)
              └── List View (CategoryListView table)
                  └── CategoryForm (Modal add/edit)
```

## 📊 Data Structure

```javascript
Category {
  id: string,          // Unique identifier
  name: string,        // Tên danh mục (bắt buộc)
  description: string, // Mô tả
  image: string,       // URL hình ảnh
  isActive: boolean,   // Trạng thái hoạt động
  createdAt: string    // ISO date string
}
```

## 🚀 Cách Sử Dụng

### Từ Dashboard
1. Vào Dashboard Admin
2. Chọn menu "inventory" → "Quản Lý Danh Mục"

### Tìm Kiếm
1. Nhập tên hoặc mô tả danh mục vào ô search

### Lọc
1. Chọn trạng thái từ dropdown "Tất cả trạng thái"

### Sắp Xếp
1. Chọn tiêu chí từ dropdown "Sắp xếp theo"

### Chuyển Chế Độ Hiển Thị
1. Click nút Grid hoặc List ở góc phải thanh filter

### Thêm Danh Mục
1. Click nút "Thêm Danh Mục" ở header
2. Điền thông tin trong modal form
3. Click "Lưu"

### Chỉnh Sửa Danh Mục
1. **Grid View**: Click nút "Chỉnh Sửa" trên card
2. **List View**: Click icon edit trong hàng
3. Cập nhật thông tin và click "Lưu"

### Xóa Danh Mục
1. **List View**: Click icon trash
2. Xác nhận xóa trong dialog
3. Danh mục sẽ bị xóa

## 🎨 UI/UX Features

### Design
- Responsive design (mobile, tablet, desktop)
- Consistent styling với project hiện tại
- Tailwind CSS utilities

### Interactions
- Hover effects trên cards và buttons
- Smooth transitions
- Loading states
- Success/Error notifications
- Confirmation dialogs

### Accessibility
- Proper labels
- Form validation feedback
- Clear status messages
- Semantic HTML

## 🔌 Backend Integration

### API Endpoints Expected
- `GET /api/admin/categories?search=...` - Fetch categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category

### Headers
```javascript
{
  "Content-Type": "application/json",
  "x-tenant-id": import.meta.env.VITE_TENANT_ID
}
```

## 📝 Environment Variables Required
```
VITE_BACKEND_URL=<backend-url>
VITE_TENANT_ID=<tenant-id>
```

## ⚡ Development Notes

### Mock Data
Service cung cấp mock data khi API không khả dụng, để dễ test frontend.

### Error Handling
- Try-catch blocks cho all API calls
- User-friendly error messages
- Fallback to mock data

### State Management
- React hooks (useState, useEffect, useCallback)
- Local state management
- No external state library needed

## 🧪 Testing Checklist

- [ ] Grid view displays categories correctly
- [ ] List view displays categories correctly
- [ ] Toggle between grid/list works
- [ ] Search filters by name/description
- [ ] Status filter works
- [ ] Sort by name, date, status works
- [ ] Add category opens form modal
- [ ] Edit category pre-fills form
- [ ] Delete category shows confirmation
- [ ] Form validation prevents invalid data
- [ ] Success messages appear
- [ ] Error messages display properly
- [ ] Close button works
- [ ] Responsive design on mobile

## 📚 File References

### Created Files
1. `/src/services/categoryService.js` - 165 lines
2. `/src/constants/categoryConstants.js` - 29 lines
3. `/src/utils/categoryUtils.js` - 91 lines
4. `/src/components/categories/CategoryFilterBar.jsx` - 80 lines
5. `/src/components/categories/CategoryCard.jsx` - 72 lines
6. `/src/components/categories/CategoryListView.jsx` - 107 lines
7. `/src/components/categories/CategoryForm.jsx` - 208 lines
8. `/src/screens/Dashboard/CategoriesScreen.jsx` - 312 lines

### Modified Files
1. `/src/screens/Dashboard/InventoryContent.jsx` - Thay thế toàn bộ nội dung

### Existing Components Used
- `AlertModal` - Hiển thị thông báo
- `ConfirmModal` - Xác nhận hành động

## 🎓 Best Practices Applied

1. **Component Separation** - Mỗi component có một trách nhiệm duy nhất
2. **Custom Hooks** - Reusable logic
3. **Constants** - Centralized configuration
4. **Utility Functions** - Shared logic
5. **Error Boundaries** - Graceful error handling
6. **Loading States** - User feedback
7. **Responsive Design** - Mobile-first approach
8. **Accessibility** - ARIA labels, semantic HTML
9. **Documentation** - Comments và JSDoc

## 🔮 Future Enhancements

- Batch operations (select multiple categories)
- Export/Import categories
- Category images with cropping
- Advanced filtering (date range)
- Category history/audit log
- Performance optimization (pagination, virtualization)
- Real-time updates (WebSocket)

---

**Created**: 2024-12-22
**Version**: 1.0
**Status**: ✅ Complete and Ready
