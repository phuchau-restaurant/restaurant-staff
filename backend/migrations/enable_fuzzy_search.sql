-- Enable pg_trgm extension for fuzzy search
-- Run this in Supabase SQL Editor

-- 1. Enable the extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create GIN index on dishes.name for fast trigram search
CREATE INDEX IF NOT EXISTS dishes_name_trgm_idx 
ON dishes 
USING gin (name gin_trgm_ops);

-- 3. Optional: Create index for Vietnamese text search
-- If you want better Vietnamese support, also create:
CREATE INDEX IF NOT EXISTS dishes_name_lower_trgm_idx 
ON dishes 
USING gin (lower(name) gin_trgm_ops);

-- 4. Create PostgreSQL function for fuzzy search
CREATE OR REPLACE FUNCTION fuzzy_search_dishes(
  p_tenant_id UUID,
  p_search_term TEXT,
  p_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  category_id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  image_url TEXT,
  is_available BOOLEAN,
  prep_time_minutes INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.tenant_id,
    d.category_id,
    d.name,
    d.description,
    d.price,
    d.image_url,
    d.is_available,
    d.prep_time_minutes,
    d.created_at,
    d.updated_at,
    similarity(d.name, p_search_term) as similarity_score
  FROM dishes d
  WHERE d.tenant_id = p_tenant_id
    AND (
      -- Trigram similarity match
      similarity(d.name, p_search_term) > p_threshold
      OR
      -- Also include exact substring matches
      lower(d.name) LIKE '%' || lower(p_search_term) || '%'
    )
  ORDER BY similarity_score DESC, d.name ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Test fuzzy search (example queries)
-- Exact match:
-- SELECT * FROM fuzzy_search_dishes('019abac9-846f-75d0-8dfd-bcf9c9457866', 'phở bò', 0.3);

-- Typo tolerance:
-- SELECT * FROM fuzzy_search_dishes('019abac9-846f-75d0-8dfd-bcf9c9457866', 'pho bo', 0.3);
-- SELECT * FROM fuzzy_search_dishes('019abac9-846f-75d0-8dfd-bcf9c9457866', 'fo bo', 0.2);

-- Vietnamese without diacritics:
-- SELECT * FROM fuzzy_search_dishes('019abac9-846f-75d0-8dfd-bcf9c9457866', 'com tam', 0.3);
