-- Raise media bucket upload limit to 200 MB (matches app animation max).
UPDATE storage.buckets
SET file_size_limit = 209715200
WHERE id = 'media';
