-- ================================================
-- MIGRATION: Update payments table structure
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Create ENUM type for payment_method
CREATE TYPE payment_method_enum AS ENUM ('Cash', 'Card', 'E-Wallet');

-- 2. Drop old columns
ALTER TABLE payments 
DROP COLUMN IF EXISTS payment_method,
DROP COLUMN IF EXISTS payment_status;

-- 3. Add new columns
ALTER TABLE payments
ADD COLUMN payment_method payment_method_enum DEFAULT 'Cash',
ADD COLUMN is_paid BOOLEAN DEFAULT false,
ADD COLUMN subtotal NUMERIC DEFAULT 0,
ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN tax_amount NUMERIC DEFAULT 0,
ADD COLUMN service_charge_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN service_charge_amount NUMERIC DEFAULT 0,
ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0,
ADD COLUMN discount_amount NUMERIC DEFAULT 0;
