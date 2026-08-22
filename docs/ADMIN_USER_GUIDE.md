# Sugidanon — Administrator User Guide

**Audience:** Content administrators and project staff  
**Last updated:** 2026-08-15

This guide explains how to manage Sugidanon using the admin website. It does not include passwords or technical secrets.

---

## 1. Logging In

1. Open your Sugidanon website address in a browser.
2. Go to **Sign in** (`/login`).
3. Enter the admin email and password provided by your project team.
4. You will arrive at the **Dashboard**.

If you see “Unauthorized,” your account may not have admin access. Contact your project team.

To sign out, use the **Sign out** button in the admin header or sidebar.

---

## 2. Dashboard

The dashboard (`/admin`) shows:

- How many chapters exist
- Content status summary (draft, for review, approved, needs revision)
- Participation overview (learners, assessments) when data exists

Use the left sidebar (or mobile menu on small screens) to navigate.

---

## 3. Managing Chapters

Go to **Chapters** (`/admin/chapters`).

You will see all **13 chapters** in order. Click a chapter to open its editor.

Each chapter editor includes:

| Panel | Purpose |
|-------|---------|
| **Metadata** | Title, subtitle, summary, chapter review status |
| **Sections** | Story, introduction, media, characters, learning points, completion |
| **Characters** | Characters linked to this chapter |
| **Learning points** | Educational points (require client approval before publishing) |

### Review statuses

| Status | Meaning |
|--------|---------|
| **Draft** | Work in progress — learners cannot see it |
| **For review** | Ready for client or cultural review |
| **Approved** | Published to learners |
| **Needs revision** | Requires changes before approval |

**Important:** Only **Approved** sections, learning points, and media appear in the learner experience.

### Preview

Use **Preview** on a chapter to see how approved content will look to learners (without saving progress).

---

## 4. Editing Content

### Story and text sections

1. Open a chapter → find the section (e.g. Story).
2. Edit the title and body text.
3. Set the review status when ready.
4. Click **Save**.

### Reordering sections

Use the reorder controls in the section list to change reading order.

### Adding or removing sections

Use **Add section** where supported. Delete only when your workflow allows — prefer “Needs revision” over deleting approved content without backup.

---

## 5. Managing Characters

In the chapter editor **Characters** panel:

- View characters linked to the chapter
- Associate existing characters or edit descriptions
- Character review status controls learner visibility

Character names should match approved source material. Do not invent names without client confirmation.

---

## 6. Managing Learning Points

In the **Learning points** panel:

- Add or edit learning point title and description
- Set review status per point
- Reorder as needed

Learning points marked **PENDING CLIENT APPROVAL** in seed content must be reviewed before approval.

---

## 7. Uploading Media

Go to **Media** (`/admin/media`).

### Upload

1. Click **Upload** (or use the upload form).
2. Choose file type: illustration, audio, or animation/video.
3. Add title, caption, and alt text (for illustrations).
4. Associate with a chapter (and section if applicable).
5. Save — new assets start as **Draft**.

### Supported formats

- **Illustrations:** JPEG, PNG, WebP, GIF
- **Audio:** MP3, WAV, OGG
- **Animation/video:** MP4, WebM

---

## 8. Approving Media

1. Open a media asset from the library.
2. Review the preview.
3. Confirm metadata and chapter association.
4. Change review status to **Approved** when ready for learners.
5. Save.

Draft or “For review” media does not appear in the learner chapter experience.

---

## 9. Managing Assessments

Go to **Assessments** (`/admin/assessments`).

Two assessments exist:

- **Pre-Assessment** — taken before chapters
- **Post-Assessment** — taken after chapters

Official questions (15 each) are seeded from the client PDF bank and can be changed anytime in Admin — they are not locked to chapters, lessons, or animations.

For each assessment you can:

- Edit title and instructions
- Add, edit, reorder, or remove questions and answer options
- Set correct answer (admin view only — not shown to learners during the test)
- Set review status per question and for the assessment overall

Deleting a question:

- If no learner has answered it → permanently removed
- If learners have already answered it → **retired** (set to Draft and hidden from learners; history kept)

Only **Approved** questions are shown to learners.

Use **Preview** to walk through the assessment as a learner would see it.

---

## 10. Review Queue

Go to **Review** (`/admin/review`).

This page lists all items marked **For review** or **Needs revision** across chapters, media, and assessments. Click **Open** to go directly to the editor.

---

## 11. Viewing Analytics

Go to **Analytics** (`/admin/analytics`).

You can review:

- **Overview** — learner counts, participation
- **Chapters** — completion rates
- **Assessments** — average scores, pre/post score difference
- **Questions** — per-question performance

Terminology is neutral (e.g. “Score difference,” “Completion rate”) — it does not claim learning effectiveness.

Use filters for assessment type, chapter, or date range where available.

---

## 12. Exporting Reports

On the Analytics page, use **Export** buttons to download CSV files:

- Learner progress
- Assessment results
- Chapter completion

Store exports securely. Discuss anonymization requirements with your research team before sharing data.

---

## Tips

- Approve story sections before the completion section so learners cannot finish a chapter without reading content.
- Do not invent assessment content — edit the seeded official bank or paste client-approved wording in Admin.
- After content changes, verify the learner view using a test learner account.
- For content corrections vs. new feature requests, use `docs/M17_UAT_TRACKER.md` or your project feedback process.

---

## Related Documents

- `docs/M17_CLIENT_REVIEW_GUIDE.md` — structured client review process
- `docs/FINAL_CONTENT_STATUS.md` — content status by chapter
- `docs/PRODUCTION_DEPLOYMENT.md` — technical deployment (ops)
