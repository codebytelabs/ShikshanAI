/**
 * Mastery Service Property Tests
 * Tests for mastery calculation and threshold detection
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  isTopicMastered,
  calculateMasteryChange,
  MASTERY_THRESHOLDS,
} from './masteryService';

describe('Mastery Service', () => {
  /**
   * **Feature: learning-experience-overhaul, Property 5: Mastery Calculation Bounds**
   * *For any* mastery update operation, the resulting mastery value SHALL be
   * between 0 and 100 inclusive, and SHALL increase for correct answers
   * and decrease for incorrect answers.
   * **Validates: Requirements 6.1, 6.2**
   */
  describe('Property 5: Mastery Calculation Bounds', () => {
    it('should always return mastery between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // currentMastery
          fc.boolean(), // isCorrect
          (currentMastery, isCorrect) => {
            const newMastery = calculateMasteryChange(currentMastery, isCorrect);
            expect(newMastery).toBeGreaterThanOrEqual(0);
            expect(newMastery).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should increase mastery for correct answers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 95 }), // currentMastery (leave room for increase)
          (currentMastery) => {
            const newMastery = calculateMasteryChange(currentMastery, true);
            expect(newMastery).toBeGreaterThan(currentMastery);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should decrease mastery for incorrect answers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 100 }), // currentMastery (leave room for decrease)
          (currentMastery) => {
            const newMastery = calculateMasteryChange(currentMastery, false);
            expect(newMastery).toBeLessThan(currentMastery);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not go below 0 even with many incorrect answers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }), // low mastery
          fc.integer({ min: 1, max: 50 }), // number of wrong answers
          (startMastery, wrongCount) => {
            let mastery = startMastery;
            for (let i = 0; i < wrongCount; i++) {
              mastery = calculateMasteryChange(mastery, false);
            }
            expect(mastery).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not go above 100 even with many correct answers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 90, max: 100 }), // high mastery
          fc.integer({ min: 1, max: 50 }), // number of correct answers
          (startMastery, correctCount) => {
            let mastery = startMastery;
            for (let i = 0; i < correctCount; i++) {
              mastery = calculateMasteryChange(mastery, true);
            }
            expect(mastery).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should increase by correct amount for correct answers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 95 }),
          (currentMastery) => {
            const newMastery = calculateMasteryChange(currentMastery, true);
            const expectedIncrease = MASTERY_THRESHOLDS.CORRECT_ANSWER_INCREASE;
            expect(newMastery).toBe(
              Math.min(100, currentMastery + expectedIncrease)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should decrease by correct amount for incorrect answers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 100 }),
          (currentMastery) => {
            const newMastery = calculateMasteryChange(currentMastery, false);
            const expectedDecrease = MASTERY_THRESHOLDS.INCORRECT_ANSWER_DECREASE;
            expect(newMastery).toBe(
              Math.max(0, currentMastery - expectedDecrease)
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: learning-experience-overhaul, Property 6: Mastery Threshold Detection**
   * *For any* topic with mastery >= 80%, the `isTopicMastered` function SHALL
   * return true, and for mastery < 80%, it SHALL return false.
   * **Validates: Requirements 6.4**
   */
  describe('Property 6: Mastery Threshold Detection', () => {
    it('should return true for mastery >= 80%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 80, max: 100 }),
          (mastery) => {
            expect(isTopicMastered(mastery)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false for mastery < 80%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 79 }),
          (mastery) => {
            expect(isTopicMastered(mastery)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return true at exact threshold (80%)', () => {
      expect(isTopicMastered(80)).toBe(true);
    });

    it('should return false just below threshold (79%)', () => {
      expect(isTopicMastered(79)).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      expect(isTopicMastered(0)).toBe(false);
      expect(isTopicMastered(100)).toBe(true);
      expect(isTopicMastered(MASTERY_THRESHOLDS.MASTERED)).toBe(true);
      expect(isTopicMastered(MASTERY_THRESHOLDS.MASTERED - 1)).toBe(false);
    });
  });
});
