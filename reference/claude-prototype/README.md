# Sugidanon — Clickable Prototype

A frontend-only HTML/CSS/JS prototype of Sugidanon, a multimedia learning
system for the Panay Bukidnon Sugidanon. No build step, no backend —
just static files.

## Run it locally
1. Unzip this folder.
2. Open `index.html` directly in a browser, **or** for the most reliable
   experience serve it locally, e.g.:
   ```
   cd sugidanon-prototype
   python3 -m http.server 8000
   ```
   then visit http://localhost:8000

## What's here
- `index.html` — every learner and admin screen, as a single-page app
  (sections toggled by JS; no page reloads).
- `styles.css` — the full design system (color, type, components).
- `app.js` — navigation, assessment scoring, lesson state, and mock
  admin data. Everything resets on page reload (no persistence).

## Cultural content
Per the brief, no real Sugidanon story content, imagery, or cultural
specifics are included. Every place actual validated material would go
is clearly labeled — `[Validated Sugidanon Content]`,
`[Approved Illustration]`, `[Approved Audio]`, `[Approved 2D Animation]`.

## Learner flow
Home → Pre-Assessment (15 Qs, scored) → Multimedia Lesson (image / audio /
2D-animation sections) → Lesson Complete → Post-Assessment (15 Qs, scored)
→ Results (real pre/post comparison) → Learning Analytics.

## Admin flow
Admin Login → Dashboard → Learning Content Management → Multimedia
Content Editor → Assessment Management → Question Editor → Approved
Content Review (Draft / For Review / Approved / Needs Revision) →
Admin Analytics.

## Note on source material
No separate Sugidanon functional-specification file was actually attached
to the request that produced this prototype — only the descriptive brief
itself came through. This build treats that brief as the source of truth;
if a formal spec exists, re-check this prototype against it.
