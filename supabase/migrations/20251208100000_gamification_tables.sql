-- =============================================
-- GAMIFICATION TABLES
-- Learning Experience Overhaul
-- Requirements: 3.1, 3.7, 4.1, 5.1-5.4
-- =============================================

-- Student Gamification (XP, Level, Streak tracking)
CREATE TABLE public.student_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
  daily_progress_minutes INTEGER NOT NULL DEFAULT 0,
  daily_goal_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Badges definition table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL,
  criteria_type VARCHAR(50) NOT NULL, -- 'xp', 'streak', 'mastery', 'completion', 'first_topic'
  criteria_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student earned badges
CREATE TABLE public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- Topic learning progress (concept learning tracking)
CREATE TABLE public.student_topic_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  sections_completed INTEGER NOT NULL DEFAULT 0,
  total_sections INTEGER NOT NULL DEFAULT 0,
  concept_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, topic_id)
);

-- XP transactions history
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_student_gamification_student_id ON public.student_gamification(student_id);
CREATE INDEX idx_student_gamification_last_activity ON public.student_gamification(last_activity_date);
CREATE INDEX idx_student_badges_student_id ON public.student_badges(student_id);
CREATE INDEX idx_student_badges_badge_id ON public.student_badges(badge_id);
CREATE INDEX idx_student_topic_learning_student_id ON public.student_topic_learning(student_id);
CREATE INDEX idx_student_topic_learning_topic_id ON public.student_topic_learning(topic_id);
CREATE INDEX idx_xp_transactions_student_id ON public.xp_transactions(student_id);
CREATE INDEX idx_xp_transactions_created_at ON public.xp_transactions(created_at);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_topic_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- Badges are publicly readable
CREATE POLICY "Badges are publicly readable" ON public.badges FOR SELECT USING (true);

-- Student data - allow all operations (device-based, no auth)
CREATE POLICY "Students can manage their gamification" ON public.student_gamification FOR ALL USING (true);
CREATE POLICY "Students can manage their badges" ON public.student_badges FOR ALL USING (true);
CREATE POLICY "Students can manage their topic learning" ON public.student_topic_learning FOR ALL USING (true);
CREATE POLICY "Students can manage their xp transactions" ON public.xp_transactions FOR ALL USING (true);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_student_gamification_updated_at
  BEFORE UPDATE ON public.student_gamification
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_topic_learning_updated_at
  BEFORE UPDATE ON public.student_topic_learning
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- DEFAULT BADGE DEFINITIONS
-- Requirements: 5.1, 5.2, 5.3, 5.4
-- =============================================

INSERT INTO public.badges (id, name, description, icon, criteria_type, criteria_value) VALUES
  -- First Steps badge (Requirement 5.1)
  ('66666666-6666-6666-6666-666666666601', 'First Steps', 'Complete your first topic', '🎯', 'first_topic', 1),
  
  -- Week Warrior badge (Requirement 5.2)
  ('66666666-6666-6666-6666-666666666602', 'Week Warrior', 'Maintain a 7-day learning streak', '🔥', 'streak', 7),
  
  -- Month Master badge (30-day streak milestone)
  ('66666666-6666-6666-6666-666666666603', 'Month Master', 'Maintain a 30-day learning streak', '⚡', 'streak', 30),
  
  -- Century Champion badge (100-day streak milestone)
  ('66666666-6666-6666-6666-666666666604', 'Century Champion', 'Maintain a 100-day learning streak', '👑', 'streak', 100),
  
  -- Chapter Champion badge (Requirement 5.3)
  ('66666666-6666-6666-6666-666666666605', 'Chapter Champion', 'Achieve 80% mastery on a chapter', '🏆', 'mastery', 80),
  
  -- Rising Star badge (Requirement 5.4)
  ('66666666-6666-6666-6666-666666666606', 'Rising Star', 'Earn 1000 XP', '⭐', 'xp', 1000),
  
  -- Additional XP milestones
  ('66666666-6666-6666-6666-666666666607', 'Knowledge Seeker', 'Earn 5000 XP', '🌟', 'xp', 5000),
  ('66666666-6666-6666-6666-666666666608', 'Scholar', 'Earn 10000 XP', '📚', 'xp', 10000),
  
  -- Completion badges
  ('66666666-6666-6666-6666-666666666609', 'Topic Explorer', 'Complete 10 topics', '🗺️', 'completion', 10),
  ('66666666-6666-6666-6666-666666666610', 'Subject Master', 'Complete 50 topics', '🎓', 'completion', 50);
