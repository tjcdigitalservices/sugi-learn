-- Raise media bucket upload limit to 100 MB (matches app animation max).
UPDATE storage.buckets
SET file_size_limit = 104857600
WHERE id = 'media';
