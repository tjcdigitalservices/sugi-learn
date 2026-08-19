# SugiLearn — LLM / Agent Development Guide

## Project Purpose
SugiLearn is a multimedia learning system for the Panay Bukidnon Sugidanon.

The system is organized into 13 chapters based on the 13 published Sugidanon volumes:
1. Tikum Kadlum
2. Amburukay
3. Derikaryong Pada
4. Balanakon
5. Kalampay
6. Pahagunong
7. Sinagnayan
8. Humadapnon: Tarangban
9. Humadapnon: Pagbalukat ka Biday
10. Humadapnon: Hungaw
11. Humadapnon: Ginlawan
12. Alayaw
13. Nagbuhis

The four Humadapnon entries represent four volumes of the longer Humadapnon epic.

## Core Architecture Rule
Build SugiLearn as a **content-driven platform**, not 13 hardcoded pages.

Preferred flow:

    Admin/content data
        ↓
    Database / storage
        ↓
    Reusable chapter engine
        ↓
    Learner experience

Use reusable chapter/section/media components. Content should be separated from presentation logic.

## Current Scope
- Responsive web application
- Learner experience
- Administrator experience
- 13 chapters
- 15-question Pre-Assessment
- 15-question Post-Assessment
- Learning progress
- Results and analytics
- Content management
- Assessment management
- Cultural/content review workflow
- Up to 20 custom 2D illustrations across the entire system
- Up to 3 simple 2D animated scenes across the entire system
- Audio/narration support where required
- Deployment assistance
- Basic documentation

Exact multimedia allocation remains subject to client confirmation.

## Critical Content Rule
**Do not invent cultural, historical, linguistic, character, ritual, or story details.**

Use supplied client/source materials as the basis for content. The supplied Tikum Kadlum document is the current detailed source for Chapter 1.

The Aswang Project's "Summary of the Sugidanon (Epics) of Central Panay" is a project reference source. Its summaries are not automatically complete replacement text for the published epics.

If a source does not establish a fact:
- Do not invent it.
- Do not silently fill the gap from general knowledge.
- Mark it `Pending Client Confirmation` or `Pending Cultural Validation`.

Client-approved content takes precedence over AI-generated interpretation.

## Chapter Data
Do not create separate hardcoded implementations such as `Chapter1.jsx`, `Chapter2.jsx`, etc. when a reusable engine can handle them.

A conceptual chapter record should support:

    {
      id,
      number,
      title,
      subtitle,
      summary,
      status,
      sections,
      characters,
      learningPoints,
      media,
      assessmentReferences
    }

Recommended conceptual entities:
- users
- chapters
- chapter_sections
- characters
- media_assets
- assessments
- questions
- question_options
- learner_progress
- assessment_attempts
- review_items

## Chapter Structure
A chapter may contain:
1. Introduction
2. Story/content
3. Characters
4. Cultural/contextual information
5. Illustration
6. Audio/narration
7. Animation
8. Key learning points
9. Activity
10. Chapter completion

Not every chapter must have every media type.

## Learner Flow

    Home
      ↓
    Pre-Assessment
      ↓
    13-Chapter Journey
      ↓
    Chapter 1 → Chapter 2 → ... → Chapter 13
      ↓
    Post-Assessment
      ↓
    Results
      ↓
    Learning Analytics

## Assessment Rules
Keep assessments data-driven. Do not hardcode questions into UI components.

Question records should support metadata such as:

    chapterId
    assessmentType
    question
    options
    correctAnswer
    explanation
    sourceReference
    status

Questions must be based only on approved/source-supported content.

The exact assessment methodology and research metrics remain subject to client confirmation.

## Cultural Review
Support statuses such as:
- Draft
- For Review
- Approved
- Needs Revision

Do not represent draft content as culturally validated.

## Multimedia
### Illustrations
Maximum current scope: **20 custom 2D illustrations total**.

### Animation
Maximum current scope: **3 simple 2D animated scenes total**.

Do not assume every chapter has animation.

### Audio
Support uploaded narration/audio where required.

Media should be stored separately from application code.

## Admin Responsibilities
Admin should eventually support:
- Chapter management
- Section/content management
- Media uploads
- Illustration assignment
- Audio assignment
- Animation assignment
- Assessment/question management
- Review/approval status
- Learner analytics

The application should allow content to be populated after the core system is built.

## Development Strategy
Use a vertical-slice approach.

First make **Tikum Kadlum** work end-to-end:

    Database
      ↓
    Admin
      ↓
    Content
      ↓
    Media
      ↓
    Learner
      ↓
    Assessment
      ↓
    Progress
      ↓
    Analytics

Then reuse the chapter engine for Chapters 2–13.

## Technology Direction
Preferred stack:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Vercel

Avoid unnecessary infrastructure and dependencies.

## AI-Assisted Development
Primary tools:
- Cursor
- Claude Code

AI tools are development assistants, not sources of truth.

Before large changes:
1. Read `AGENTS.md`.
2. Read `README.md`.
3. Read the relevant specification.
4. Inspect the existing implementation.
5. Identify affected features.
6. Make the smallest coherent change.
7. Test the result.
8. Document important decisions.

Never blindly rewrite working functionality.

## Current Status
The project has an interactive prototype and is moving toward a production-ready, data-driven architecture.

Immediate target: **M0 → M10**, with Tikum Kadlum as the first complete vertical slice.

Remaining chapters may initially exist as records marked `Pending Source Content`. Do not invent their detailed content.

## Documentation
Maintain:
- `README.md`
- `AGENTS.md`
- `docs/SugiLearn_Project_Specification.md`

## Non-Negotiable Rules
1. Do not invent client content.
2. Do not silently change agreed scope.
3. Do not hardcode chapter-specific UI when reusable architecture is possible.
4. Do not expose unapproved cultural content as validated.
5. Do not replace working architecture without a reason.
6. Do not add unnecessary dependencies.
7. Do not create work outside agreed multimedia scope without approval.
8. Do not assume missing client requirements.
9. Mark unknown requirements as `Pending Client Confirmation`.
10. Keep SugiLearn maintainable by a small team using AI-assisted development.
