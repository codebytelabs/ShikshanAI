-- =============================================
-- ADD AVATAR FIELD TO STUDENT PROFILES
-- Allows students to select fun avatars
-- =============================================

-- Add avatar column to store selected avatar identifier
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'student-1';

-- Update existing profiles with a random avatar
UPDATE public.student_profiles 
SET avatar = 'student-' || (floor(random() * 8) + 1)::text
WHERE avatar IS NULL OR avatar = 'student-1';
