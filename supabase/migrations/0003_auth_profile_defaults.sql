-- Sugidanon M3: Authentication documentation and profile defaults
-- No structural changes to M2 schema; documents secure admin provisioning.

COMMENT ON TABLE public.profiles IS
  'Application profiles for Supabase Auth users. New users default to learner via handle_new_user(). Admin promotion must be performed through controlled service-role operations — never via public registration.';

COMMENT ON FUNCTION public.handle_new_user() IS
  'Creates a learner profile when a Supabase Auth user is created. SECURITY DEFINER — do not assign admin role here.';
