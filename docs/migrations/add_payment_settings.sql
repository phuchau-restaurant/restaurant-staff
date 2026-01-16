-- ================================================
-- MIGRATION: Add Tax & Discount Settings to restaurant_info
-- Run this in Supabase SQL Editor
-- ================================================

-- Add new columns for payment settings
ALTER TABLE restaurant_info
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS service_charge DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_rules JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN restaurant_info.tax_rate IS 'VAT tax percentage (e.g., 10.00 = 10%)';
COMMENT ON COLUMN restaurant_info.service_charge IS 'Service charge percentage (e.g., 5.00 = 5%)';
COMMENT ON COLUMN restaurant_info.discount_rules IS 'Array of discount rules: [{min_order, discount_percent}, ...]';

-- ================================================
-- SAMPLE DATA UPDATE
-- Update your existing restaurant with sample discount rules
-- ================================================

UPDATE restaurant_info
SET 
    tax_rate = 10.00,
    service_charge = 5.00,
    discount_rules = '[
        {"min_order": 500000, "discount_percent": 5},
        {"min_order": 1000000, "discount_percent": 10},
        {"min_order": 2000000, "discount_percent": 15}
    ]'::jsonb,
    updated_at = NOW()
WHERE tenant_id = '019abac9-846f-75d0-8dfd-bcf9c9457866';

-- ================================================
-- VERIFICATION
-- ================================================

SELECT 
    name,
    tax_rate,
    service_charge,
    discount_rules,
    updated_at
FROM restaurant_info
WHERE tenant_id = '019abac9-846f-75d0-8dfd-bcf9c9457866';
