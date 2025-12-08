/**
 * Gamification Types for ShikshanAI Learning Experience
 * Based on design.md specifications
 * Requirements: 3.1, 5.1
 */

// =============================================
// XP CONSTANTS
// =============================================

export const XP_AWARDS = {
  SECTION_COMPLETE: 10,      // Requirement 3.1: Complete a concept section
  QUESTION_CORRECT: 5,       // Requirement 3.2: Answer practice question correctly
  QUESTION_FIRST_TRY: 10,    // Requirement 3.3: Correct on first attempt (bonus)
  TOPIC_COMPLETE: 50,        // Requirement 3.4: Complete a topic
  CHAPTER_COMPLETE: 200,     // Requirement 3.5: Complete a chapter
  DAILY_GOAL_COMPLETE: 25,   // Requirement 8.3: Complete daily goal
  STREAK_MILESTONE_7: 50,    // Requirement 4.5: 7-day streak bonus
  STREAK_MILESTONE_30: 200,  // Requirement 4.5: 30-day streak bonus
  STREAK_MILESTONE_100: 500, // Requirement 4.5: 100-day streak bonus
} as const;

// =============================================
// LEVEL CALCULATION
// =============================================

/**
 * XP thresholds for each level
 * Level 1: 0 XP
 * Level 2: 100 XP
 * Level 3: 250 XP
 * Level 4: 500 XP
 * Level 5: 1000 XP
 * And so on with increasing gaps
 */
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  1750,   // Level 6
  2750,   // Level 7
  4000,   // Level 8
  5500,   // Level 9
  7500,   // Level 10
  10000,  // Level 11
  13000,  // Level 12
  16500,  // Level 13
  20500,  // Level 14
  25000,  // Level 15
] as const;

// =============================================
// GAMIFICATION INTERFACES
// =============================================

export interface StudentGamification {
  id: string;
  studentId: string;
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: string | null;
  dailyGoalMinutes: number;
  dailyProgressMinutes: number;
  dailyGoalCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteriaType: BadgeCriteriaType;
  criteriaValue: number;
  createdAt: string;
}

export type BadgeCriteriaType = 
  | 'xp' 
  | 'streak' 
  | 'mastery' 
  | 'completion' 
  | 'first_topic';

export interface StudentBadge {
  id: string;
  studentId: string;
  badgeId: string;
  earnedAt: string;
  badge?: Badge; // Joined badge data
}

export interface TopicLearningProgress {
  id: string;
  studentId: string;
  topicId: string;
  sectionsCompleted: number;
  totalSections: number;
  conceptCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface XPTransaction {
  id: string;
  studentId: string;
  amount: number;
  reason: XPReason;
  createdAt: string;
}

export type XPReason = 
  | 'section_complete'
  | 'question_correct'
  | 'question_first_try'
  | 'topic_complete'
  | 'chapter_complete'
  | 'daily_goal_complete'
  | 'streak_milestone';

// =============================================
// GAMIFICATION DATA AGGREGATE
// =============================================

export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: string | null;
  dailyGoalMinutes: number;
  dailyProgressMinutes: number;
  dailyGoalCompleted: boolean;
  badges: StudentBadge[];
  xpToNextLevel: number;
  levelProgress: number; // 0-100 percentage
}

// =============================================
// MASTERY CONSTANTS
// =============================================

export const MASTERY_THRESHOLDS = {
  INITIAL_CONCEPT_COMPLETE: 30,  // Requirement 6.1: Initial mastery after concept learning
  MASTERED: 80,                   // Requirement 6.4: Topic considered mastered
  CORRECT_ANSWER_INCREASE: 5,     // Mastery increase per correct answer
  INCORRECT_ANSWER_DECREASE: 3,   // Mastery decrease per incorrect answer
  MIN_MASTERY: 0,
  MAX_MASTERY: 100,
} as const;

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Calculate level from XP
 * Property 7: Level Calculation Consistency
 * For any XP value, the calculated level SHALL be deterministic 
 * and monotonically increasing (higher XP never results in lower level)
 * 
 * @param xp - Total XP points
 * @returns Level number (1-based)
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) {
    return 1;
  }
  
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  // For XP beyond defined thresholds, continue with pattern
  if (xp >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
    const lastThreshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const increment = 5000; // Each level after 15 requires 5000 more XP
    const extraLevels = Math.floor((xp - lastThreshold) / increment);
    level = LEVEL_THRESHOLDS.length + extraLevels;
  }
  
  return level;
}

/**
 * Calculate XP needed to reach next level
 * @param xp - Current XP
 * @returns XP needed for next level
 */
export function xpToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  
  if (currentLevel < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[currentLevel] - xp;
  }
  
  // For levels beyond defined thresholds
  const lastThreshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const increment = 5000;
  const levelsAbove = currentLevel - LEVEL_THRESHOLDS.length;
  const nextThreshold = lastThreshold + (levelsAbove + 1) * increment;
  return nextThreshold - xp;
}

/**
 * Calculate level progress as percentage (0-100)
 * @param xp - Current XP
 * @returns Progress percentage within current level
 */
export function levelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp);
  
  let currentThreshold: number;
  let nextThreshold: number;
  
  if (currentLevel <= LEVEL_THRESHOLDS.length) {
    currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
    nextThreshold = currentLevel < LEVEL_THRESHOLDS.length 
      ? LEVEL_THRESHOLDS[currentLevel] 
      : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 5000;
  } else {
    const lastThreshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const increment = 5000;
    const levelsAbove = currentLevel - LEVEL_THRESHOLDS.length;
    currentThreshold = lastThreshold + levelsAbove * increment;
    nextThreshold = currentThreshold + increment;
  }
  
  const xpInLevel = xp - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;
  
  return Math.min(100, Math.floor((xpInLevel / xpForLevel) * 100));
}
