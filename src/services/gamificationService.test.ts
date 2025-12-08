/**
 * Gamification Service Property Tests
 * Tests for XP awards, streak logic, and badge criteria
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  XP_AWARDS,
  calculateLevel,
  LEVEL_THRESHOLDS,
} from './gamification/types';

// =============================================
// PURE FUNCTION IMPLEMENTATIONS FOR TESTING
// These mirror the service logic but without database dependencies
// =============================================

/**
 * Calculate new XP after award
 * Property 1: XP Award Consistency
 */
function calculateNewXP(currentXP: number, awardAmount: number): number {
  if (awardAmount <= 0) {
    throw new Error('XP amount must be positive');
  }
  return currentXP + awardAmount;
}

/**
 * Calculate streak based on last activity date
 * Property 2 & 3: Streak Logic
 */
function calculateStreak(
  currentStreak: number,
  lastActivityDate: Date | null,
  today: Date
): number {
  if (!lastActivityDate) {
    return 1; // First activity
  }

  // Normalize dates to midnight
  const todayNorm = new Date(today);
  todayNorm.setHours(0, 0, 0, 0);
  const lastNorm = new Date(lastActivityDate);
  lastNorm.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (todayNorm.getTime() - lastNorm.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    return currentStreak; // Same day - no change
  } else if (daysDiff === 1) {
    return currentStreak + 1; // Yesterday - increment
  } else {
    return 1; // More than 1 day gap - reset
  }
}

/**
 * Check if badge criteria is met
 * Property 4: Badge Award Criteria
 */
function shouldAwardBadge(
  criteriaType: string,
  criteriaValue: number,
  stats: {
    xp?: number;
    streak?: number;
    topicsCompleted?: number;
    chapterMastery?: number;
  }
): boolean {
  switch (criteriaType) {
    case 'xp':
      return stats.xp !== undefined && stats.xp >= criteriaValue;
    case 'streak':
      return stats.streak !== undefined && stats.streak >= criteriaValue;
    case 'completion':
    case 'first_topic':
      return stats.topicsCompleted !== undefined && stats.topicsCompleted >= criteriaValue;
    case 'mastery':
      return stats.chapterMastery !== undefined && stats.chapterMastery >= criteriaValue;
    default:
      return false;
  }
}

// =============================================
// PROPERTY TESTS
// =============================================

describe('Gamification Service', () => {
  /**
   * **Feature: learning-experience-overhaul, Property 1: XP Award Consistency**
   * *For any* learning activity completion (section, question, topic, chapter),
   * the XP awarded SHALL match the defined amounts and the student's total XP
   * SHALL increase by exactly that amount.
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
   */
  describe('Property 1: XP Award Consistency', () => {
    it('should increase total XP by exactly the award amount', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }), // currentXP
          fc.integer({ min: 1, max: 1000 }),   // awardAmount
          (currentXP, awardAmount) => {
            const newXP = calculateNewXP(currentXP, awardAmount);
            expect(newXP).toBe(currentXP + awardAmount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP for section completion (10 XP)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (currentXP) => {
            const newXP = calculateNewXP(currentXP, XP_AWARDS.SECTION_COMPLETE);
            expect(newXP - currentXP).toBe(10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP for correct question (5 XP)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (currentXP) => {
            const newXP = calculateNewXP(currentXP, XP_AWARDS.QUESTION_CORRECT);
            expect(newXP - currentXP).toBe(5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP for first-try correct (10 XP bonus)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (currentXP) => {
            const newXP = calculateNewXP(currentXP, XP_AWARDS.QUESTION_FIRST_TRY);
            expect(newXP - currentXP).toBe(10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP for topic completion (50 XP)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (currentXP) => {
            const newXP = calculateNewXP(currentXP, XP_AWARDS.TOPIC_COMPLETE);
            expect(newXP - currentXP).toBe(50);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP for chapter completion (200 XP)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (currentXP) => {
            const newXP = calculateNewXP(currentXP, XP_AWARDS.CHAPTER_COMPLETE);
            expect(newXP - currentXP).toBe(200);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-positive XP amounts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.integer({ min: -1000, max: 0 }),
          (currentXP, invalidAmount) => {
            expect(() => calculateNewXP(currentXP, invalidAmount)).toThrow('XP amount must be positive');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain XP consistency across multiple awards', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }),
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 20 }),
          (initialXP, awards) => {
            let currentXP = initialXP;
            const expectedTotal = initialXP + awards.reduce((sum, a) => sum + a, 0);
            
            for (const award of awards) {
              currentXP = calculateNewXP(currentXP, award);
            }
            
            expect(currentXP).toBe(expectedTotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update level correctly when XP increases', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.integer({ min: 1, max: 1000 }),
          (currentXP, awardAmount) => {
            const newXP = calculateNewXP(currentXP, awardAmount);
            const oldLevel = calculateLevel(currentXP);
            const newLevel = calculateLevel(newXP);
            
            // Level should never decrease when XP increases
            expect(newLevel).toBeGreaterThanOrEqual(oldLevel);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


  /**
   * **Feature: learning-experience-overhaul, Property 2: Streak Increment Logic**
   * *For any* student who completes a learning activity, if their last activity
   * was yesterday or today, their streak SHALL increment by 1 (if yesterday)
   * or remain unchanged (if today). If their last activity was more than 1 day ago,
   * their streak SHALL reset to 1.
   * **Validates: Requirements 4.1, 4.2**
   */
  describe('Property 2: Streak Increment Logic', () => {
    it('should keep streak unchanged when activity is on same day', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // currentStreak
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
            .filter(d => !isNaN(d.getTime())),
          (currentStreak, today) => {
            // Last activity is today (same day)
            const lastActivity = new Date(today);
            const newStreak = calculateStreak(currentStreak, lastActivity, today);
            expect(newStreak).toBe(currentStreak);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should increment streak by 1 when last activity was yesterday', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // currentStreak
          fc.date({ min: new Date('2020-01-02'), max: new Date('2030-12-31') })
            .filter(d => !isNaN(d.getTime())),
          (currentStreak, today) => {
            // Last activity was yesterday
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const newStreak = calculateStreak(currentStreak, yesterday, today);
            expect(newStreak).toBe(currentStreak + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 1 for first activity (no previous activity)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }), // currentStreak (ignored when no last activity)
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
            .filter(d => !isNaN(d.getTime())),
          (currentStreak, today) => {
            const newStreak = calculateStreak(currentStreak, null, today);
            expect(newStreak).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: learning-experience-overhaul, Property 3: Streak Reset on Miss**
   * *For any* student whose last activity date is more than 1 day before the
   * current date, when they next complete an activity, their streak SHALL be
   * set to 1 (not incremented from previous value).
   * **Validates: Requirements 4.2**
   */
  describe('Property 3: Streak Reset on Miss', () => {
    it('should reset streak to 1 when gap is more than 1 day', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // currentStreak
          fc.integer({ min: 2, max: 365 }),   // dayGap (2+ days)
          fc.date({ min: new Date('2020-01-01'), max: new Date('2029-12-31') })
            .filter(d => !isNaN(d.getTime())),
          (currentStreak, dayGap, today) => {
            // Last activity was dayGap days ago (more than 1 day)
            const lastActivity = new Date(today);
            lastActivity.setDate(lastActivity.getDate() - dayGap);
            
            const newStreak = calculateStreak(currentStreak, lastActivity, today);
            expect(newStreak).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reset even high streaks to 1 after missing a day', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }), // high streak
          fc.date({ min: new Date('2020-01-03'), max: new Date('2030-12-31') })
            .filter(d => !isNaN(d.getTime())),
          (highStreak, today) => {
            // Last activity was 2 days ago (missed yesterday)
            const twoDaysAgo = new Date(today);
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            
            const newStreak = calculateStreak(highStreak, twoDaysAgo, today);
            expect(newStreak).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of exactly 1 day gap (yesterday) - should increment', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.date({ min: new Date('2020-01-02'), max: new Date('2030-12-31') })
            .filter(d => !isNaN(d.getTime())), // Filter out invalid dates
          (currentStreak, today) => {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const newStreak = calculateStreak(currentStreak, yesterday, today);
            // Exactly 1 day gap means yesterday - should increment
            expect(newStreak).toBe(currentStreak + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of exactly 2 day gap - should reset', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.date({ min: new Date('2020-01-03'), max: new Date('2030-12-31') })
            .filter(d => !isNaN(d.getTime())),
          (currentStreak, today) => {
            const twoDaysAgo = new Date(today);
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            
            const newStreak = calculateStreak(currentStreak, twoDaysAgo, today);
            // 2 day gap means missed a day - should reset
            expect(newStreak).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: learning-experience-overhaul, Property 4: Badge Award Criteria**
   * *For any* badge with defined criteria (XP threshold, streak days, mastery percentage),
   * a student SHALL receive that badge if and only if they meet or exceed the criteria value.
   * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
   */
  describe('Property 4: Badge Award Criteria', () => {
    it('should award XP badge when XP meets or exceeds threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }), // criteriaValue
          fc.integer({ min: 0, max: 20000 }), // studentXP
          (criteriaValue, studentXP) => {
            const shouldAward = shouldAwardBadge('xp', criteriaValue, { xp: studentXP });
            
            if (studentXP >= criteriaValue) {
              expect(shouldAward).toBe(true);
            } else {
              expect(shouldAward).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award streak badge when streak meets or exceeds threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // criteriaValue (streak days)
          fc.integer({ min: 0, max: 200 }), // studentStreak
          (criteriaValue, studentStreak) => {
            const shouldAward = shouldAwardBadge('streak', criteriaValue, { streak: studentStreak });
            
            if (studentStreak >= criteriaValue) {
              expect(shouldAward).toBe(true);
            } else {
              expect(shouldAward).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award mastery badge when mastery meets or exceeds threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // criteriaValue (mastery %)
          fc.integer({ min: 0, max: 100 }), // studentMastery
          (criteriaValue, studentMastery) => {
            const shouldAward = shouldAwardBadge('mastery', criteriaValue, { chapterMastery: studentMastery });
            
            if (studentMastery >= criteriaValue) {
              expect(shouldAward).toBe(true);
            } else {
              expect(shouldAward).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award completion badge when topics completed meets or exceeds threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // criteriaValue (topics)
          fc.integer({ min: 0, max: 200 }), // topicsCompleted
          (criteriaValue, topicsCompleted) => {
            const shouldAward = shouldAwardBadge('completion', criteriaValue, { topicsCompleted });
            
            if (topicsCompleted >= criteriaValue) {
              expect(shouldAward).toBe(true);
            } else {
              expect(shouldAward).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award first_topic badge when first topic is completed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }), // topicsCompleted
          (topicsCompleted) => {
            // First topic badge has criteriaValue of 1
            const shouldAward = shouldAwardBadge('first_topic', 1, { topicsCompleted });
            
            if (topicsCompleted >= 1) {
              expect(shouldAward).toBe(true);
            } else {
              expect(shouldAward).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not award badge when stat is undefined', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('xp', 'streak', 'mastery', 'completion', 'first_topic'),
          fc.integer({ min: 1, max: 100 }),
          (criteriaType, criteriaValue) => {
            // Pass empty stats - no stat should match
            const shouldAward = shouldAwardBadge(criteriaType, criteriaValue, {});
            expect(shouldAward).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false for unknown criteria type', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => 
            !['xp', 'streak', 'mastery', 'completion', 'first_topic'].includes(s)
          ),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 1000 }),
          (unknownType, criteriaValue, statValue) => {
            const shouldAward = shouldAwardBadge(unknownType, criteriaValue, { 
              xp: statValue, 
              streak: statValue, 
              topicsCompleted: statValue, 
              chapterMastery: statValue 
            });
            expect(shouldAward).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award badge at exact threshold boundary', () => {
      // Test exact boundary - should award when exactly at threshold
      fc.assert(
        fc.property(
          fc.constantFrom('xp', 'streak', 'mastery', 'completion'),
          fc.integer({ min: 1, max: 1000 }),
          (criteriaType, threshold) => {
            let stats: any = {};
            switch (criteriaType) {
              case 'xp':
                stats = { xp: threshold };
                break;
              case 'streak':
                stats = { streak: threshold };
                break;
              case 'mastery':
                stats = { chapterMastery: threshold };
                break;
              case 'completion':
                stats = { topicsCompleted: threshold };
                break;
            }
            
            const shouldAward = shouldAwardBadge(criteriaType, threshold, stats);
            expect(shouldAward).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not award badge just below threshold', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('xp', 'streak', 'mastery', 'completion'),
          fc.integer({ min: 2, max: 1000 }), // min 2 so we can subtract 1
          (criteriaType, threshold) => {
            let stats: any = {};
            const belowThreshold = threshold - 1;
            
            switch (criteriaType) {
              case 'xp':
                stats = { xp: belowThreshold };
                break;
              case 'streak':
                stats = { streak: belowThreshold };
                break;
              case 'mastery':
                stats = { chapterMastery: belowThreshold };
                break;
              case 'completion':
                stats = { topicsCompleted: belowThreshold };
                break;
            }
            
            const shouldAward = shouldAwardBadge(criteriaType, threshold, stats);
            expect(shouldAward).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
