import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | undefined;
  phone?: string | null;
}

/**
 * Sign up a new user with email and password
 * Requirements: 4.2
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(`Sign up failed: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('Sign up failed: No user returned');
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

/**
 * Sign in an existing user with email and password
 * Requirements: 4.2
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Sign in failed: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('Sign in failed: No user returned');
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

/**
 * Sign out the current user
 * Requirements: 4.6
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    throw new Error(`Google sign in failed: ${error.message}`);
  }
}

/**
 * Send OTP to phone number using Twilio
 */
export async function sendPhoneOTP(phoneNumber: string): Promise<string> {
  const { sendSMSOTP } = await import('./smsService');
  const { generateAndStoreOTP } = await import('./otpService');

  const otp = generateAndStoreOTP(phoneNumber);
  await sendSMSOTP(phoneNumber, otp);
  
  return otp; // Return for development/testing purposes
}

/**
 * Verify phone OTP and sign in/up user
 */
export async function verifyPhoneOTP(phoneNumber: string, otp: string): Promise<AuthUser> {
  const { verifyOTP } = await import('./otpService');
  
  const verification = verifyOTP(phoneNumber, otp);
  if (!verification.success) {
    throw new Error(verification.message);
  }

  // Format phone for Supabase
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : 
    phoneNumber.length === 10 ? `+91${phoneNumber}` : `+${phoneNumber}`;

  // Try to sign in with phone - Supabase will create user if doesn't exist
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: true,
    }
  });

  // Since we already verified OTP ourselves, we need to handle this differently
  // We'll create/get user via a workaround using email-like identifier
  const phoneEmail = `${phoneNumber.replace(/\D/g, '')}@phone.shikshanai.local`;
  
  // Try to sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: phoneEmail,
    password: phoneNumber.replace(/\D/g, ''), // Use phone as password (simplified)
  });

  if (signInData?.user) {
    return {
      id: signInData.user.id,
      email: signInData.user.email,
      phone: formattedPhone,
    };
  }

  // If sign in failed, create new user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: phoneEmail,
    password: phoneNumber.replace(/\D/g, ''),
    options: {
      data: {
        phone: formattedPhone,
      }
    }
  });

  if (signUpError) {
    throw new Error(`Phone authentication failed: ${signUpError.message}`);
  }

  if (!signUpData.user) {
    throw new Error('Failed to create user account');
  }

  return {
    id: signUpData.user.id,
    email: signUpData.user.email,
    phone: formattedPhone,
  };
}

/**
 * Get the currently authenticated user
 * Requirements: 4.1
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

/**
 * Link a device's student profile to an authenticated user
 * Requirements: 4.2
 */
export async function linkDeviceToUser(
  deviceId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('student_profiles')
    .update({ user_id: userId })
    .eq('device_id', deviceId);

  if (error) {
    throw new Error(`Failed to link device to user: ${error.message}`);
  }
}

/**
 * Get student profile by user ID
 * Requirements: 4.3
 */
export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get profile: ${error.message}`);
  }

  return data;
}

/**
 * Increment session count for a student profile
 * Requirements: 4.4
 */
export async function incrementSessionCount(studentId: string): Promise<number> {
  // First get current count
  const { data: profile, error: fetchError } = await supabase
    .from('student_profiles')
    .select('session_count')
    .eq('id', studentId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch session count: ${fetchError.message}`);
  }

  const newCount = (profile?.session_count ?? 0) + 1;

  // Update the count
  const { error: updateError } = await supabase
    .from('student_profiles')
    .update({ session_count: newCount })
    .eq('id', studentId);

  if (updateError) {
    throw new Error(`Failed to increment session count: ${updateError.message}`);
  }

  return newCount;
}


/**
 * Check if user should be prompted to sign up
 * Requirements: 4.4
 */
export function shouldShowSyncPrompt(
  sessionCount: number,
  hasUserId: boolean
): boolean {
  return sessionCount >= 3 && !hasUserId;
}

/**
 * Merge anonymous data with authenticated account
 * Uses timestamp-based conflict resolution
 * Requirements: 4.7
 */
export async function mergeAnonymousData(
  deviceId: string,
  userId: string
): Promise<void> {
  // Get the anonymous profile
  const { data: anonProfile, error: anonError } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('device_id', deviceId)
    .is('user_id', null)
    .single();

  if (anonError && anonError.code !== 'PGRST116') {
    throw new Error(`Failed to get anonymous profile: ${anonError.message}`);
  }

  if (!anonProfile) {
    // No anonymous data to merge
    return;
  }

  // Get the authenticated profile
  const { data: authProfile, error: authError } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (authError && authError.code !== 'PGRST116') {
    throw new Error(`Failed to get authenticated profile: ${authError.message}`);
  }

  if (!authProfile) {
    // No authenticated profile exists, just link the anonymous one
    await linkDeviceToUser(deviceId, userId);
    return;
  }

  // Merge progress data - use most recent for each topic
  const { data: anonProgress } = await supabase
    .from('student_topic_progress')
    .select('*')
    .eq('student_id', anonProfile.id);

  const { data: authProgress } = await supabase
    .from('student_topic_progress')
    .select('*')
    .eq('student_id', authProfile.id);

  if (anonProgress && anonProgress.length > 0) {
    const authProgressMap = new Map(
      (authProgress ?? []).map((p) => [p.topic_id, p])
    );

    for (const anonP of anonProgress) {
      const authP = authProgressMap.get(anonP.topic_id);

      if (!authP) {
        // Topic not in auth profile, copy it over
        await supabase.from('student_topic_progress').insert({
          student_id: authProfile.id,
          topic_id: anonP.topic_id,
          mastery: anonP.mastery,
          attempts: anonP.attempts,
          correct_count: anonP.correct_count,
          last_studied_at: anonP.last_studied_at,
          completed_at: anonP.completed_at,
          score: anonP.score,
        });
      } else {
        // Both have progress, use most recent
        const anonTime = anonP.updated_at ? new Date(anonP.updated_at).getTime() : 0;
        const authTime = authP.updated_at ? new Date(authP.updated_at).getTime() : 0;

        if (anonTime > authTime) {
          await supabase
            .from('student_topic_progress')
            .update({
              mastery: anonP.mastery,
              attempts: anonP.attempts,
              correct_count: anonP.correct_count,
              last_studied_at: anonP.last_studied_at,
              completed_at: anonP.completed_at,
              score: anonP.score,
            })
            .eq('id', authP.id);
        }
      }
    }
  }

  // Delete the anonymous profile (cascades to progress)
  await supabase
    .from('student_profiles')
    .delete()
    .eq('id', anonProfile.id);
}

/**
 * Pure function to determine which progress record is more recent
 * For testing - Requirements: 4.7
 */
export function getMostRecentProgress<T extends { updated_at?: string | null }>(
  progress1: T,
  progress2: T
): T {
  const time1 = progress1.updated_at ? new Date(progress1.updated_at).getTime() : 0;
  const time2 = progress2.updated_at ? new Date(progress2.updated_at).getTime() : 0;

  return time1 >= time2 ? progress1 : progress2;
}

/**
 * Pure function to check if profile has linked user
 * For testing - Requirements: 4.5
 */
export function isProfileLinked(userId: string | null | undefined): boolean {
  return userId !== null && userId !== undefined && userId.length > 0;
}
