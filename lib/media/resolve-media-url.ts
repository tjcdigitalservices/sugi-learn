/**
 * Resolves a media asset storage path to a renderable URL.
 * Public Supabase Storage bucket; learner visibility is gated by media_assets RLS.
 * Paths starting with `/` are treated as app public assets.
 */
export function resolveMediaUrl(storagePath: string | null): string | null {
  if (!storagePath?.trim()) {
    return null;
  }

  const trimmed = storagePath.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  const normalizedPath = trimmed.replace(/^\/+/, "");
  return `${supabaseUrl}/storage/v1/object/public/${normalizedPath}`;
}
