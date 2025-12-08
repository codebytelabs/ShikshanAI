import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { useAuth } from '@/hooks/useAuth';
import { incrementSessionCount } from '@/services/authService';

interface StudentContextType {
  profile: ReturnType<typeof useStudent>['profile'];
  subjects: ReturnType<typeof useStudent>['subjects'];
  loading: boolean;
  isOnboarded: boolean;
  createProfile: ReturnType<typeof useStudent>['createProfile'];
  updateStreak: ReturnType<typeof useStudent>['updateStreak'];
  refetch: ReturnType<typeof useStudent>['refetch'];
  authUser: ReturnType<typeof useAuth>['user'];
  isAuthenticated: boolean;
}

const StudentContext = createContext<StudentContextType | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const student = useStudent();
  const { user } = useAuth();

  // Increment session count on app load
  useEffect(() => {
    async function trackSession() {
      if (student.profile?.id) {
        try {
          await incrementSessionCount(student.profile.id);
          // Refetch to get updated session count
          student.refetch();
        } catch (error) {
          console.error('Failed to increment session count:', error);
        }
      }
    }

    // Only track once per app load
    const hasTracked = sessionStorage.getItem('session_tracked');
    if (!hasTracked && student.profile?.id) {
      trackSession();
      sessionStorage.setItem('session_tracked', 'true');
    }
  }, [student.profile?.id]);

  // Refetch profile when auth state changes
  useEffect(() => {
    if (user) {
      student.refetch();
    }
  }, [user?.id]);

  const isAuthenticated = Boolean(user || student.profile?.user_id);

  return (
    <StudentContext.Provider value={{ ...student, authUser: user, isAuthenticated }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudentContext() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within a StudentProvider');
  }
  return context;
}
