-- Dedicated media kind for chapter storybook covers (closed-book art).
-- Separate from in-chapter illustrations so covers do not mix with content media.
-- Note: new enum values cannot be used in the same transaction (see 0021).

ALTER TYPE public.media_kind ADD VALUE IF NOT EXISTS 'book_cover';
