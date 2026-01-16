-- ===========================================
-- MIGRATION: Create restaurant_info table
-- Run this in Supabase SQL Editor
-- ===========================================

-- Create restaurant_info table
CREATE TABLE IF NOT EXISTS restaurant_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL UNIQUE,  -- Each tenant has exactly 1 restaurant profile
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookup by tenant
CREATE INDEX IF NOT EXISTS idx_restaurant_info_tenant ON restaurant_info(tenant_id);

-- Enable Row Level Security
ALTER TABLE restaurant_info ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your security needs)
-- Policy: Users can read their own tenant's restaurant info
CREATE POLICY "Users can view their tenant restaurant info" 
ON restaurant_info FOR SELECT
USING (true);  -- Adjust if needed: e.g., tenant_id = auth.jwt()->>'tenant_id'

-- Policy: Admins can update their tenant's restaurant info
CREATE POLICY "Admins can update restaurant info"
ON restaurant_info FOR UPDATE
USING (true);  -- Adjust based on role

-- Policy: Admins can insert restaurant info
CREATE POLICY "Admins can insert restaurant info"
ON restaurant_info FOR INSERT
WITH CHECK (true);  -- Adjust based on role

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_restaurant_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_restaurant_info_timestamp ON restaurant_info;
CREATE TRIGGER trigger_update_restaurant_info_timestamp
    BEFORE UPDATE ON restaurant_info
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_info_updated_at();

-- ===========================================
-- OPTIONAL: Insert sample data
-- ===========================================
-- INSERT INTO restaurant_info (tenant_id, name, email, phone, address)
-- VALUES (
--     'your-tenant-uuid-here',
--     'Nhà Hàng Phúc Châu',
--     'contact@phucchau.com',
--     '0901234567',
--     '123 Đường Nguyễn Huệ, Quận 1, TP.HCM'
-- );
