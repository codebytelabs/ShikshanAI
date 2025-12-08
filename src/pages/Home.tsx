import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStudentContext } from '@/contexts/StudentContext';
import { getSubjectProgress } from '@/services/progressService';
import { getGamificationData, GamificationData } from '@/services/gamificationService';
import { 
  BookOpen, Loader2, Star, Target, Flame, Trophy, 
  ChevronRight, Play, Sparkles, Clock, Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SubjectWithProgress {
  id: string;
  name: string;
  code: string;
  icon: string | null;
  chaptersCount: number;
  progress: number;
  completedTopics: number;
  totalTopics: number;
  displayText: string;
}

// Subject color mapping
const subjectColors: Record<string, { bg: string; text: string; gradient: string; icon: string }> = {
  'Mathematics': { 
    bg: 'bg-violet-100', 
    text: 'text-violet-700', 
    gradient: 'from-violet-500 to-purple-600',
    icon: '📐'
  },
  'Science': { 
    bg: 'bg-cyan-100', 
    text: 'text-cyan-700', 
    gradient: 'from-cyan-500 to-teal-600',
    icon: '🔬'
  },
  'English': { 
    bg: 'bg-pink-100', 
    text: 'text-pink-700', 
    gradient: 'from-pink-500 to-rose-600',
    icon: '📚'
  },
  'Social Science': { 
    bg: 'bg-orange-100', 
    text: 'text-orange-700', 
    gradient: 'from-orange-500 to-amber-600',
    icon: '🌍'
  },
};

const getSubjectStyle = (name: string) => {
  return subjectColors[name] || { 
    bg: 'bg-indigo-100', 
    text: 'text-indigo-700', 
    gradient: 'from-indigo-500 to-purple-600',
    icon: '📖'
  };
};

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

      const { data: gradeData } = await supabase
        .from('grades')
        .select('name')
        .eq('id', profile.grade_id)
        .single();
      
      if (gradeData) {
        setGradeName(gradeData.name);
      }

      const subjectIds = studentSubjects.map(s => s.subject_id);
      
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select(`id, name, code, icon, chapters (id)`)
        .in('id', subjectIds);

      if (subjectsData && profile) {
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

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [location.key]);

  const handleStartLearning = () => {
    navigate('/learn');
  };

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (subjectsWithProgress.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-3xl">
            <Sparkles className="h-16 w-16 text-indigo-600" />
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground font-display">Welcome to ShikshanAI!</h2>
        <p className="mt-2 text-center text-muted-foreground max-w-xs">
          Your personalized learning journey starts here. Let's set up your profile.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5"
        >
          Get Started
          <ChevronRight className="h-5 w-5" />
        </button>
      </main>
    );
  }

  const totalProgress = subjectsWithProgress.length > 0 
    ? Math.round(subjectsWithProgress.reduce((acc, s) => acc + s.progress, 0) / subjectsWithProgress.length)
    : 0;

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-2xl font-bold text-foreground font-display">{gradeName || 'Student'}</h1>
          </div>
          
          {/* Streak Badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
            (gamification?.streak || 0) > 0 
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white" 
              : "bg-muted text-muted-foreground"
          )}>
            <Flame className={cn(
              "h-4 w-4",
              (gamification?.streak || 0) > 0 && "animate-streak-fire"
            )} />
            <span className="text-sm font-semibold">{gamification?.streak || 0}</span>
            <span className="text-xs opacity-80">days</span>
          </div>
        </div>
      </header>

      {/* Hero Stats Card */}
      <section className="px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-5 text-white shadow-xl shadow-indigo-500/20">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              {/* XP */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-xl font-bold mt-1">{gamification?.xp || 0}</p>
                <p className="text-xs text-white/70">XP</p>
              </div>
              
              {/* Level */}
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">
                    {gamification?.level || 1}
                  </div>
                </div>
                <p className="text-xl font-bold mt-1">Lv.{gamification?.level || 1}</p>
                <p className="text-xs text-white/70">Level</p>
              </div>
              
              {/* Streak */}
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Flame className="h-4 w-4 text-orange-400" />
                </div>
                <p className="text-xl font-bold mt-1">{gamification?.streak || 0}</p>
                <p className="text-xs text-white/70">Streak</p>
              </div>
              
              {/* Progress */}
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-amber-400" />
                </div>
                <p className="text-xl font-bold mt-1">{totalProgress}%</p>
                <p className="text-xs text-white/70">Progress</p>
              </div>
            </div>

            {/* Level Progress */}
            {gamification && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                  <span>Level {gamification.level}</span>
                  <span>{gamification.xpToNextLevel} XP to Level {gamification.level + 1}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${gamification.levelProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Daily Goal Card */}
      {gamification && (
        <section className="px-4 mt-4">
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-sm">Daily Goal</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {gamification.dailyProgressMinutes}
                </span>
                <span className="text-muted-foreground">/{gamification.dailyGoalMinutes} min</span>
              </div>
              <Progress 
                value={(gamification.dailyProgressMinutes / gamification.dailyGoalMinutes) * 100} 
                className="mt-2 h-2" 
              />
              {gamification.dailyGoalCompleted && (
                <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Goal achieved!
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Today's Mission Card */}
      <section className="px-4 mt-6">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg shadow-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Today's 10 Minutes</h3>
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">10m</span>
            </div>
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Revise today's concepts</p>
                <p className="text-xs text-white/70">{subjectsWithProgress[0]?.name || 'Mathematics'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Practice questions</p>
                <p className="text-xs text-white/70">{subjectsWithProgress[1]?.name || 'Science'}</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleStartLearning}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-indigo-700 rounded-xl py-3 font-semibold hover:bg-white/90 transition-colors"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Learning
          </button>
        </div>
      </section>

      {/* Continue Learning */}
      {subjectsWithProgress.some(s => s.progress > 0) && (
        <section className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Continue Learning</h2>
            <button 
              onClick={() => navigate('/learn')}
              className="text-sm font-medium text-indigo-600 flex items-center gap-1"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {(() => {
            const subjectWithProgress = subjectsWithProgress.find(s => s.progress > 0);
            if (!subjectWithProgress) return null;
            const style = getSubjectStyle(subjectWithProgress.name);
            
            return (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-2xl", style.bg)}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-card-foreground">{subjectWithProgress.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {subjectWithProgress.progress}% complete
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/learn?subject=${subjectWithProgress.id}`)}
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
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
      <section className="px-4 mt-6 pb-4">
        <h2 className="font-semibold text-foreground mb-3">Your Subjects</h2>
        <div className="space-y-3">
          {subjectsWithProgress.map((subject) => {
            const style = getSubjectStyle(subject.name);
            return (
              <div 
                key={subject.id}
                onClick={() => navigate(`/learn?subject=${subject.id}`)}
                className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-indigo-200"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center text-xl", style.bg)}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-card-foreground">{subject.name}</p>
                      <span className={cn("text-sm font-bold", style.text)}>{subject.progress}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{subject.displayText}</p>
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", style.gradient)}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
