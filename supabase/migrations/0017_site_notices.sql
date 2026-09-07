-- Platform notices editable by admins (character representation disclaimer, etc.)

CREATE TABLE public.site_notices (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  short_text TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER site_notices_set_updated_at
  BEFORE UPDATE ON public.site_notices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_notices (key, title, body, short_text)
VALUES (
  'character_representation',
  'Character Representation Notice',
  'Characters shown throughout Suguidanon are artistic representations created to support the educational presentation of the Suguidanon narratives. Their appearance, clothing, features, expressions, and other visual details may include artistic interpretation based on the stories and available cultural references. These representations should not be understood as definitive or historically accurate depictions of the characters.',
  'Character representations are artistic interpretations for educational purposes.'
);

ALTER TABLE public.site_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_notices_select_public
  ON public.site_notices
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY site_notices_admin_write
  ON public.site_notices
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
