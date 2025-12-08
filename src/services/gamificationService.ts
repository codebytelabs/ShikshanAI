/**
 * Gamification Service for ShikshanAI
 * Implements XP awards, streak tracking, and gamification data management
 * Requirements: 3.1-3.7, 4.1-4.5
 */

import { supabase } from '@/integrations/supabase/client';
import {
  StudentGamification,
  GamificationData,
  XPReason,
  XP_AWARDS,
  calculateLevel,
  xpToNextLevel,
  levelProgress,
  StudentBadge,
  Badge,
} from './gamification/types';

// Type assertion helper for tables not yet in generated types
// The gamification tables exist in the database but types.ts hasn't been regenerated
const db = supabase as any;

// =============================================
// GAMIFICATION DATA FUNCTIONS
// =============================================

/**
 * Get or create gamification data for a student
 * @param studentId - The student's ID
 * @returns StudentGamification record
 */
export async function getOrCreateGamification(
  studentId: string
): Promise<StudentGamification> {
  // Try to get existing record
  const { data: existing, error: fetchError } = await db
    .from('student_gamification')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (existing && !fetchError) {
    return mapDbToGamification(existing);
  }

  // Create new record if doesn't exist
  const { data: created, error: createError } = await db
    .from('student_gamification')
    .insert({
      student_id: studentId,
      xp: 0,
      level: 1,
      streak: 0,
      daily_goal_minutes: 30,
      daily_progress_minutes: 0,
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create gamification record: ${createError.message}`);
  }

  return mapDbToGamification(created);
}

/**
 * Get comprehensive gamification data for a student
 * Requirement 3.7: Display total XP and current level
 * @param studentId - The student's ID
 * @returns GamificationData with all gamification info
 */
export async function getGamificationData(
  studentId: string
): Promise<GamificationData> {
  const gamification = await getOrCreateGamification(studentId);
  const badges = await getStudentBadges(studentId);

  const dailyGoalCompleted = gamification.dailyGoalCompletedAt !== null &&
    isToday(new Date(gamification.dailyGoalCompletedAt));

  return {
    xp: gamification.xp,
    level: gamification.level,
    streak: gamification.streak,
    lastActivityDate: gamification.lastActivityDate,
    dailyGoalMinutes: gamification.dailyGoalMinutes,
    dailyProgressMinutes: gamification.dailyProgressMinutes,
    dailyGoalCompleted,
    badges,
    xpToNextLevel: xpToNextLevel(gamification.xp),
    levelProgress: levelProgress(gamification.xp),
  };
}

// =============================================
// XP AWARD FUNCTIONS
// =============================================

/**
 * Result of awarding XP, includes level-up info for celebrations
 */
export interface XPAwardResult {
  newXP: number;
  newLevel: number;
  previousLevel: number;
  leveledUp: boolean;
  newBadges: StudentBadge[];
}

/**
 * Award XP points to a student
 * Property 1: XP Award Consistency
 * For any learning activity completion, the XP awarded SHALL match the defined amounts
 * and the student's total XP SHALL increase by exactly that amount.
 * 
 * Requirements: 3.1-3.5
 * @param studentId - The student's ID
 * @param amount - XP amount to award
 * @param reason - Reason for the XP award
 * @returns XPAwardResult with new XP, level, and whether level-up occurred
 */
export async function awardXP(
  studentId: string,
  amount: number,
  reason: XPReason
): Promise<XPAwardResult> {
  if (amount <= 0) {
    throw new Error('XP amount must be positive');
  }

  const gamification = await getOrCreateGamification(studentId);
  const previousLevel = gamification.level;
  const newXP = gamification.xp + amount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > previousLevel;

  // Update gamification record
  const { error: updateError } = await db
    .from('student_gamification')
    .update({
      xp: newXP,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq('student_id', studentId);

  if (updateError) {
    throw new Error(`Failed to update XP: ${updateError.message}`);
  }

  // Record XP transaction
  const { error: transactionError } = await db
    .from('xp_transactions')
    .insert({
      student_id: studentId,
      amount,
      reason,
    });

  if (transactionError) {
    console.error('Failed to record XP transaction:', transactionError);
    // Don't throw - transaction logging is not critical
  }

  // Check for new badges based on XP milestone
  let newBadges: StudentBadge[] = [];
  try {
    newBadges = await checkBadges(studentId, { xp: newXP });
  } catch (badgeError) {
    console.error('Failed to check badges:', badgeError);
    // Don't throw - badge checking is not critical
  }

  return { newXP, newLevel, previousLevel, leveledUp, newBadges };
}

/**
 * Award XP for completing a concept section
 * Requirement 3.1: Award 10 XP for section completion
 */
export async function awardSectionXP(studentId: string): Promise<XPAwardResult> {
  return awardXP(studentId, XP_AWARDS.SECTION_COMPLETE, 'section_complete');
}

/**
 * Award XP for answering a question correctly
 * Requirement 3.2: Award 5 XP for correct answer
 * Requirement 3.3: Award 10 XP for first-try correct (bonus)
 */
export async function awardQuestionXP(
  studentId: string,
  isFirstTry: boolean
): Promise<XPAwardResult> {
  const amount = isFirstTry ? XP_AWARDS.QUESTION_FIRST_TRY : XP_AWARDS.QUESTION_CORRECT;
  const reason: XPReason = isFirstTry ? 'question_first_try' : 'question_correct';
  return awardXP(studentId, amount, reason);
}

/**
 * Award XP for completing a topic
 * Requirement 3.4: Award 50 XP bonus for topic completion
 */
export async function awardTopicXP(studentId: string): Promise<XPAwardResult> {
  return awardXP(studentId, XP_AWARDS.TOPIC_COMPLETE, 'topic_complete');
}

/**
 * Award XP for completing a chapter
 * Requirement 3.5: Award 200 XP bonus for chapter completion
 */
export async function awardChapterXP(studentId: string): Promise<XPAwardResult> {
  return awardXP(studentId, XP_AWARDS.CHAPTER_COMPLETE, 'chapter_complete');
}

// =============================================
// STREAK FUNCTIONS
// =============================================

/**
 * Update student's streak based on activity
 * Property 2: Streak Increment Logic
 * If last activity was yesterday, increment streak by 1
 * If last activity was today, keep streak unchanged
 * If last activity was more than 1 day ago, reset to 1
 * 
 * Property 3: Streak Reset on Miss
 * If last activity date is more than 1 day before current date,
 * streak SHALL be set to 1 (not incremented)
 * 
 * Requirements: 4.1, 4.2
 * @param studentId - The student's ID
 * @returns Updated streak count
 */
export async function updateStreak(studentId: string): Promise<number> {
  const gamification = await getOrCreateGamification(studentId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak: number;
  const lastActivity = gamification.lastActivityDate
    ? new Date(gamification.lastActivityDate)
    : null;

  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day - no change to streak
      newStreak = gamification.streak;
    } else if (daysDiff === 1) {
      // Yesterday - increment streak
      newStreak = gamification.streak + 1;
    } else {
      // More than 1 day gap - reset to 1
      newStreak = 1;
    }
  } else {
    // First activity ever
    newStreak = 1;
  }

  // Update the record
  const { error } = await db
    .from('student_gamification')
    .update({
      streak: newStreak,
      last_activity_date: today.toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('student_id', studentId);

  if (error) {
    throw new Error(`Failed to update streak: ${error.message}`);
  }

  // Check for streak milestone badges
  await checkStreakMilestones(studentId, newStreak);

  return newStreak;
}

/**
 * Check if student's streak is at risk (no activity today)
 * Requirement 4.4: Display reminder when about to lose streak
 * @param studentId - The student's ID
 * @returns Object with streak status
 */
export async function checkStreakStatus(studentId: string): Promise<{
  streak: number;
  isAtRisk: boolean;
  lastActivityDate: string | null;
}> {
  const gamification = await getOrCreateGamification(studentId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let isAtRisk = false;

  if (gamification.lastActivityDate && gamification.streak > 0) {
    const lastActivity = new Date(gamification.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    // At risk if last activity was yesterday (need to act today to maintain)
    // or if it's been more than a day (streak will reset on next activity)
    isAtRisk = daysDiff >= 1;
  }

  return {
    streak: gamification.streak,
    isAtRisk,
    lastActivityDate: gamification.lastActivityDate,
  };
}

/**
 * Check and award streak milestone bonuses
 * Requirement 4.5: Award bonus XP at streak milestones (7, 30, 100 days)
 */
async function checkStreakMilestones(
  studentId: string,
  streak: number
): Promise<void> {
  const milestones = [
    { days: 7, xp: XP_AWARDS.STREAK_MILESTONE_7 },
    { days: 30, xp: XP_AWARDS.STREAK_MILESTONE_30 },
    { days: 100, xp: XP_AWARDS.STREAK_MILESTONE_100 },
  ];

  for (const milestone of milestones) {
    if (streak === milestone.days) {
      await awardXP(studentId, milestone.xp, 'streak_milestone');
    }
  }
}

/**
 * Recalculate streak from actual XP transaction history
 * This fixes any incorrect streak values by looking at actual activity dates
 * @param studentId - The student's ID
 * @returns Corrected streak count
 */
export async function recalculateStreakFromHistory(studentId: string): Promise<number> {
  // Get all XP transactions ordered by date
  const { data: transactions, error } = await db
    .from('xp_transactions')
    .select('created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error || !transactions || transactions.length === 0) {
    // No activity - reset streak to 0
    await db
      .from('student_gamification')
      .update({ streak: 0, last_activity_date: null })
      .eq('student_id', studentId);
    return 0;
  }

  // Get unique activity dates (in local timezone)
  const activityDates = new Set<string>();
  for (const tx of transactions) {
    const date = new Date(tx.created_at);
    const dateStr = date.toISOString().split('T')[0];
    activityDates.add(dateStr);
  }

  // Sort dates in descending order
  const sortedDates = Array.from(activityDates).sort().reverse();
  
  // Calculate streak by counting consecutive days from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  let streak = 0;
  let checkDate = new Date(today);
  
  // Check if there's activity today or yesterday to start counting
  const mostRecentActivity = sortedDates[0];
  const mostRecentDate = new Date(mostRecentActivity);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  const daysSinceLastActivity = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // If last activity was more than 1 day ago, streak is broken
  if (daysSinceLastActivity > 1) {
    await db
      .from('student_gamification')
      .update({ 
        streak: 0, 
        last_activity_date: mostRecentActivity,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId);
    return 0;
  }
  
  // Start counting from the most recent activity date
  checkDate = new Date(mostRecentDate);
  
  for (const dateStr of sortedDates) {
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (dateStr === checkDateStr) {
      streak++;
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < checkDateStr) {
      // Gap in dates - streak is broken
      break;
    }
  }

  // Update the gamification record with corrected streak
  await db
    .from('student_gamification')
    .update({ 
      streak, 
      last_activity_date: mostRecentActivity,
      updated_at: new Date().toISOString()
    })
    .eq('student_id', studentId);

  return streak;
}

// =============================================
// BADGE FUNCTIONS
// =============================================

/**
 * Get all badges a student has earned
 * Requirement 5.6: Show all earned badges in collection
 * @param studentId - The student's ID
 * @returns Array of earned badges with badge details
 */
export async function getStudentBadges(studentId: string): Promise<StudentBadge[]> {
  const { data, error } = await db
    .from('student_badges')
    .select(`
      id,
      student_id,
      badge_id,
      earned_at,
      badges (
        id,
        name,
        description,
        icon,
        criteria_type,
        criteria_value,
        created_at
      )
    `)
    .eq('student_id', studentId);

  if (error) {
    console.error('Failed to fetch student badges:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    studentId: row.student_id,
    badgeId: row.badge_id,
    earnedAt: row.earned_at,
    badge: row.badges ? {
      id: row.badges.id,
      name: row.badges.name,
      description: row.badges.description,
      icon: row.badges.icon,
      criteriaType: row.badges.criteria_type,
      criteriaValue: row.badges.criteria_value,
      createdAt: row.badges.created_at,
    } : undefined,
  }));
}

/**
 * Get all available badges
 * @returns Array of all badge definitions
 */
export async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await db
    .from('badges')
    .select('*')
    .order('criteria_value', { ascending: true });

  if (error) {
    console.error('Failed to fetch badges:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    criteriaType: row.criteria_type,
    criteriaValue: row.criteria_value,
    createdAt: row.created_at,
  }));
}

/**
 * Award a badge to a student
 * Requirement 5.5: Display celebratory animation when badge earned
 * @param studentId - The student's ID
 * @param badgeId - The badge ID to award
 * @returns The awarded badge or null if already earned
 */
export async function awardBadge(
  studentId: string,
  badgeId: string
): Promise<StudentBadge | null> {
  // Check if already earned
  const { data: existing } = await db
    .from('student_badges')
    .select('id')
    .eq('student_id', studentId)
    .eq('badge_id', badgeId)
    .single();

  if (existing) {
    return null; // Already earned
  }

  // Award the badge
  const { data, error } = await db
    .from('student_badges')
    .insert({
      student_id: studentId,
      badge_id: badgeId,
    })
    .select(`
      id,
      student_id,
      badge_id,
      earned_at,
      badges (
        id,
        name,
        description,
        icon,
        criteria_type,
        criteria_value,
        created_at
      )
    `)
    .single();

  if (error) {
    console.error('Failed to award badge:', error);
    return null;
  }

  return {
    id: data.id,
    studentId: data.student_id,
    badgeId: data.badge_id,
    earnedAt: data.earned_at,
    badge: data.badges ? {
      id: (data.badges as any).id,
      name: (data.badges as any).name,
      description: (data.badges as any).description,
      icon: (data.badges as any).icon,
      criteriaType: (data.badges as any).criteria_type,
      criteriaValue: (data.badges as any).criteria_value,
      createdAt: (data.badges as any).created_at,
    } : undefined,
  };
}

/**
 * Check and award badges based on current stats
 * Property 4: Badge Award Criteria
 * A student SHALL receive a badge if and only if they meet or exceed the criteria value
 * 
 * Requirements: 5.1-5.4
 * @param studentId - The student's ID
 * @param stats - Current student stats for badge checking
 * @returns Array of newly awarded badges
 */
export async function checkBadges(
  studentId: string,
  stats: {
    xp?: number;
    streak?: number;
    topicsCompleted?: number;
    chapterMastery?: number;
  }
): Promise<StudentBadge[]> {
  const allBadges = await getAllBadges();
  const earnedBadges = await getStudentBadges(studentId);
  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));

  const newlyAwarded: StudentBadge[] = [];

  for (const badge of allBadges) {
    // Skip if already earned
    if (earnedBadgeIds.has(badge.id)) {
      continue;
    }

    let shouldAward = false;

    switch (badge.criteriaType) {
      case 'xp':
        // Requirement 5.4: Award when XP threshold reached
        if (stats.xp !== undefined && stats.xp >= badge.criteriaValue) {
          shouldAward = true;
        }
        break;

      case 'streak':
        // Requirement 5.2: Award when streak milestone reached
        if (stats.streak !== undefined && stats.streak >= badge.criteriaValue) {
          shouldAward = true;
        }
        break;

      case 'completion':
        // Award when topics completed threshold reached
        if (stats.topicsCompleted !== undefined && stats.topicsCompleted >= badge.criteriaValue) {
          shouldAward = true;
        }
        break;

      case 'mastery':
        // Requirement 5.3: Award when chapter mastery threshold reached
        if (stats.chapterMastery !== undefined && stats.chapterMastery >= badge.criteriaValue) {
          shouldAward = true;
        }
        break;

      case 'first_topic':
        // Requirement 5.1: Award when first topic completed
        if (stats.topicsCompleted !== undefined && stats.topicsCompleted >= badge.criteriaValue) {
          shouldAward = true;
        }
        break;
    }

    if (shouldAward) {
      const awarded = await awardBadge(studentId, badge.id);
      if (awarded) {
        newlyAwarded.push(awarded);
      }
    }
  }

  return newlyAwarded;
}

// =============================================
// DAILY GOAL FUNCTIONS
// =============================================

/**
 * Update daily progress and check goal completion
 * Requirement 8.2, 8.3: Track progress and award bonus on completion
 * @param studentId - The student's ID
 * @param minutesSpent - Minutes spent learning
 * @returns Updated progress info
 */
export async function updateDailyProgress(
  studentId: string,
  minutesSpent: number
): Promise<{
  dailyProgressMinutes: number;
  dailyGoalMinutes: number;
  goalCompleted: boolean;
  bonusAwarded: boolean;
}> {
  const gamification = await getOrCreateGamification(studentId);
  
  // Reset progress if it's a new day
  let currentProgress = gamification.dailyProgressMinutes;
  const goalCompletedToday = gamification.dailyGoalCompletedAt !== null &&
    isToday(new Date(gamification.dailyGoalCompletedAt));

  if (!isToday(new Date(gamification.updatedAt))) {
    currentProgress = 0;
  }

  const newProgress = currentProgress + minutesSpent;
  const goalCompleted = newProgress >= gamification.dailyGoalMinutes;
  let bonusAwarded = false;

  const updates: any = {
    daily_progress_minutes: newProgress,
    updated_at: new Date().toISOString(),
  };

  // Award bonus XP if goal completed for first time today
  if (goalCompleted && !goalCompletedToday) {
    updates.daily_goal_completed_at = new Date().toISOString();
    await awardXP(studentId, XP_AWARDS.DAILY_GOAL_COMPLETE, 'daily_goal_complete');
    bonusAwarded = true;
  }

  const { error: progressError } = await db
    .from('student_gamification')
    .update(updates)
    .eq('student_id', studentId);

  if (progressError) {
    throw new Error(`Failed to update daily progress: ${progressError.message}`);
  }

  return {
    dailyProgressMinutes: newProgress,
    dailyGoalMinutes: gamification.dailyGoalMinutes,
    goalCompleted,
    bonusAwarded,
  };
}

/**
 * Set daily goal for a student
 * Requirement 8.1: Allow setting daily goal (15, 30, or 60 minutes)
 */
export async function setDailyGoal(
  studentId: string,
  minutes: 15 | 30 | 60
): Promise<void> {
  const { error: goalError } = await db
    .from('student_gamification')
    .update({
      daily_goal_minutes: minutes,
      updated_at: new Date().toISOString(),
    })
    .eq('student_id', studentId);

  if (goalError) {
    throw new Error(`Failed to set daily goal: ${goalError.message}`);
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Map database row to StudentGamification interface
 */
function mapDbToGamification(row: any): StudentGamification {
  return {
    id: row.id,
    studentId: row.student_id,
    xp: row.xp,
    level: row.level,
    streak: row.streak,
    lastActivityDate: row.last_activity_date,
    dailyGoalMinutes: row.daily_goal_minutes,
    dailyProgressMinutes: row.daily_progress_minutes,
    dailyGoalCompletedAt: row.daily_goal_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Re-export types and utilities from types module
export { calculateLevel, xpToNextLevel, levelProgress } from './gamification/types';
export type { StudentGamification, GamificationData, Badge, StudentBadge, XPReason } from './gamification/types';
