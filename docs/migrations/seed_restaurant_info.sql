-- ================================================
-- INSERT SAMPLE RESTAURANT DATA
-- Run this in Supabase SQL Editor to test edit functionality
-- ================================================

-- IMPORTANT: Replace 'your-tenant-id-here' with your actual tenant_id
-- You can find tenant_id in frontend/.env file (VITE_TENANT_ID)

INSERT INTO restaurant_info (
    tenant_id,
    name,
    logo_url,
    address,
    email,
    phone,
    created_at,
    updated_at
) VALUES (
    '019abac9-846f-75d0-8dfd-bcf9c9457866',  -- Your tenant_id from .env
    'Nhà Hàng Phúc Châu',
    NULL,  -- Logo chưa có, sẽ upload sau
    '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    'contact@phucchau.vn',
    '028 3825 1234',
    NOW(),
    NOW()
)
ON CONFLICT (tenant_id) 
DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- ================================================
-- VERIFICATION: Check if data was inserted
-- ================================================

SELECT 
    id,
    tenant_id,
    name,
    email,
    phone,
    address,
    logo_url,
    created_at,
    updated_at
FROM restaurant_info
ORDER BY created_at DESC
LIMIT 1;
