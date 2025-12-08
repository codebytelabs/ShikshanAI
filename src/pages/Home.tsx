import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStudentContext } from '@/contexts/StudentContext';
import { ProgressCard } from '@/components/home/ProgressCard';
import { TodayCard } from '@/components/home/TodayCard';
import { StreakDisplay } from '@/components/gamification';
import { getSubjectProgress } from '@/services/progressService';
import { getGamificationData, GamificationData } from '@/services/gamificationService';
import { BookOpen, Loader2, Star, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SubjectWithProgress {
  id: string;
  name: string;
  code: string;
  icon: string | null;
  chaptersCount: number;
  progress: number;
  completedTopics: number;
  totalTopics: number;
  displayText: string; // "X of Y topics completed"
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, subjects: studentSubjects, loading: profileLoading, updateStreak } = useStudentContext();
  const [subjectsWithProgress, setSubjectsWithProgress] = useState<SubjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeName, setGradeName] = useState('');
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (profile) {
      updateStreak();
      // Fetch gamification data
      getGamificationData(profile.id)
        .then(setGamification)
        .catch(console.error);
    }
  }, [profile?.id]);

  useEffect(() => {
    async function fetchData() {
      if (!profile?.grade_id || studentSubjects.length === 0) {
        setLoading(false);
        return;
      }

      // Get grade name
      const { data: gradeData } = await supabase
        .from('grades')
        .select('name')
        .eq('id', profile.grade_id)
        .single();
      
      if (gradeData) {
        setGradeName(gradeData.name);
      }

      // Get subjects with chapter counts
      const subjectIds = studentSubjects.map(s => s.subject_id);
      
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select(`
          id,
          name,
          code,
          icon,
          chapters (id)
        `)
        .in('id', subjectIds);

      if (subjectsData && profile) {
        // Fetch real progress for each subject using new status system
        const withProgressPromises = subjectsData.map(async (subject) => {
          const progress = await getSubjectProgress(profile.id, subject.id);
          return {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            icon: subject.icon,
            chaptersCount: subject.chapters?.length || 0,
            progress: progress.percentage,
            completedTopics: progress.completedTopics,
            totalTopics: progress.totalTopics,
            displayText: progress.displayText,
          };
        });
        
        const withProgress = await Promise.all(withProgressPromises);
        setSubjectsWithProgress(withProgress);
      }

      setLoading(false);
    }

    if (!profileLoading) {
      fetchData();
    }
  }, [profile, studentSubjects, profileLoading, refreshKey]);

  // Refetch data when navigating back to this page
  useEffect(() => {
    // This effect runs when location.key changes (navigation)
    // Trigger a refresh to get updated progress data
    setRefreshKey(prev => prev + 1);
  }, [location.key]);

  const handleStartLearning = () => {
    navigate('/learn');
  };

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state when no subjects selected
  if (subjectsWithProgress.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">Welcome to ShikshanAI!</h2>
        <p className="mt-2 text-center text-muted-foreground">
          Let's get started by selecting your class and subjects.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="mt-6 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground"
        >
          Get Started
        </button>
      </main>
    );
  }

  const todayTasks = [
    { id: '1', title: 'Revise today\'s concepts', subject: subjectsWithProgress[0]?.name || 'Mathematics', duration: '5 min', type: 'revision' },
    { id: '2', title: 'Practice questions', subject: subjectsWithProgress[1]?.name || 'Science', duration: '5 min', type: 'practice' },
  ];

  return (
    <main className="px-4 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-xl font-bold text-foreground">{gradeName || 'Student'}</h1>
        </div>
        <StreakDisplay 
          streak={gamification?.streak || profile?.streak_days || 0} 
          isAtRisk={gamification?.lastActivityDate ? new Date(gamification.lastActivityDate).toDateString() !== new Date().toDateString() : false}
        />
      </header>

      {/* Gamification Stats */}
      {gamification && (
        <section className="mt-4 grid grid-cols-2 gap-3">
          {/* XP & Level */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-muted-foreground">Level {gamification.level}</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">{gamification.xp} XP</p>
            <Progress value={gamification.levelProgress} className="mt-2 h-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">{gamification.xpToNextLevel} XP to next level</p>
          </div>
          
          {/* Daily Goal */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Daily Goal</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">
              {gamification.dailyProgressMinutes}/{gamification.dailyGoalMinutes} min
            </p>
            <Progress 
              value={(gamification.dailyProgressMinutes / gamification.dailyGoalMinutes) * 100} 
              className="mt-2 h-1.5" 
            />
            {gamification.dailyGoalCompleted && (
              <p className="mt-1 text-xs text-green-600">✓ Goal completed!</p>
            )}
          </div>
        </section>
      )}

      {/* Today's Learning */}
      <section className="mt-6">
        <TodayCard tasks={todayTasks} onStart={handleStartLearning} />
      </section>

      {/* Quick Continue - Only show if user has made progress */}
      {subjectsWithProgress.some(s => s.progress > 0) && (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Continue Learning</h2>
            <button 
              onClick={() => navigate('/learn')}
              className="text-sm font-medium text-primary"
            >
              See all
            </button>
          </div>
          
          {/* Show the subject with most recent progress or highest progress */}
          {(() => {
            const subjectWithProgress = subjectsWithProgress.find(s => s.progress > 0);
            if (!subjectWithProgress) return null;
            
            return (
              <div className="mt-3 rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <BookOpen className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{subjectWithProgress.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {subjectWithProgress.progress}% complete
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/learn?subject=${subjectWithProgress.id}`)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Resume
                  </button>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Subject Progress */}
      <section className="mt-6 pb-4">
        <h2 className="font-semibold text-foreground">Your Subjects</h2>
        <div className="mt-3 space-y-3">
          {subjectsWithProgress.map((subject) => (
            <ProgressCard key={subject.id} subject={subject} />
          ))}
        </div>
      </section>
    </main>
  );
}
