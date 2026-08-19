# Tikum Kadlum — Chapter 1 Source Traceability Map

**Source:** `docs/sources/Tikum-Kadlum-Sugidanon-Source.docx`  
**Section:** Opening entry — *Tikum Kadlum: Sugidanon (Epics) of Panay Book I*  
**Authors (as supplied):** Magos, Alicia P. et al.

This map links SugiLearn Chapter 1 CMS content to the client source. The source is a **summary**, not the full epic text. SugiLearn presents **educational adaptation/summary content** — not original epic dialogue.

---

## Chapter metadata

| SugiLearn field | Source basis | CMS / DB |
|-----------------|--------------|----------|
| Title: Tikum Kadlum | Source heading | `chapters.title` |
| Subtitle: Sugidanon (Epics) of Panay Book I | Source heading | `chapters.subtitle` |
| Summary paragraph | Full source paragraph for Book I | `chapters.summary` |
| Authors | "By Magos, Alicia P. et al." | Referenced in introduction section body |

---

## Sections

| Order | Section | Source passage | Purpose |
|-------|---------|----------------|---------|
| 0 | Introduction | Document header + authorship | Orient learner; distinguish summary from full epic |
| 1 | Story: The Hunting Trip | First sentence through "cuts it down" | Hunting and ignored warning |
| 2 | Story: Territory and Negotiation | Bamboo ownership through compensation | Territory, negotiation, daughters as compensation |
| 3 | Story: Compensation and Deception | Final sentence | Soot disguise and recognition |
| 4 | Characters | Names appearing in source paragraph | Character reference |
| 5 | Illustration (placeholder) | Bamboo / warning scenes in source | Media slot — no asset in M10 |
| 6 | Learning points | Themes inferable from source events | **PENDING CLIENT APPROVAL** — draft status |
| 7 | Completion | Not in source | Journey navigation |

### Introduction body (traceability)

> Source: Document title block + M10 educational framing (not in original epic text)

### Story sections (traceability)

All story body text is taken **verbatim or with minimal paragraph splitting** from the single Book I summary paragraph in the source document. No additional events were inserted between source points.

---

## Characters

| Character | Source mention | Description scope |
|-----------|----------------|-------------------|
| Datu Paiburong | Named; hunts; cuts bamboo; offers daughters; disguise | Source-supported actions only |
| Dumaraog | Brother; hunts with Paiburong | Source-supported |
| Tikum Kadlum | Extraordinary dog; draws attention to bamboo | Source-supported |
| Makabagting | Man-eating being; bamboo owner; sees through deception | Source-supported |
| Amburukay | Hermit sister of Makabagting | Source-supported |
| Matan-ayon | Daughter; compensation | Source-supported |
| Saranggaon | Daughter; compensation | Source-supported |
| Bulawanon | Disguise with soot with Paiburong | Source-supported |

**Not provided in source:** physical appearance, clothing, extended biography, personality beyond stated actions.

---

## Learning points

| Learning point | Source basis | Status |
|----------------|--------------|--------|
| Territory and what is not one's own | "entered another being's territory and destroyed something that was not his" | PENDING CLIENT APPROVAL |
| Negotiation and compensation | "After negotiation, the owners agree to accept... daughters... as compensation" | PENDING CLIENT APPROVAL |
| Deception and recognition | "disguising them with soot, but Makabagting sees through the deception" | PENDING CLIENT APPROVAL |

Stored with `review_status: draft`. Learning points section also `draft` for learners until approved.

---

## Illustration candidates (documentation only — M10)

| Scene | Source basis |
|-------|--------------|
| Tikum Kadlum and the bamboo | "repeatedly draws their attention to an unusual bamboo tree" |
| Paiburong cuts the bamboo | "cuts it down" |
| Makabagting / Amburukay and the bamboo | "The bamboo belongs to Makabagting... and his hermit sister Amburukay" |
| Negotiation | "After negotiation, the owners agree to accept..." |
| Soot disguise | "disguising them with soot" |

No illustration assets created in M10.

---

## Data locations

| Layer | Path |
|-------|------|
| Content module | `lib/content/tikum-kadlum/chapter-1.ts` |
| Mock bootstrap | `lib/content/tikum-kadlum/mock-bootstrap.ts` |
| Supabase seed | `supabase/seed-tikum-kadlum-chapter-1.sql` |
| Learner route | `/learn/chapters/tikum-kadlum` |
| Admin CMS | `/admin/chapters/tikum-kadlum` |
| Admin preview | `/admin/chapters/tikum-kadlum/preview` |

---

## Intentionally pending

- Final approved learner-facing wording
- Full epic text (not in supplied document)
- Audio narration
- Animation
- Approved illustrations
- Chapter 1 assessment questions
- Official learning outcome statements
