-- Chapter cover image (admin-managed; optional FK to media_assets).
ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS cover_media_asset_id UUID
    REFERENCES public.media_assets (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS chapters_cover_media_asset_id_idx
  ON public.chapters (cover_media_asset_id)
  WHERE cover_media_asset_id IS NOT NULL;
