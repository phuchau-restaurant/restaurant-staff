### ⚠️ Một lưu ý nhỏ để quy trình "mượt" hơn về sau

Vì bạn đang gặp lỗi Docker khi chạy `db diff` (lỗi do phần mềm Dock desktop), tôi khuyên bạn nên chốt quy trình làm việc (Workflow) từ giờ trở đi như sau để tránh lỗi:

**Khi bạn muốn sửa Database (ví dụ: thêm cột `price` vào bảng `tables`):**

1. **Bước 1:** Đừng sửa trực tiếp trên Dashboard Supabase (Web).
2. **Bước 2:** Hãy tạo một file migration mới trong VS Code.
    - Ví dụ: `supabase/migrations/20251216_add_price_to_tables.sql`
    - Nội dung: `ALTER TABLE tables ADD COLUMN price INT;`
3. **Bước 3:** Chạy lệnh sau để đẩy lên (Thêm cờ `-no-verify` để bỏ qua bước Docker bị lỗi):Bash
    
    `npx supabase db push --no-verify`
    
4. **Bước 4 (Nếu cần):** Cập nhật file `seeds/index.js` và chạy lại `npm run db:seed`.

Làm theo cách này, code và database của bạn sẽ luôn đồng bộ.