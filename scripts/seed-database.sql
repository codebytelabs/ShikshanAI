-- Run this SQL in your Supabase SQL Editor to seed the database
-- Go to: https://supabase.com/dashboard/project/ftikimaunciokshcyobg/sql/new

-- Insert CBSE board (if not exists)
INSERT INTO public.boards (id, name, code) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Central Board of Secondary Education', 'CBSE')
ON CONFLICT (code) DO NOTHING;

-- Insert Grades (if not exists)
INSERT INTO public.grades (id, board_id, name, number) VALUES 
  ('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111111', 'Class 9', 9),
  ('22222222-2222-2222-2222-222222222210', '11111111-1111-1111-1111-111111111111', 'Class 10', 10)
ON CONFLICT (board_id, number) DO NOTHING;

-- Insert Subjects for Class 10
INSERT INTO public.subjects (id, grade_id, name, code, icon, display_order) VALUES 
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222210', 'Mathematics', 'math', '📐', 1),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222210', 'Science', 'science', '🔬', 2)
ON CONFLICT (grade_id, code) DO NOTHING;

-- Insert Subjects for Class 9
INSERT INTO public.subjects (id, grade_id, name, code, icon, display_order) VALUES 
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222209', 'Mathematics', 'math', '📐', 1),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222209', 'Science', 'science', '🔬', 2)
ON CONFLICT (grade_id, code) DO NOTHING;

-- Class 10 Mathematics Chapters
INSERT INTO public.chapters (id, subject_id, name, chapter_number, ncert_ref, display_order) VALUES 
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'Real Numbers', 1, 'NCERT Class 10 Math, Ch. 1', 1),
  ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 'Polynomials', 2, 'NCERT Class 10 Math, Ch. 2', 2),
  ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333301', 'Pair of Linear Equations in Two Variables', 3, 'NCERT Class 10 Math, Ch. 3', 3),
  ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333301', 'Quadratic Equations', 4, 'NCERT Class 10 Math, Ch. 4', 4),
  ('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333301', 'Arithmetic Progressions', 5, 'NCERT Class 10 Math, Ch. 5', 5)
ON CONFLICT (subject_id, chapter_number) DO NOTHING;

-- Class 10 Science Chapters
INSERT INTO public.chapters (id, subject_id, name, chapter_number, ncert_ref, display_order) VALUES 
  ('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333302', 'Chemical Reactions and Equations', 1, 'NCERT Class 10 Science, Ch. 1', 1),
  ('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333302', 'Acids, Bases and Salts', 2, 'NCERT Class 10 Science, Ch. 2', 2),
  ('44444444-4444-4444-4444-444444444413', '33333333-3333-3333-3333-333333333302', 'Metals and Non-metals', 3, 'NCERT Class 10 Science, Ch. 3', 3),
  ('44444444-4444-4444-4444-444444444414', '33333333-3333-3333-3333-333333333302', 'Carbon and its Compounds', 4, 'NCERT Class 10 Science, Ch. 4', 4),
  ('44444444-4444-4444-4444-444444444415', '33333333-3333-3333-3333-333333333302', 'Life Processes', 5, 'NCERT Class 10 Science, Ch. 5', 5)
ON CONFLICT (subject_id, chapter_number) DO NOTHING;

-- Topics for Real Numbers
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'Euclid''s Division Lemma', 3, 'pp. 2-5', 1),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', 'Fundamental Theorem of Arithmetic', 4, 'pp. 6-10', 2),
  ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401', 'Irrational Numbers', 2, 'pp. 11-14', 3)
ON CONFLICT DO NOTHING;

-- Topics for Chemical Reactions
INSERT INTO public.topics (id, chapter_id, name, concept_count, ncert_page_ref, display_order) VALUES 
  ('55555555-5555-5555-5555-555555555511', '44444444-4444-4444-4444-444444444411', 'Chemical Equations', 4, 'pp. 1-6', 1),
  ('55555555-5555-5555-5555-555555555512', '44444444-4444-4444-4444-444444444411', 'Types of Chemical Reactions', 5, 'pp. 7-14', 2),
  ('55555555-5555-5555-5555-555555555513', '44444444-4444-4444-4444-444444444411', 'Oxidation and Reduction', 3, 'pp. 15-18', 3)
ON CONFLICT DO NOTHING;

-- Sample Practice Questions
INSERT INTO public.practice_questions (topic_id, question, question_type, options, correct_answer, hint, solution, ncert_ref, difficulty) VALUES 
  ('55555555-5555-5555-5555-555555555501', 'Find the HCF of 96 and 404 using Euclid''s division algorithm.', 'numerical', NULL, '4', 'Start by dividing the larger number by the smaller.', 'Step 1: 404 = 96 × 4 + 20\nStep 2: 96 = 20 × 4 + 16\nStep 3: 20 = 16 × 1 + 4\nStep 4: 16 = 4 × 4 + 0\n\nHCF = 4', 'NCERT Class 10 Math, Ch. 1', 'medium'),
  ('55555555-5555-5555-5555-555555555503', 'Which of the following is an irrational number?', 'mcq', '["√4", "√9", "√5", "√16"]', '√5', 'Check which square roots are perfect squares.', '√5 is irrational because 5 is not a perfect square.', 'NCERT Class 10 Math, Ch. 1', 'easy'),
  ('55555555-5555-5555-5555-555555555511', 'Balance the chemical equation: Fe + O₂ → Fe₂O₃', 'short', NULL, '4Fe + 3O₂ → 2Fe₂O₃', 'Count atoms on both sides.', '4Fe + 3O₂ → 2Fe₂O₃', 'NCERT Class 10 Science, Ch. 1', 'medium'),
  ('55555555-5555-5555-5555-555555555512', 'What type of reaction is: 2Mg + O₂ → 2MgO?', 'mcq', '["Decomposition", "Combination", "Displacement", "Double displacement"]', 'Combination', 'Two substances combine to form one product.', 'This is a Combination reaction.', 'NCERT Class 10 Science, Ch. 1', 'easy')
ON CONFLICT DO NOTHING;

SELECT 'Seed data inserted successfully!' as result;
