-- Federico Caballero biography (admin-editable via site_notices; used on /about).

INSERT INTO public.site_notices (key, title, body, short_text)
VALUES (
  'federico_caballero_about',
  'Federico ''Nong Pedring'' Caballero',
  E'Federico ''Nong Pedring'' Caballero (1935–2024) was a Panay-Bukidnon epic chanter, storyteller, and cultural bearer from Calinog, Iloilo. He was recognized in 2000 with the Gawad sa Manlilikha ng Bayan (GAMABA), or National Living Treasures Award, for his mastery of the Sugidanon, the epic tradition of Central Panay.\n\nCaballero learned the epics from his family, particularly from his elders who would chant them as part of everyday community life. He became one of the important bearers of a tradition that preserved ten major Panay-Bukidnon epics, many of which were performed in an archaic language related to Kinaray-a that is no longer spoken.\n\nThroughout his life, Caballero worked with researchers and cultural scholars to document, reconstruct, and preserve these oral epics, including Humadapnon and Labaw Donggon. He also encouraged members of his community to learn reading and writing so that their traditional stories, knowledge, and beliefs could be documented and passed on to future generations.\n\nBeyond being an epic chanter, Caballero served his community as a manughusay, an arbiter who helped resolve local disputes. His work therefore extended beyond storytelling: he was a keeper of memory, language, tradition, and community knowledge.\n\nFederico Caballero passed away on August 17, 2024, at the age of 88. His legacy continues through the documentation and publication of the Panay-Bukidnon Sugidanon epics, helping make this important oral heritage accessible to new generations.',
  'Federico ''Nong Pedring'' Caballero (1935–2024)'
)
ON CONFLICT (key) DO NOTHING;
