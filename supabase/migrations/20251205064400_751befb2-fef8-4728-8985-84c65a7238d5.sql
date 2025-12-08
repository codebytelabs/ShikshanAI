-- =============================================
-- CURRICULUM STRUCTURE
-- =============================================

-- Boards (CBSE, ICSE, etc.)
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grades (9, 10, etc.)
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(board_id, number)
);

-- Subjects (Mathematics, Science)
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(grade_id, code)
);

-- Chapters
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  ncert_ref TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subject_id, chapter_number)
);

-- Topics within chapters
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  concept_count INTEGER NOT NULL DEFAULT 1,
  ncert_page_ref TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Practice questions
CREATE TABLE public.practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'mcq',
  options JSONB,
  correct_answer TEXT,
  hint TEXT,
  solution TEXT,
  ncert_ref TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STUDENT PROFILES (no auth, device-based)
-- =============================================

CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  name TEXT,
  grade_id UUID REFERENCES public.grades(id),
  streak_days INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student selected subjects
CREATE TABLE public.student_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

-- =============================================
-- PROGRESS TRACKING
-- =============================================

-- Topic progress (mastery tracking)
CREATE TABLE public.student_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  mastery INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  last_studied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, topic_id)
);

-- Practice session logs
CREATE TABLE public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id),
  chapter_id UUID REFERENCES public.chapters(id),
  questions_attempted INTEGER NOT NULL DEFAULT 0,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS (public read for curriculum, device-based write for progress)
-- =============================================

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Curriculum tables are publicly readable
CREATE POLICY "Curriculum is publicly readable" ON public.boards FOR SELECT USING (true);
CREATE POLICY "Grades are publicly readable" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Subjects are publicly readable" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Chapters are publicly readable" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Topics are publicly readable" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Questions are publicly readable" ON public.practice_questions FOR SELECT USING (true);

-- Student data - allow all operations (device-based, no auth)
CREATE POLICY "Students can manage their profile" ON public.student_profiles FOR ALL USING (true);
CREATE POLICY "Students can manage their subjects" ON public.student_subjects FOR ALL USING (true);
CREATE POLICY "Students can manage their progress" ON public.student_topic_progress FOR ALL USING (true);
CREATE POLICY "Students can manage their sessions" ON public.practice_sessions FOR ALL USING (true);

-- =============================================
-- SEED DATA: CBSE Class 9-10 Curriculum
-- =============================================

-- Insert CBSE board
INSERT INTO public.boards (id, name, code) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Central Board of Secondary Education', 'CBSE');

-- Insert Grades
INSERT INTO public.grades (id, board_id, name, number) VALUES 
  ('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111111', 'Class 9', 9),
  ('22222222-2222-2222-2222-222222222210', '11111111-1111-1111-1111-111111111111', 'Class 10', 10);

-- Insert Subjects for Class 10
INSERT INTO public.subjects (id, grade_id, name, code, icon, display_order) VALUES 
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222210', 'Mathematics', 'math', '📐', 1),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222210', 'Science', 'science', '🔬', 2);

-- Insert Subjects for Class 9
INSERT INTO public.subjects (id, grade_id, name, code, icon, display_order) VALUES 
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222209', 'Mathematics', 'math', '📐', 1),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222209', 'Science', 'science', '🔬', 2);

-- Class 10 Mathematics Chapters
INSERT INTO public.chapters (id, subject_id, name, chapter_number, ncert_ref, display_order) VALUES 
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'Real Numbers', 1, 'NCERT Class 10 Math, Ch. 1', 1),
  ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 'Polynomials', 2, 'NCERT Class 10 Math, Ch. 2', 2),
  ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333301', 'Pair of Linear Equations in Two Variables', 3, 'NCERT Class 10 Math, Ch. 3', 3),
  ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333301', 'Quadratic Equations', 4, 'NCERT Class 10 Math, Ch. 4', 4),
  ('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333301', 'Arithmetic Progressions', 5, 'NCERT Class 10 Math, Ch. 5', 5),
  ('44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333301', 'Triangles', 6, 'NCERT Class 10 Math, Ch. 6', 6),
  ('44444444-4444-4444-4444-444444444407', '33333333-3333-3333-3333-333333333301', 'Coordinate Geometry', 7, 'NCERT Class 10 Math, Ch. 7', 7),
  ('44444444-4444-4444-4444-444444444408', '33333333-3333-3333-3333-333333333301', 'Introduction to Trigonometry', 8, 'NCERT Class 10 Math, Ch. 8', 8);

-- Class 10 Science Chapters
INSERT INTO public.chapters (id, subject_id, name, chapter_number, ncert_ref, display_order) VALUES 
  ('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333302', 'Chemical Reactions and Equations', 1, 'NCERT Class 10 Science, Ch. 1', 1),
  ('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333302', 'Acids, Bases and Salts', 2, 'NCERT Class 10 Science, Ch. 2', 2),
  ('44444444-4444-4444-4444-444444444413', '33333333-3333-3333-3333-333333333302', 'Metals and Non-metals', 3, 'NCERT Class 10 Science, Ch. 3', 3),
  ('44444444-4444-4444-4444-444444444414', '33333333-3333-3333-3333-333333333302', 'Carbon and its Compounds', 4, 'NCERT Class 10 Science, Ch. 4', 4),
  ('44444444-4444-4444-4444-444444444415', '33333333-3333-3333-3333-333333333302', 'Life Processes', 5, 'NCERT Class 10 Science, Ch. 5', 5),
  ('44444444-4444-4444-4444-444444444416', '33333333-3333-3333-3333-333333333302', 'Control and Coordination', 6, 'NCERT Class 10 Science, Ch. 6', 6),
  ('44444444-4444-4444-4444-444444444417', '33333333-3333-3333-3333-333333333302', 'Electricity', 7, 'NCERT Class 10 Science, Ch. 7', 7),
  ('44444444-4444-4444-4444-444444444418', '33333333-3333-3333-3333-333333333302', 'Magnetic Effects of Electric Current', 8, 'NCERT Class 10 Science, Ch. 8', 8);

-- Topics for Real Numbers (Ch. 1 Math)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'Euclid''s Division Lemma', 3, 'pp. 2-5', 1),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', 'Fundamental Theorem of Arithmetic', 4, 'pp. 6-10', 2),
  ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401', 'Irrational Numbers', 2, 'pp. 11-14', 3),
  ('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444401', 'Decimal Expansions of Rational Numbers', 3, 'pp. 15-18', 4);

-- Topics for Polynomials (Ch. 2 Math)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444402', 'Zeros of a Polynomial', 3, 'pp. 22-26', 1),
  ('55555555-5555-5555-5555-555555555506', '44444444-4444-4444-4444-444444444402', 'Relationship between Zeros and Coefficients', 4, 'pp. 27-32', 2),
  ('55555555-5555-5555-5555-555555555507', '44444444-4444-4444-4444-444444444402', 'Division Algorithm for Polynomials', 3, 'pp. 33-37', 3);

-- Topics for Chemical Reactions (Ch. 1 Science)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555555511', '44444444-4444-4444-4444-444444444411', 'Chemical Equations', 4, 'pp. 1-6', 1),
  ('55555555-5555-5555-5555-555555555512', '44444444-4444-4444-4444-444444444411', 'Types of Chemical Reactions', 5, 'pp. 7-14', 2),
  ('55555555-5555-5555-5555-555555555513', '44444444-4444-4444-4444-444444444411', 'Oxidation and Reduction', 3, 'pp. 15-18', 3),
  ('55555555-5555-5555-5555-555555555514', '44444444-4444-4444-4444-444444444411', 'Effects of Oxidation in Daily Life', 2, 'pp. 19-22', 4);

-- Topics for Acids, Bases, Salts (Ch. 2 Science)
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555555515', '44444444-4444-4444-4444-444444444412', 'Acid-Base Indicators', 2, 'pp. 24-27', 1),
  ('55555555-5555-5555-5555-555555555516', '44444444-4444-4444-4444-444444444412', 'Reactions of Acids and Bases', 4, 'pp. 28-34', 2),
  ('55555555-5555-5555-5555-555555555517', '44444444-4444-4444-4444-444444444412', 'pH Scale', 3, 'pp. 35-39', 3),
  ('55555555-5555-5555-5555-555555555518', '44444444-4444-4444-4444-444444444412', 'Salts and their Properties', 4, 'pp. 40-46', 4);

-- Sample Practice Questions
INSERT INTO public.practice_questions (topic_id, question, question_type, options, correct_answer, hint, solution, ncert_ref, difficulty) VALUES 
  ('55555555-5555-5555-5555-555555555501', 'Find the HCF of 96 and 404 using Euclid''s division algorithm.', 'numerical', NULL, '4', 'Start by dividing the larger number by the smaller. Then divide the divisor by the remainder.', 'Step 1: 404 = 96 × 4 + 20\nStep 2: 96 = 20 × 4 + 16\nStep 3: 20 = 16 × 1 + 4\nStep 4: 16 = 4 × 4 + 0\n\nHCF = 4', 'NCERT Class 10 Math, Ch. 1, Example 1', 'medium'),
  ('55555555-5555-5555-5555-555555555503', 'Which of the following is an irrational number?', 'mcq', '["√4", "√9", "√5", "√16"]', '√5', 'A number is irrational if it cannot be expressed as p/q. Check which square roots are perfect squares.', '√5 is irrational because 5 is not a perfect square. √4 = 2, √9 = 3, √16 = 4 are all rational.', 'NCERT Class 10 Math, Ch. 1, pp. 8-10', 'easy'),
  ('55555555-5555-5555-5555-555555555511', 'Balance the chemical equation: Fe + O₂ → Fe₂O₃', 'short', NULL, '4Fe + 3O₂ → 2Fe₂O₃', 'Count atoms on both sides. Start by balancing Fe, then O.', '4Fe + 3O₂ → 2Fe₂O₃\n\nLeft side: 4 Fe atoms, 6 O atoms\nRight side: 4 Fe atoms, 6 O atoms', 'NCERT Class 10 Science, Ch. 1, pp. 6-8', 'medium'),
  ('55555555-5555-5555-5555-555555555512', 'What type of reaction is: 2Mg + O₂ → 2MgO?', 'mcq', '["Decomposition", "Combination", "Displacement", "Double displacement"]', 'Combination', 'In this reaction, two or more substances combine to form a single product.', 'This is a Combination reaction. Two reactants (Mg and O₂) combine to form a single product (MgO).', 'NCERT Class 10 Science, Ch. 1, pp. 10-11', 'easy'),
  ('55555555-5555-5555-5555-555555555505', 'Find the zeros of the polynomial p(x) = x² - 3x + 2', 'numerical', NULL, '1, 2', 'Factorise the polynomial to find values of x where p(x) = 0.', 'p(x) = x² - 3x + 2\n= x² - 2x - x + 2\n= x(x-2) - 1(x-2)\n= (x-1)(x-2)\n\nZeros: x = 1 and x = 2', 'NCERT Class 10 Math, Ch. 2, Example 2', 'medium'),
  ('55555555-5555-5555-5555-555555555517', 'What is the pH of a neutral solution at 25°C?', 'mcq', '["0", "7", "14", "1"]', '7', 'A neutral solution has equal concentrations of H⁺ and OH⁻ ions.', 'The pH of a neutral solution at 25°C is 7. At this pH, the concentration of H⁺ ions equals the concentration of OH⁻ ions.', 'NCERT Class 10 Science, Ch. 2, pp. 35-36', 'easy');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_topic_progress_updated_at
  BEFORE UPDATE ON public.student_topic_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();