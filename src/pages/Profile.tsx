import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStudentContext } from '@/contexts/StudentContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StorageManager } from '@/components/pwa/StorageManager';
import { getSubjectProgress, resetProgress } from '@/services/progressService';
import { getGamificationData, getAllBadges, GamificationData, recalculateStreakFromHistory } from '@/services/gamificationService';
import { BadgeCollection } from '@/components/gamification';
import { useAuth, useSyncPrompt } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';
import { SyncPrompt } from '@/components/auth/SyncPrompt';
import type { Badge } from '@/services/gamification/types';
import { cn } from '@/lib/utils';
import { 
  User, Flame, BookOpen, Settings, Bell, RefreshCw, Loader2, 
  LogOut, Cloud, CloudOff, Star, Trophy, ChevronRight, Sparkles
} from 'lucide-react';

interface SubjectProgress {
  id: string;
  name: string;
  icon: string | null;
  progress: number;
}

const subjectStyles: Record<string, { bg: string; gradient: string; icon: string }> = {
  'Mathematics': { bg: 'bg-violet-100', gradient: 'from-violet-500 to-purple-600', icon: '📐' },
  'Science': { bg: 'bg-cyan-100', gradient: 'from-cyan-500 to-teal-600', icon: '🔬' },
  'English': { bg: 'bg-pink-100', gradient: 'from-pink-500 to-rose-600', icon: '📚' },
  'Social Science': { bg: 'bg-orange-100', gradient: 'from-orange-500 to-amber-600', icon: '🌍' },
};

const getSubjectStyle = (name: string) => {
  return subjectStyles[name] || { bg: 'bg-indigo-100', gradient: 'from-indigo-500 to-purple-600', icon: '📖' };
};

export default function Profile() {
  const navigate = useNavigate();
  const { profile, subjects: studentSubjects, loading: profileLoading } = useStudentContext();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [gradeName, setGradeName] = useState('');
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [syncPromptDismissed, setSyncPromptDismissed] = useState(false);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);

  const shouldShowSyncPrompt = useSyncPrompt(profile?.session_count ?? 0, profile?.user_id);

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
      
      if (gradeData) setGradeName(gradeData.name);

      const subjectIds = studentSubjects.map(s => s.subject_id);
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name, icon')
        .in('id', subjectIds);

      if (subjectsData && profile) {
        const progressPromises = subjectsData.map(async (s) => {
          const progress = await getSubjectProgress(profile.id, s.id);
          return { ...s, progress: progress.percentage };
        });
        const progressData = await Promise.all(progressPromises);
        setSubjectsProgress(progressData);
      }

      if (profile) {
        try {
          await recalculateStreakFromHistory(profile.id);
          const [gamificationData, badges] = await Promise.all([
            getGamificationData(profile.id),
            getAllBadges(),
          ]);
          setGamification(gamificationData);
          setAllBadges(badges);
        } catch (error) {
          console.error('Failed to fetch gamification data:', error);
        }
      }

      setLoading(false);
    }

    if (!profileLoading) fetchData();
  }, [profile, studentSubjects, profileLoading]);

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  const totalProgress = subjectsProgress.length > 0
    ? Math.round(subjectsProgress.reduce((acc, s) => acc + s.progress, 0) / subjectsProgress.length)
    : 0;

  const isAuthenticated = Boolean(user || profile?.user_id);
  const earnedBadgesCount = gamification?.badges?.length || 0;

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-4 pt-8 pb-16 text-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30">
              <User className="h-10 w-10 text-white" />
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-lg">
              {gamification?.level || 1}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display">{profile?.name || 'Student'}</h1>
            <p className="text-white/80 text-sm">{gradeName} • CBSE</p>
            <div className="flex items-center gap-1 mt-1">
              {isAuthenticated ? (
                <>
                  <Cloud className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-xs text-emerald-300">Synced to cloud</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-3.5 w-3.5 text-white/60" />
                  <span className="text-xs text-white/60">Local only</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Overlapping */}
      <div className="px-4 -mt-10">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Star, value: gamification?.xp || 0, label: 'XP', color: 'text-amber-500', fill: 'fill-amber-500' },
            { icon: Trophy, value: `Lv.${gamification?.level || 1}`, label: 'Level', color: 'text-purple-500' },
            { icon: Flame, value: gamification?.streak || 0, label: 'Streak', color: 'text-orange-500', fill: 'fill-orange-500' },
            { icon: BookOpen, value: `${totalProgress}%`, label: 'Progress', color: 'text-indigo-500' },
          ].map((stat, idx) => (
            <div key={idx} className="rounded-xl bg-card border border-border p-3 text-center shadow-sm">
              <stat.icon className={cn("mx-auto h-5 w-5", stat.color, stat.fill)} />
              <p className="mt-1 text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Prompt */}
      {shouldShowSyncPrompt && !syncPromptDismissed && !isAuthenticated && (
        <div className="px-4 mt-4">
          <SyncPrompt onDismiss={() => setSyncPromptDismissed(true)} />
        </div>
      )}

      {/* Auth Card */}
      {!isAuthenticated ? (
        <div className="px-4 mt-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Cloud className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Sign in to sync</p>
                <p className="text-xs text-muted-foreground">Access progress from any device</p>
              </div>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      ) : user && (
        <div className="px-4 mt-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-800">Signed in</p>
                <p className="text-xs text-emerald-600">{user.email}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={signOut}
                disabled={authLoading}
                className="rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Badges Section */}
      {allBadges.length > 0 && (
        <section className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" /> Achievements
            </h2>
            <span className="text-sm text-muted-foreground">{earnedBadgesCount}/{allBadges.length} earned</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <BadgeCollection earnedBadges={gamification?.badges || []} allBadges={allBadges} />
          </div>
        </section>
      )}

      {/* Subject Progress */}
      <section className="px-4 mt-6">
        <h2 className="font-semibold text-foreground mb-3">Subject Progress</h2>
        <div className="space-y-3">
          {subjectsProgress.map((subject) => {
            const style = getSubjectStyle(subject.name);
            return (
              <div key={subject.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-lg", style.bg)}>
                    {style.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{subject.name}</span>
                      <span className="text-sm font-bold text-indigo-600">{subject.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", style.gradient)}
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Offline Storage */}
      <section className="px-4 mt-6">
        <StorageManager />
      </section>

      {/* Settings */}
      <section className="px-4 mt-6">
        <h2 className="font-semibold text-foreground mb-3">Settings</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <button className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b border-border">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Reminders</p>
              <p className="text-xs text-muted-foreground">Set daily study reminders</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <button 
            onClick={() => navigate('/onboarding')}
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Settings className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Change Class/Subjects</p>
              <p className="text-xs text-muted-foreground">Update your preferences</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </section>

      {/* Reset Button */}
      <div className="px-4 mt-6">
        <Button 
          variant="outline" 
          className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" 
          onClick={async () => {
            if (profile) {
              await resetProgress(profile.id);
              setSubjectsProgress(prev => prev.map(s => ({ ...s, progress: 0 })));
            }
            navigate('/onboarding');
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Profile
        </Button>
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </main>
  );
}
