import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/device';

interface StudentProfile {
  id: string;
  device_id: string;
  name: string | null;
  grade_id: string | null;
  streak_days: number;
  total_minutes: number;
  last_active_at: string | null;
  user_id: string | null;
  session_count: number;
  avatar: string | null;
}

interface StudentSubject {
  id: string;
  subject_id: string;
}

export function useStudent() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const deviceId = getDeviceId();

  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setIsOnboarded(!!data.grade_id);
        
        // Fetch selected subjects
        const { data: subjectsData } = await supabase
          .from('student_subjects')
          .select('*')
          .eq('student_id', data.id);
        
        setSubjects(subjectsData || []);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const createProfile = async (gradeId: string, subjectIds: string[]) => {
    try {
      // Create or update profile
      const { data: profileData, error: profileError } = await supabase
        .from('student_profiles')
        .upsert({
          device_id: deviceId,
          grade_id: gradeId,
          last_active_at: new Date().toISOString(),
        }, {
          onConflict: 'device_id',
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Clear existing subjects and add new ones
      await supabase
        .from('student_subjects')
        .delete()
        .eq('student_id', profileData.id);

      if (subjectIds.length > 0) {
        const { error: subjectsError } = await supabase
          .from('student_subjects')
          .insert(
            subjectIds.map(subjectId => ({
              student_id: profileData.id,
              subject_id: subjectId,
            }))
          );

        if (subjectsError) throw subjectsError;
      }

      await fetchProfile();
      return { success: true };
    } catch (err) {
      console.error('Error creating profile:', err);
      return { success: false, error: err };
    }
  };

  const updateStreak = async () => {
    if (!profile) return;

    const now = new Date();
    const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : null;
    
    let newStreak = profile.streak_days;
    
    if (lastActive) {
      const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    await supabase
      .from('student_profiles')
      .update({
        streak_days: newStreak,
        last_active_at: now.toISOString(),
      })
      .eq('id', profile.id);

    await fetchProfile();
  };

  return {
    profile,
    subjects,
    loading,
    isOnboarded,
    createProfile,
    updateStreak,
    refetch: fetchProfile,
  };
}
