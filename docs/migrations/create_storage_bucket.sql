-- ================================================
-- SUPABASE STORAGE SETUP FOR RESTAURANT LOGOS
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Create bucket for restaurant logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'restaurant-logos',
    'restaurant-logos',
    true,  -- Public bucket
    5242880,  -- 5MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Allow authenticated users to upload
CREATE POLICY "Allow authenticated upload to restaurant-logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'restaurant-logos' 
    AND auth.role() = 'authenticated'
);

-- 3. Policy: Allow public read access
CREATE POLICY "Public read access to restaurant-logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-logos');

-- 4. Policy: Allow authenticated users to update their files
CREATE POLICY "Allow authenticated update on restaurant-logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'restaurant-logos' 
    AND auth.role() = 'authenticated'
);

-- 5. Policy: Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated delete on restaurant-logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'restaurant-logos' 
    AND auth.role() = 'authenticated'
);

-- ================================================
-- VERIFICATION QUERIES
-- Run these to check if bucket was created
-- ================================================

-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'restaurant-logos';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%restaurant-logos%';
