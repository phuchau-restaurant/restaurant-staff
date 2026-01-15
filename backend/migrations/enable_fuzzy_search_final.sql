-- FINAL FIX: Simplified PostgreSQL function without extra columns
-- This matches the exact structure of dishes table
-- Run this in Supabase SQL Editor

-- 1. Drop the old function
DROP FUNCTION IF EXISTS fuzzy_search_dishes(uuid, text, double precision);

-- 2. Enable the extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. Create GIN index on dishes.name for fast trigram search
CREATE INDEX IF NOT EXISTS dishes_name_trgm_idx 
ON dishes 
USING gin (name gin_trgm_ops);

-- 4. Create index for Vietnamese text search
CREATE INDEX IF NOT EXISTS dishes_name_lower_trgm_idx 
ON dishes 
USING gin (lower(name) gin_trgm_ops);

-- 5. Create simplified PostgreSQL function
-- Returns ONLY the columns that exist in dishes table
CREATE OR REPLACE FUNCTION fuzzy_search_dishes(
  p_tenant_id UUID,
  p_search_term TEXT,
  p_threshold FLOAT DEFAULT 0.3
)
RETURNS SETOF dishes AS $$
BEGIN
  RETURN QUERY
  SELECT d.*
  FROM dishes d
  WHERE d.tenant_id = p_tenant_id
    AND (
      -- Trigram similarity match
      similarity(d.name, p_search_term) > p_threshold
      OR
      -- Also include exact substring matches
      lower(d.name) LIKE '%' || lower(p_search_term) || '%'
    )
  ORDER BY similarity(d.name, p_search_term) DESC, d.name ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Test fuzzy search
-- SELECT * FROM fuzzy_search_dishes('019abac9-846f-75d0-8dfd-bcf9c9457866', 'phở bò', 0.3);
-- SELECT * FROM fuzzy_search_dishes('019abac9-846f-75d0-8dfd-bcf9c9457866', 'pho bo', 0.3);
-- SELECT * FROM fuzzy_search_dishes('019abac9-846f-75d0-8dfd-bcf9c9457866', 'bán', 0.3);
