-- M11 — Media storage bucket and source reference field

ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS source_reference TEXT;

-- Public media bucket (learner access gated by media_assets RLS + opaque paths)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Anyone can read objects in the public media bucket (URLs are not listed publicly)
DROP POLICY IF EXISTS media_storage_select ON storage.objects;
CREATE POLICY media_storage_select
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS media_storage_admin_insert ON storage.objects;
CREATE POLICY media_storage_admin_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS media_storage_admin_update ON storage.objects;
CREATE POLICY media_storage_admin_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS media_storage_admin_delete ON storage.objects;
CREATE POLICY media_storage_admin_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());
