-- Migration: update_platform_users_table.sql
-- Thêm các cột còn thiếu cho bảng platform_users

-- Thêm cột name (varchar)
ALTER TABLE public.platform_users 
ADD COLUMN IF NOT EXISTS name VARCHAR(100) NULL;

-- Thêm cột created_at nếu chưa có
ALTER TABLE public.platform_users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Comment mô tả bảng
COMMENT ON TABLE public.platform_users IS 'Bảng lưu thông tin super admin của platform';
COMMENT ON COLUMN public.platform_users.id IS 'ID tự tăng';
COMMENT ON COLUMN public.platform_users.email IS 'Email đăng nhập (unique)';
COMMENT ON COLUMN public.platform_users.password_hash IS 'Mật khẩu đã hash (bcrypt)';
COMMENT ON COLUMN public.platform_users.role IS 'Role: super_admin';
COMMENT ON COLUMN public.platform_users.name IS 'Tên hiển thị';
COMMENT ON COLUMN public.platform_users.created_at IS 'Ngày tạo tài khoản';
