-- Seed file: Tạo tài khoản Super Admin đầu tiên
-- Chạy script này trong Supabase SQL Editor

-- Email: superadmin@gmail.com
-- Mật khẩu: admin123 (hash bcrypt)

INSERT INTO public.platform_users (email, password_hash, role, name, created_at)
VALUES (
  'superadmin@gmail.com',
  '$2b$10$XyII14j1FpOKX0sPJQ3x4O/m.4RexHnBdyBvG/09FpNJDkCZNtZ/',
  'super_admin',
  'Super Admin',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name;

-- Kiểm tra đã insert thành công:
-- SELECT * FROM public.platform_users WHERE email = 'superadmin@gmail.com';
