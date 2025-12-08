import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStudentContext } from '@/contexts/StudentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  User, 
  Flame, 
  Clock, 
  BookOpen, 
  Settings, 
  Bell,
  RefreshCw,
  Loader2,
  LogOut,
  Cloud,
  CloudOff,
  Star
} from 'lucide-react';

interface SubjectProgress {
  id: string;
  name: string;
  icon: string | null;
  progress: number;
}

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

  const shouldShowSyncPrompt = useSyncPrompt(
    profile?.session_count ?? 0,
    profile?.user_id
  );

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

      // Get subjects
      const subjectIds = studentSubjects.map(s => s.subject_id);
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name, icon')
        .in('id', subjectIds);

      if (subjectsData && profile) {
        // Fetch real progress for each subject
        const progressPromises = subjectsData.map(async (s) => {
          const progress = await getSubjectProgress(profile.id, s.id);
          return {
            ...s,
            progress: progress.percentage,
          };
        });
        
        const progressData = await Promise.all(progressPromises);
        setSubjectsProgress(progressData);
      }

      // Fetch gamification data
      if (profile) {
        try {
          // Recalculate streak from actual activity history to fix any incorrect values
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

    if (!profileLoading) {
      fetchData();
    }
  }, [profile, studentSubjects, profileLoading]);

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalProgress = subjectsProgress.length > 0
    ? Math.round(subjectsProgress.reduce((acc, s) => acc + s.progress, 0) / subjectsProgress.length)
    : 0;

  const isAuthenticated = Boolean(user || profile?.user_id);

  return (
    <main className="px-4 pt-6 pb-4">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{profile?.name || 'Student'}</h1>
          <p className="text-sm text-muted-foreground">
            {gradeName} • CBSE
          </p>
          {/* Sync Status Indicator */}
          <div className="flex items-center gap-1 mt-1">
            {isAuthenticated ? (
              <>
                <Cloud className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary">Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Local only</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sync Prompt for Anonymous Users */}
      {shouldShowSyncPrompt && !syncPromptDismissed && !isAuthenticated && (
        <div className="mt-4">
          <SyncPrompt onDismiss={() => setSyncPromptDismissed(true)} />
        </div>
      )}

      {/* Auth Section */}
      {!isAuthenticated && (
        <Card className="mt-4">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Cloud className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-card-foreground">Sign in to sync</p>
                <p className="text-xs text-muted-foreground">
                  Access your progress from any device
                </p>
              </div>
              <Button size="sm" onClick={() => setShowAuthModal(true)}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authenticated User Info */}
      {isAuthenticated && user && (
        <Card className="mt-4">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Cloud className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-card-foreground">Signed in</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={signOut}
                disabled={authLoading}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        <Card className="text-center">
          <CardContent className="pt-3 pb-2">
            <Star className="mx-auto h-5 w-5 text-yellow-500 fill-yellow-500" />
            <p className="mt-1 text-xl font-bold text-card-foreground">{gamification?.xp || 0}</p>
            <p className="text-xs text-muted-foreground">XP</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-3 pb-2">
            <div className="mx-auto h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {gamification?.level || 1}
            </div>
            <p className="mt-1 text-xl font-bold text-card-foreground">Lv.{gamification?.level || 1}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-3 pb-2">
            <Flame className="mx-auto h-5 w-5 text-orange-500 fill-orange-500" />
            <p className="mt-1 text-xl font-bold text-card-foreground">{gamification?.streak || profile?.streak_days || 0}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-3 pb-2">
            <BookOpen className="mx-auto h-5 w-5 text-chart-4" />
            <p className="mt-1 text-xl font-bold text-card-foreground">{totalProgress}%</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {allBadges.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeCollection
              earnedBadges={gamification?.badges || []}
              allBadges={allBadges}
            />
          </CardContent>
        </Card>
      )}

      {/* Subject Progress */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Subject Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjectsProgress.map((subject) => (
            <div key={subject.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{subject.icon || '📚'}</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {subject.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">{subject.progress}%</span>
              </div>
              <Progress value={subject.progress} className="mt-2 h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Offline Storage */}
      <div className="mt-6">
        <StorageManager />
      </div>

      {/* Settings */}
      <Card className="mt-6">
        <CardContent className="divide-y divide-border py-2">
          <button className="flex w-full items-center gap-3 py-3 text-left">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-card-foreground">Reminders</p>
              <p className="text-xs text-muted-foreground">Set daily study reminders</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/onboarding')}
            className="flex w-full items-center gap-3 py-3 text-left"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-card-foreground">Change Class/Subjects</p>
              <p className="text-xs text-muted-foreground">Update your preferences</p>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Reset */}
      <Button 
        variant="outline" 
        className="mt-6 w-full" 
        onClick={async () => {
          if (profile) {
            await resetProgress(profile.id);
            setSubjectsProgress(prev => prev.map(s => ({ ...s, progress: 0 })));
          }
          navigate('/onboarding');
        }}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Reset Profile
      </Button>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </main>
  );
}
