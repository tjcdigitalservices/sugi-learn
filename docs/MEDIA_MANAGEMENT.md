# Media Management (M11)

**Last updated:** 2026-08-15

Administrative media library for illustrations, audio, and animation/video assets. Admins upload files, manage metadata, associate assets with chapter sections, and control review status without changing application code.

---

## Architecture flow

```
Admin /admin/media
    ↓
MediaRepository (mock or Supabase)
    ↓
Supabase Storage (production) / in-memory data URLs (mock)
    ↓
media_assets table (metadata + review status)
    ↓
chapter_sections.media_asset_id
    ↓
ChapterRepository → ChapterEngine → MediaRenderer
    ↓
Learner (approved assets only)
```

M11 reuses the existing M6 `MediaRenderer` and section views. No second media system was introduced.

---

## Media types

| Kind | Upload formats | Max size | Scope limit |
|------|----------------|----------|-------------|
| `illustration` | JPEG, PNG, WebP, GIF | 10 MB | 20 total (soft) |
| `audio` | MP3, MP4 audio, WAV, OGG | 25 MB | None |
| `animation` | MP4, WebM | 200 MB | 3 total (soft) |

Scope limits are enforced in the upload action as soft validation per AGENTS.md.

---

## Database

**Existing table reused:** `public.media_assets` (M2 foundation)

**New migration:** `supabase/migrations/0003_media_storage.sql`

- Adds `source_reference TEXT`
- Creates public `media` storage bucket
- Storage RLS: public read; admin insert/update/delete

Fields used:

| Field | Purpose |
|-------|---------|
| `title` | Admin display name |
| `caption` | Description |
| `alt_text` | Illustration accessibility |
| `source_reference` | Document/approval traceability |
| `storage_path` | Bucket path or mock data URL |
| `chapter_id` / `section_id` | Association |
| `review_status` | Draft / For review / Approved / Needs revision |

Section link is bidirectional: `chapter_sections.media_asset_id` and `media_assets.section_id` are kept in sync on assign.

---

## Storage

**Bucket:** `media` (public)

**Path convention:** `media/{chapterSlug}/{kind}/{assetId}/{filename}`

**URL resolution:** `lib/media/resolve-media-url.ts`

- Absolute URLs used as-is
- Relative paths resolved to `{SUPABASE_URL}/storage/v1/object/public/{path}`

**Security decision:** Public bucket with opaque paths. Learners only receive approved asset metadata through PostgreSQL RLS on `media_assets`. Draft asset paths are not exposed in learner chapter payloads. Direct URL access is possible if the path is known — acceptable for this milestone; signed URLs can be added later if required.

**Mock mode:** Files stored as data URLs in `storage_path` when Supabase is not configured.

---

## Admin routes

| Route | Purpose |
|-------|---------|
| `/admin/media` | Media library, upload, filters |
| `/admin/media/[mediaId]` | Asset detail, metadata edit, section assign |

Chapter section editor also includes `SectionMediaPicker` for inline assignment.

---

## Review status and learner visibility

Uses the shared review model (`draft`, `for_review`, `approved`, `needs_revision`).

| Layer | Behavior |
|-------|----------|
| PostgreSQL RLS | Learners SELECT only `review_status = 'approved'` |
| Mock learner repo | Filters `chapter.media` to approved assets |
| Admin preview / CMS | All assets visible |

New uploads default to **Draft**. Learners do not see draft media even if a section references it.

---

## Delete / archive behavior

- **Referenced assets cannot be deleted.** Admin must unlink first.
- Delete removes the storage object (Supabase) and database row.
- Unlink clears `section_id` and `chapter_sections.media_asset_id`.

---

## Chapter 1 integration

The existing illustration section **"Illustration: The Unusual Bamboo"** (`tikum-kadlum`) can now:

1. Receive an uploaded illustration via `/admin/media`
2. Be assigned in the chapter section editor or asset detail page
3. Preview in admin chapter preview (all statuses)
4. Render for learners only after the asset is **Approved**

No Chapter 1–specific media code was added.

---

## Key files

| Area | Path |
|------|------|
| Types | `types/media-management.ts`, `types/media.ts` |
| Repository | `lib/data/supabase/media-repository.ts`, `lib/data/mock/media-repository.ts` |
| Actions | `lib/media/actions.ts` |
| Validation | `lib/media/validation.ts` |
| Storage helpers | `lib/media/storage.ts` |
| Admin UI | `components/admin/media-management/` |
| Renderer (unchanged) | `components/chapter/media-renderer.tsx` |

---

## Known limitations

1. No bulk upload or drag-and-drop library
2. No signed URLs (public bucket only)
3. Character portrait assignment not wired in admin UI (schema supports `characters.media_asset_id`)
4. No automatic thumbnail generation for video
5. Illustration/audio/animation production is separate from this milestone
6. Storage bucket requires migration `0003` on Supabase projects

---

## Pending client approval

- Illustration style and scenes (including five Chapter 1 candidates)
- Character visual appearance
- Final illustration artwork
- Audio narration
- Animation/video assets
- Alt text and captions for publication

---

## Related

- `docs/CHAPTER_ENGINE.md`
- `docs/M10_VERTICAL_SLICE.md`
- `docs/DATABASE.md`
