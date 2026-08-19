# M12 — Chapter 1 Multimedia Integration & Approval

**Status:** Complete (M12)  
**Last updated:** 2026-08-15

Integrates Chapter 1 (Tikum Kadlum) with the M11 media management foundation and verifies learner/admin publication rules.

---

## Media audit (Task 1)

| Asset | Type | Status | Section | Learner-visible | Source |
|-------|------|--------|---------|-----------------|--------|
| Tikum Kadlum — The Unusual Bamboo | Illustration | **Draft** | Illustration: The Unusual Bamboo | No | `docs/TIKUM_KADLUM_CHAPTER_1_SOURCE_MAP.md` |

**Audio:** None configured  
**Animation:** None configured  
**Approved illustration files:** None in repository (no artwork produced in M12)

Metadata records exist in:

- `lib/content/tikum-kadlum/chapter-1-media.ts`
- Mock bootstrap / `mockMediaStore`
- `supabase/seed-tikum-kadlum-chapter-1-m12.sql` (Supabase patch)

---

## Chapter 1 learner flow (after M12)

```
Introduction
    ↓
Story: The Hunting Trip
    ↓
Story: Territory and Negotiation
    ↓
Story: Compensation and Deception
    ↓
Illustration: The Unusual Bamboo  (empty until approved asset uploaded)
    ↓
Characters in This Chapter
    ↓
Chapter Complete
```

**Hidden from learners (draft):**

- Learning Points section
- All three learning point records
- Draft illustration media asset

---

## Illustration mapping

| Section | Media asset | File | Learner render |
|---------|-------------|------|----------------|
| Illustration: The Unusual Bamboo | `Tikum Kadlum — The Unusual Bamboo` | Not uploaded | Empty state until client-approved artwork is uploaded and asset status set to **Approved** |

Integration path (no hardcoded React paths):

```
Media Library → media_assets → chapter_sections.media_asset_id → ChapterEngine → MediaRenderer
```

---

## Approval gating

| Status | Admin preview | Learner |
|--------|---------------|---------|
| Draft | Visible (+ preview notice) | Hidden |
| For Review | Visible (+ preview notice) | Hidden |
| Needs Revision | Visible (+ preview notice) | Hidden |
| Approved | Visible | Visible |

Enforcement:

- **Supabase:** RLS on `chapter_sections`, `media_assets`, `learning_points`
- **Mock:** `filterChapterForLearner()` in `lib/domain/chapter-publication.ts`

---

## Presentation improvements (M12)

- Illustrations: `max-w-2xl`, `object-contain`, `max-h-[min(70vh,720px)]`, lazy loading, `decoding="async"`
- Admin preview notice for non-approved linked media
- Section order updated: illustration before characters

---

## Audio / animation

| Type | Status |
|------|--------|
| Audio | Not configured — no approved assets |
| Animation | Not configured — no approved assets |

No placeholder audio or animation was added.

---

## Database / seed scripts

| Script | Purpose |
|--------|---------|
| `supabase/seed-tikum-kadlum-chapter-1.sql` | Updated section order for fresh installs |
| `supabase/seed-tikum-kadlum-chapter-1-m12.sql` | Patch: reorder + draft illustration metadata |

---

## Routes

| Route | M12 verification |
|-------|------------------|
| `/admin/media` | Draft illustration metadata visible |
| `/admin/chapters/tikum-kadlum` | Illustration section linked to draft asset |
| `/admin/chapters/tikum-kadlum/preview` | Shows draft media notice; story → illustration → characters |
| `/learn/chapters/tikum-kadlum` | Approved sections only; illustration empty state |

---

## Remaining client approval

- Final illustration artwork for "The Unusual Bamboo" scene
- Illustration alt text for publication
- Learning points as official outcomes (section + records remain draft)
- Audio narration (if required)
- Animation (if required)
- Character portrait images (none configured)

---

## Related

- `docs/MEDIA_MANAGEMENT.md` — M11 media library
- `docs/M10_VERTICAL_SLICE.md` — Chapter 1 content slice
- `docs/TIKUM_KADLUM_CHAPTER_1_SOURCE_MAP.md` — source traceability
