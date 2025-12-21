# Restaurant Staff Management System

## Thông tin dự án

Đây là dự án quản lý nhân viên nhà hàng (Restaurant Staff Management), đã được tách riêng từ dự án ban đầu.

## Các thay đổi quan trọng (21/12/2024)

### ❌ Đã xóa hoàn toàn các tính năng Customer

Dự án này **KHÔNG BAO GỒM** các tính năng dành cho khách hàng (customer). Các thành phần sau đã được xóa:

#### Backend:

- ❌ `backend/models/Customers.js`
- ❌ `backend/controllers/Customers/`
- ❌ `backend/services/Customers/`
- ❌ `backend/repositories/implementation/CustomersRepository.js`
- ❌ `backend/routers/customers.routes.js`
- ❌ `backend/containers/customersContainer.js`
- ❌ `backend/CUSTOMER_QR_FLOW.md`
- ❌ `QR_Token_Format_Specification.md`

#### Frontend:

- ❌ `frontend/src/contexts/CustomerContext.jsx`
- ❌ `frontend/src/screens/CustomerLoginScreen.jsx`
- ❌ `frontend/src/screens/MenuScreen.jsx`
- ❌ `frontend/src/screens/Dashboard/CustomersContent.jsx`
- ❌ Customer routes trong `App.jsx`
- ❌ Customer menu item trong Dashboard Sidebar

#### Database:

- ❌ Bảng `customers`
- ❌ Cột `customer_id` trong bảng `orders`
- ❌ Các indexes liên quan đến customers

## Tính năng hiện có

Dự án này tập trung vào quản lý nhân viên và hoạt động nội bộ nhà hàng:

### ✅ Quản lý nhân viên (Users Management)

- Đăng ký, đăng nhập nhân viên
- Phân quyền (Admin, Waiter, Kitchen Staff)
- Quản lý thông tin nhân viên

### ✅ Quản lý bàn (Tables Management)

- Tạo, sửa, xóa bàn
- Theo dõi trạng thái bàn
- Tạo QR code cho bàn (cho mục đích nội bộ)

### ✅ Quản lý menu (Menu Management)

- Quản lý danh mục món ăn
- Thêm, sửa, xóa món ăn
- Cập nhật giá và trạng thái món

### ✅ Quản lý đơn hàng (Orders Management)

- Tạo đơn hàng từ nhân viên
- Theo dõi trạng thái đơn
- Quản lý chi tiết món trong đơn

### ✅ Kitchen Screen

- Xem đơn hàng mới
- Cập nhật trạng thái món ăn
- Quản lý queue bếp

### ✅ Waiter Screen

- Nhận đơn hàng
- Theo dõi trạng thái phục vụ
- Cập nhật trạng thái bàn

## Lưu ý quan trọng

⚠️ **Không còn tính năng customer**:

- Không có màn hình đặt món cho khách hàng
- Không có tài khoản khách hàng
- Không có loyalty points
- Tất cả đơn hàng được tạo bởi nhân viên

⚠️ **Database Migration**:

- Nếu bạn đang migrate từ phiên bản cũ, hãy chạy migration `20251221_remove_customers.sql`
- Hoặc sử dụng file init schema mới đã được cập nhật

## Dự án Customer (Riêng biệt)

Các tính năng customer đã được tách sang dự án riêng. Nếu cần tích hợp customer app, vui lòng liên hệ để được hướng dẫn về API integration.

---

**Cập nhật lần cuối**: 21/12/2024
