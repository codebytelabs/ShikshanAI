-- =============================================
-- BETA-READY SCHEMA UPDATES
-- Migration for beta-ready-improvements spec
-- =============================================

-- =============================================
-- 1.1: Update student_topic_progress table
-- Add completed_at and score columns for tracking topic completion
-- Requirements: 1.1, 1.2
-- =============================================

-- Add completed_at column to track when a topic was completed
ALTER TABLE public.student_topic_progress 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add score column to track completion score
ALTER TABLE public.student_topic_progress 
ADD COLUMN IF NOT EXISTS score INTEGER;

-- Note: The table already has:
-- - student_id, topic_id columns
-- - UNIQUE(student_id, topic_id) constraint
-- - Index on student_id (idx_topic_progress_student was created but let's ensure it exists)
CREATE INDEX IF NOT EXISTS idx_student_topic_progress_student_id 
ON public.student_topic_progress(student_id);

-- =============================================
-- 1.2: Create question_attempts table
-- Track individual question attempts for practice sessions
-- Requirements: 3.2
-- =============================================

CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.practice_questions(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_question_attempts_student_id 
ON public.question_attempts(student_id);

CREATE INDEX IF NOT EXISTS idx_question_attempts_question_id 
ON public.question_attempts(question_id);

-- Composite index for common query pattern (student + question)
CREATE INDEX IF NOT EXISTS idx_question_attempts_student_question 
ON public.question_attempts(student_id, question_id);

-- Enable RLS
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (device-based, no auth initially)
CREATE POLICY "Students can manage their question attempts" 
ON public.question_attempts FOR ALL USING (true);

-- =============================================
-- 1.3: Update student_profiles table
-- Add user_id for auth linking and session_count for prompt tracking
-- Requirements: 4.1, 4.2, 4.4
-- =============================================

-- Add user_id column for linking to authenticated users
-- Note: We reference auth.users but make it nullable for anonymous users
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add session_count column for tracking app sessions (for sync prompt)
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS session_count INTEGER NOT NULL DEFAULT 0;

-- Create index on user_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id 
ON public.student_profiles(user_id);
