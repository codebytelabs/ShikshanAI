import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  signInWithGoogle as authSignInWithGoogle,
  sendPhoneOTP as authSendPhoneOTP,
  verifyPhoneOTP as authVerifyPhoneOTP,
  getCurrentUser,
  linkDeviceToUser,
  mergeAnonymousData,
  shouldShowSyncPrompt,
  AuthUser,
} from '@/services/authService';

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPhoneOTP: (phoneNumber: string) => Promise<string>;
  verifyPhoneOTP: (phoneNumber: string, otp: string) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Failed to check session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const newUser = await authSignUp(email, password);
      setUser(newUser);

      // Link device data to new user
      const deviceId = localStorage.getItem('device_id');
      if (deviceId) {
        await linkDeviceToUser(deviceId, newUser.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const authUser = await authSignIn(email, password);
      setUser(authUser);

      // Merge anonymous data with authenticated account
      const deviceId = localStorage.getItem('device_id');
      if (deviceId) {
        await mergeAnonymousData(deviceId, authUser.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      await authSignOut();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await authResetPassword(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      await authSignInWithGoogle();
      // OAuth redirects, so we don't need to handle the response here
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendPhoneOTP = useCallback(async (phoneNumber: string): Promise<string> => {
    setError(null);
    setIsLoading(true);

    try {
      const otp = await authSendPhoneOTP(phoneNumber);
      return otp;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyPhoneOTP = useCallback(async (phoneNumber: string, otp: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const authUser = await authVerifyPhoneOTP(phoneNumber, otp);
      setUser(authUser);

      // Merge anonymous data with authenticated account
      const deviceId = localStorage.getItem('device_id');
      if (deviceId) {
        await mergeAnonymousData(deviceId, authUser.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OTP verification failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle,
    sendPhoneOTP,
    verifyPhoneOTP,
    clearError,
  };
}

/**
 * Hook to check if sync prompt should be shown
 */
export function useSyncPrompt(sessionCount: number, userId: string | null | undefined) {
  return shouldShowSyncPrompt(sessionCount, Boolean(userId));
}
