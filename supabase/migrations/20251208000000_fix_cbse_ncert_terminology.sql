-- =============================================
-- FIX CBSE/NCERT TERMINOLOGY
-- =============================================
-- CBSE = The board (what students identify with)
-- NCERT = The textbook publisher (content source)
-- 
-- User-facing references should show "CBSE" as the primary identifier
-- Internal column names can reference "textbook" or "curriculum"
-- =============================================

-- Rename ncert_ref column to curriculum_ref (more accurate name)
-- This is an internal column name, so we use a neutral term
ALTER TABLE public.chapters 
RENAME COLUMN ncert_ref TO curriculum_ref;

ALTER TABLE public.topics 
RENAME COLUMN ncert_page_ref TO textbook_page_ref;

ALTER TABLE public.practice_questions 
RENAME COLUMN ncert_ref TO curriculum_ref;

-- Update chapter references to show CBSE (user-facing)
UPDATE public.chapters 
SET curriculum_ref = REPLACE(curriculum_ref, 'NCERT Class', 'CBSE Class')
WHERE curriculum_ref LIKE 'NCERT Class%';

-- Update practice question references to show CBSE (user-facing)
UPDATE public.practice_questions 
SET curriculum_ref = REPLACE(curriculum_ref, 'NCERT Class', 'CBSE Class')
WHERE curriculum_ref LIKE 'NCERT Class%';

-- Add comments to clarify the purpose
COMMENT ON COLUMN public.chapters.curriculum_ref IS 'Reference to CBSE curriculum chapter (content from NCERT textbooks)';
COMMENT ON COLUMN public.topics.textbook_page_ref IS 'Page reference in NCERT textbook';
COMMENT ON COLUMN public.practice_questions.curriculum_ref IS 'Reference to CBSE curriculum (content from NCERT textbooks)';
