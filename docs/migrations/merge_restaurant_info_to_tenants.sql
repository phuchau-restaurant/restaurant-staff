-- ===========================================
-- MIGRATION: Merge restaurant_info into tenants
-- Run this in Supabase SQL Editor
-- ===========================================

-- 1. Thêm các cột mới vào tenants (từ restaurant_info)
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS service_charge DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_rules JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Xóa cột subscription_plan và đổi tên owner_email thành email
ALTER TABLE tenants DROP COLUMN IF EXISTS subscription_plan;
ALTER TABLE tenants RENAME COLUMN owner_email TO email;

-- 3. Migrate data từ restaurant_info sang tenants
UPDATE tenants t
SET 
    logo_url = r.logo_url,
    address = r.address,
    phone = r.phone,
    tax_rate = COALESCE(r.tax_rate, 5.00),
    service_charge = COALESCE(r.service_charge, 0.00),
    discount_rules = COALESCE(r.discount_rules, '[]'::jsonb),
    updated_at = COALESCE(r.updated_at, NOW())
FROM restaurant_info r
WHERE t.id = r.tenant_id;

-- 4. Tạo trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_tenants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tenants_timestamp ON tenants;
CREATE TRIGGER trigger_update_tenants_timestamp
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_tenants_updated_at();

-- ===========================================
-- VERIFICATION - Run this to check migration
-- ===========================================
SELECT 
    id,
    name,
    slug,
    email,
    status,
    logo_url,
    address,
    phone,
    tax_rate,
    service_charge,
    discount_rules,
    created_at,
    updated_at
FROM tenants;

-- ===========================================
-- CLEANUP (Run after verifying data is correct)
-- ===========================================
-- DROP TABLE IF EXISTS restaurant_info;
