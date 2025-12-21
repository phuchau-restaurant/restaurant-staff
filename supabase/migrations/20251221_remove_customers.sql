-- Migration: Remove customers table and related references
-- Date: 2024-12-21
-- Description: This project is now staff-only, customer features have been removed

-- 1. Drop indexes related to customers
DROP INDEX IF EXISTS idx_customers_tenant;
DROP INDEX IF EXISTS idx_orders_customer;

-- 2. Drop the customers table
DROP TABLE IF EXISTS customers CASCADE;

-- Note: The customer_id column in orders table has already been removed
-- in the updated base migration file.
