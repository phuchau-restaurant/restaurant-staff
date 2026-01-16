# Kịch Bản Demo Video - Hệ Thống Quản Lý Nhà Hàng

## Thông Tin Chung
- **Thời lượng dự kiến**: 12-15 phút
- **Mục tiêu**: Demo toàn bộ tính năng đã hoàn thành của 2 dự án (Customer + Staff)
- **Kịch bản**: Mô phỏng quy trình thực tế từ khách đặt món đến thanh toán

---

## PHẦN 1: GIỚI THIỆU (30 giây)

### Slide giới thiệu
- Tên dự án: **Restaurant Management System**
- 2 ứng dụng: **Customer App** (Khách hàng) & **Staff App** (Nhân viên)
- Công nghệ: React + Node.js + PostgreSQL + WebSocket

---

## PHẦN 2: CUSTOMER APP - ỨNG DỤNG KHÁCH HÀNG (5-6 phút)

### Scene 1: Đăng ký & Xác thực (1 phút)
**Tính năng demo:**
- ✅ Đăng ký tài khoản mới (email + password)
- ✅ Xác thực email qua OTP
- ✅ Đăng nhập bằng Google OAuth

**Kịch bản:**
1. Mở trang đăng ký (`/register`)
2. Nhập thông tin: `demo@restaurant.com`, tên: `Nguyễn Văn A`
3. Nhận OTP qua email → Xác thực
4. Hoặc demo đăng nhập Google (nhanh hơn)

**Điểm nhấn:**
- Real-time email availability check
- Password complexity validation
- Smooth UI transitions

---

### Scene 2: Quét QR & Vào Menu (30 giây)
**Tính năng demo:**
- ✅ Quét mã QR bàn (hoặc click link demo)
- ✅ Tự động load menu theo tenant/table

**Kịch bản:**
1. Giả lập quét QR code của Bàn 5
2. Tự động chuyển đến trang Menu với thông tin bàn

**Điểm nhấn:**
- QR code với signed token
- Session binding với bàn

---

### Scene 3: Xem & Tìm Kiếm Menu (2 phút)
**Tính năng demo:**
- ✅ Hiển thị menu với categories
- ✅ Filter theo category (Khai vị, Món chính, Đồ uống, Tráng miệng)
- ✅ Search món ăn (Fuzzy search - chấp nhận lỗi chính tả)
- ✅ Sort theo giá, tên, popularity
- ✅ Filter theo giá (dưới 50k, 50-100k, trên 100k)
- ✅ Chef recommendation
- ✅ Pagination với infinite scroll
- ✅ View chi tiết món (ảnh, mô tả, modifiers, allergen info)
- ✅ Xem reviews & rating

**Kịch bản:**
1. Browse qua các category (All → Món chính → Đồ uống)
2. Tìm kiếm: "phở" (fuzzy search: "pho", "fo" vẫn ra kết quả)
3. Filter giá: 50-100k
4. Sort: Phổ biến nhất
5. Click vào món "Phở Bò" → Xem chi tiết:
   - Ảnh món ăn (gallery)
   - Mô tả, giá
   - Modifiers (Size: Nhỏ/Vừa/Lớn, Extras: Thêm thịt, Thêm rau)
   - Reviews từ khách hàng khác
6. Click "Chef recommendation" → Hiển thị món đầu bếp đề xuất

**Điểm nhấn:**
- Fuzzy search hoạt động tốt
- UI mượt mà, responsive
- Skeleton loading khi fetch data

---

### Scene 4: Thêm Món & Giỏ Hàng (1.5 phút)
**Tính năng demo:**
- ✅ Add món vào cart với modifiers
- ✅ Update số lượng
- ✅ Thêm ghi chú đặc biệt
- ✅ Cart persistence (localStorage theo table session)

**Kịch bản:**
1. Thêm "Phở Bò" với modifiers:
   - Size: Lớn (+15k)
   - Extras: Thêm thịt (+20k)
   - Ghi chú: "Ít hành"
2. Thêm "Cà phê sữa đá" x2
3. Mở giỏ hàng → Xem tổng tiền
4. Cập nhật số lượng Phở Bò: 1 → 2
5. Xem tổng tiền tự động cập nhật

**Điểm nhấn:**
- Modifiers tính giá chính xác
- Cart UI đẹp, dễ sử dụng
- Auto-calculate totals

---

### Scene 5: Đặt Món & Theo Dõi (1 phút)
**Tính năng demo:**
- ✅ Submit order
- ✅ Add items to existing order (single order per table session)
- ✅ Real-time order status tracking (Received → Preparing → Ready)
- ✅ View order details

**Kịch bản:**
1. Click "Đặt món" → Xác nhận
2. Thông báo thành công
3. Thêm món mới vào đơn hiện tại (Thêm "Trà đá" x1)
4. Xem trạng thái đơn hàng real-time:
   - Received (vừa đặt)
   - Preparing (bếp đang nấu) ← WebSocket update
   - Ready (sẵn sàng phục vụ) ← WebSocket update

**Điểm nhấn:**
- WebSocket real-time updates
- Smooth status transitions
- Order history

---

### Scene 6: Profile & Reviews (30 giây)
**Tính năng demo:**
- ✅ Update profile (name, avatar)
- ✅ Change password
- ✅ Add review cho món đã order

**Kịch bản:**
1. Mở Profile sidebar
2. Update avatar
3. Sau khi order hoàn tất → Đánh giá món "Phở Bò":
   - Rating: 5 sao
   - Comment: "Ngon, phục vụ nhanh!"

**Điểm nhấn:**
- Chỉ review món đã order
- Avatar upload

---

## PHẦN 3: STAFF APP - ỨNG DỤNG NHÂN VIÊN (6-7 phút)

### Scene 7: Admin Dashboard (1.5 phút)
**Tính năng demo:**
- ✅ Dashboard overview (doanh thu, đơn hàng, nhân viên, khách hàng)
- ✅ Revenue chart (theo ngày/tuần/tháng/năm/custom)
- ✅ Best sellers
- ✅ Peak hours chart
- ✅ Animated statistics (CountUp effect)

**Kịch bản:**
1. Login admin: `admin@restaurant.com`
2. Xem Dashboard:
   - Tổng doanh thu: 50,000,000đ (animated count-up)
   - Doanh thu 7 ngày qua: 5,000,000đ
   - Số nhân viên: 8
   - Số khách hàng: 120
3. Xem biểu đồ doanh thu (7 ngày qua)
4. Xem món bán chạy (Top 5)
5. Xem khung giờ cao điểm (11h-13h, 18h-20h)
6. Thay đổi filter: Tháng này → Custom range (01/01 - 15/01)

**Điểm nhấn:**
- Charts đẹp (Recharts)
- Animated statistics
- Responsive design

---

### Scene 8: Quản Lý Menu & Categories (1.5 phút)
**Tính năng demo:**
- ✅ Create/Edit/Delete categories
- ✅ Create menu item với multiple photos
- ✅ Add modifiers (Size, Extras)
- ✅ Update item status (Available/Unavailable/Sold out)
- ✅ Filter & sort menu items

**Kịch bản:**
1. Vào "Quản lý danh mục" → Tạo category mới: "Món Đặc Biệt"
2. Vào "Quản lý menu":
   - Filter: Món chính
   - Sort: Giá tăng dần
3. Tạo món mới: "Bún Bò Huế"
   - Upload 3 ảnh
   - Giá: 65,000đ
   - Category: Món chính
   - Prep time: 15 phút
   - Modifiers:
     - Size: Nhỏ (-5k), Vừa (0), Lớn (+10k)
     - Extras: Thêm chả (+15k), Thêm giò (+20k)
   - Chef recommendation: Yes
4. Update status món "Phở Gà": Available → Sold out

**Điểm nhấn:**
- Multi-image upload
- Modifier groups với price adjustments
- Input validation

---

### Scene 9: Quản Lý Bàn & QR Code (1 phút)
**Tính năng demo:**
- ✅ Create/Edit/Deactivate tables
- ✅ Generate unique QR codes
- ✅ Download QR as PNG/PDF
- ✅ Regenerate QR (invalidate old codes)

**Kịch bản:**
1. Vào "Quản lý bàn"
2. Tạo bàn mới: Bàn 10 (Capacity: 4, Location: Tầng 2)
3. Generate QR code cho Bàn 10
4. Download QR as PNG
5. Regenerate QR cho Bàn 5 (vì QR cũ bị mất)

**Điểm nhấn:**
- QR code với signed token
- Download options

---

### Scene 10: Waiter - Nhận & Xử Lý Đơn (2 phút)
**Tính năng demo:**
- ✅ View pending orders (đơn mới)
- ✅ Claim order (nhận đơn)
- ✅ Confirm/Reject order items
- ✅ Real-time notifications (món sẵn sàng, bếp gọi)
- ✅ Serve items (đánh dấu đã phục vụ)
- ✅ Bill management (tạo hóa đơn, áp dụng giảm giá, thanh toán)

**Kịch bản:**
1. Login waiter: `waiter@restaurant.com`
2. Tab "Đơn mới" → Thấy đơn từ Bàn 5 (đơn vừa đặt ở Customer App)
3. Click "Nhận đơn" → Chuyển sang tab "Đơn của tôi"
4. Xác nhận các món:
   - Phở Bò x2: Confirm
   - Cà phê sữa đá x2: Confirm
   - Trà đá x1: Confirm
5. Nhận notification real-time:
   - 🔔 "Phở Bò (Bàn 5) đã sẵn sàng!" (từ Kitchen)
   - 🔊 Âm thanh thông báo
6. Click "Phục vụ" cho món Phở Bò
7. Khi tất cả món đã phục vụ → Click "Thanh toán":
   - Xem hóa đơn chi tiết
   - Áp dụng giảm giá: 10%
   - Chọn phương thức: Tiền mặt
   - Xác nhận thanh toán

**Điểm nhấn:**
- WebSocket notifications
- Audio alerts
- Smooth workflow
- Bill calculation

---

### Scene 11: Kitchen - Màn Hình Bếp (1.5 phút)
**Tính năng demo:**
- ✅ Kitchen Display System (KDS)
- ✅ Real-time order display
- ✅ Sound notifications
- ✅ Order timer & alerts (vượt prep time)
- ✅ Update dish status (Pending → Cooking → Ready)
- ✅ Filter by status & category
- ✅ Call waiter

**Kịch bản:**
1. Login kitchen staff: `kitchen@restaurant.com`
2. Nhận đơn mới real-time:
   - 🔔 "Đơn mới #123 từ Bàn 5"
   - 🔊 Âm thanh thông báo
3. Xem chi tiết đơn:
   - Phở Bò x2 (Size Lớn, Thêm thịt) - Prep time: 15 phút
   - Cà phê sữa đá x2 - Prep time: 5 phút
4. Click "Xác nhận" → Chuyển status: Approved → Pending
5. Đánh dấu từng món:
   - Cà phê sữa đá x2: Ready (nhanh hơn)
   - Phở Bò x2: Cooking → Ready
6. Order timer hiển thị thời gian đã trôi qua (highlight nếu vượt prep time)
7. Click "Gọi nhân viên" → Waiter nhận notification

**Điểm nhấn:**
- Real-time KDS
- Audio + visual notifications
- Timer alerts
- Filter & sort options

---

### Scene 12: Quản Lý Nhân Viên (30 giây)
**Tính năng demo:**
- ✅ Create Admin/Waiter/Kitchen accounts
- ✅ Role-based access control (RBAC)
- ✅ View/Edit/Deactivate accounts

**Kịch bản:**
1. Vào "Quản lý nhân viên"
2. Tạo tài khoản mới:
   - Email: `waiter2@restaurant.com`
   - Role: Waiter
   - Name: Nguyễn Thị B
3. Xem danh sách nhân viên (Admin, Waiter, Kitchen)

**Điểm nhấn:**
- RBAC implementation
- Account management

---

## PHẦN 4: TÍNH NĂNG NÂNG CAO (1 phút)

### Tổng hợp các tính năng đã demo:
✅ **Authentication & Authorization**
- Passport.js + JWT
- Google OAuth
- Email verification (OTP)
- Password reset
- Role-based access control

✅ **Real-time Features (WebSocket)**
- Order status updates
- Kitchen notifications
- Waiter notifications
- Customer order tracking

✅ **Advanced Search & Filter**
- Fuzzy search (typo tolerance)
- Multi-criteria filtering
- Pagination với infinite scroll

✅ **Menu & Modifiers**
- Menu item modifiers với price adjustments
- Multi-image upload
- Chef recommendations

✅ **Order Management**
- Single order per table session
- Add items to existing order
- Order item status tracking
- Kitchen Display System (KDS)

✅ **Reports & Analytics**
- Revenue charts (day/week/month/year/custom)
- Best sellers
- Peak hours analysis
- Animated statistics

✅ **QR Code System**
- Generate unique QR per table
- Signed tokens
- Download as PNG/PDF
- Regenerate & invalidate

✅ **Bill Management**
- Create bill
- Apply discounts
- Multiple payment methods
- Print/Download PDF

---

## PHẦN 5: KẾT THÚC (30 giây)

### Tổng kết
- **Tính năng hoàn thành**: 95%+ (theo bảng requirements)
- **Công nghệ sử dụng**:
  - Frontend: React, Vite, TailwindCSS, Framer Motion
  - Backend: Node.js, Express, PostgreSQL
  - Real-time: Socket.IO
  - Auth: Passport.js, JWT, Google OAuth
  - Charts: Recharts
  - QR: qrcode library

### Tính năng chưa làm (đề cập nhanh):
- ❌ Payment gateway integration (Stripe/VNPay/MoMo)
- ❌ Redis caching
- ❌ Google Analytics tracking
- ❌ Docker deployment
- ❌ Monitoring & logging (ELK/Prometheus)
- ❌ BI integration
- ❌ Multilingual support (i18n)

### Slide cảm ơn
- GitHub repository
- Contact info

---

## GHI CHÚ QUAN TRỌNG CHO NGƯỜI QUAY VIDEO

### Chuẩn bị trước khi quay:
1. **Seed data đầy đủ**:
   - Ít nhất 20 món ăn với ảnh đẹp
   - 5-10 categories
   - 10 bàn với QR codes
   - 5-8 nhân viên (Admin, Waiter, Kitchen)
   - 10-15 đơn hàng mẫu (các trạng thái khác nhau)
   - Reviews cho một số món

2. **Test WebSocket**:
   - Đảm bảo Socket.IO hoạt động tốt
   - Test notifications trên nhiều tab/browser

3. **Chuẩn bị 3 browser/tab**:
   - Tab 1: Customer App (Bàn 5)
   - Tab 2: Waiter App
   - Tab 3: Kitchen App
   - Tab 4: Admin Dashboard

4. **Audio**:
   - Test âm thanh thông báo
   - Đảm bảo microphone rõ ràng

### Thứ tự quay đề xuất:
1. Quay Customer App trước (Scene 1-6)
2. Quay Staff App (Scene 7-12)
3. Quay lại Customer App để show real-time updates
4. Quay tổng hợp (Scene 4)

### Tips quay video:
- **Tốc độ**: Vừa phải, không quá nhanh
- **Giọng nói**: Rõ ràng, tự tin
- **Highlight**: Pause 1-2 giây khi demo tính năng quan trọng
- **Transitions**: Smooth, không jump cut quá nhiều
- **Zoom**: Zoom vào UI khi cần thiết
- **Annotations**: Thêm text/arrows để highlight tính năng

### Checklist cuối cùng:
- [ ] Tất cả tính năng đã test hoạt động
- [ ] Data seed đầy đủ
- [ ] WebSocket hoạt động
- [ ] Audio notifications hoạt động
- [ ] UI không có lỗi hiển thị
- [ ] Network stable (không lag)

---

**Chúc bạn quay video thành công! 🎬🚀**
