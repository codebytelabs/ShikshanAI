-- =============================================
-- LESSON SECTIONS TABLE
-- Comprehensive Curriculum Content Feature
-- Requirements: 1.1, 1.2, 1.4, 6.1, 6.2
-- =============================================

-- Create lesson_sections table for structured educational content
CREATE TABLE IF NOT EXISTS public.lesson_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('introduction', 'concept', 'example', 'formula', 'remember', 'summary')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  ncert_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient topic-based queries
CREATE INDEX IF NOT EXISTS idx_lesson_sections_topic_id ON public.lesson_sections(topic_id);
CREATE INDEX IF NOT EXISTS idx_lesson_sections_display_order ON public.lesson_sections(topic_id, display_order);

-- Enable RLS
ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;

-- Lesson sections are publicly readable
CREATE POLICY "Lesson sections are publicly readable" ON public.lesson_sections FOR SELECT USING (true);

-- =============================================
-- STUDENT TOPIC LEARNING TABLE
-- Track section completion progress
-- =============================================

CREATE TABLE IF NOT EXISTS public.student_topic_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  sections_completed INTEGER NOT NULL DEFAULT 0,
  total_sections INTEGER NOT NULL DEFAULT 0,
  concept_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, topic_id)
);

-- Create index for student learning queries
CREATE INDEX IF NOT EXISTS idx_student_topic_learning_student ON public.student_topic_learning(student_id);
CREATE INDEX IF NOT EXISTS idx_student_topic_learning_topic ON public.student_topic_learning(topic_id);

-- Enable RLS
ALTER TABLE public.student_topic_learning ENABLE ROW LEVEL SECURITY;

-- Students can manage their learning progress
CREATE POLICY "Students can manage their learning" ON public.student_topic_learning FOR ALL USING (true);

-- Create trigger for updated_at (only if it doesn't exist)
DROP TRIGGER IF EXISTS update_student_topic_learning_updated_at ON public.student_topic_learning;
CREATE TRIGGER update_student_topic_learning_updated_at
  BEFORE UPDATE ON public.student_topic_learning
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
