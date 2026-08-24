-- Align media bucket with Supabase Free plan max upload size (50 MB).
-- App animation max is also 50 MB; illustration/audio remain lower in app validation.

UPDATE storage.buckets
SET file_size_limit = 52428800 -- 50 MB
WHERE id = 'media';
