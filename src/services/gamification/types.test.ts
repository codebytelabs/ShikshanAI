import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateLevel,
  xpToNextLevel,
  levelProgress,
  LEVEL_THRESHOLDS,
} from './types';

describe('gamification types', () => {
  /**
   * **Feature: learning-experience-overhaul, Property 7: Level Calculation Consistency**
   * *For any* XP value, the calculated level SHALL be deterministic and monotonically
   * increasing (higher XP never results in lower level).
   * **Validates: Requirements 3.7**
   */
  describe('Property 7: Level Calculation Consistency', () => {
    it('should be deterministic - same XP always returns same level', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (xp) => {
            const level1 = calculateLevel(xp);
            const level2 = calculateLevel(xp);
            const level3 = calculateLevel(xp);
            
            expect(level1).toBe(level2);
            expect(level2).toBe(level3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be monotonically increasing - higher XP never results in lower level', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.integer({ min: 0, max: 100000 }),
          (xp1, xp2) => {
            const level1 = calculateLevel(xp1);
            const level2 = calculateLevel(xp2);
            
            if (xp1 <= xp2) {
              expect(level1).toBeLessThanOrEqual(level2);
            } else {
              expect(level1).toBeGreaterThanOrEqual(level2);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return level >= 1 for any non-negative XP', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (xp) => {
            const level = calculateLevel(xp);
            expect(level).toBeGreaterThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return level 1 for negative XP (edge case handling)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -10000, max: -1 }),
          (xp) => {
            const level = calculateLevel(xp);
            expect(level).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should match expected levels at threshold boundaries', () => {
      // Test exact threshold values
      LEVEL_THRESHOLDS.forEach((threshold, index) => {
        const expectedLevel = index + 1;
        expect(calculateLevel(threshold)).toBe(expectedLevel);
      });
    });

    it('should return correct level just below thresholds', () => {
      // Test values just below thresholds (should be previous level)
      for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
        const justBelow = LEVEL_THRESHOLDS[i] - 1;
        const expectedLevel = i; // Previous level
        expect(calculateLevel(justBelow)).toBe(expectedLevel);
      }
    });
  });

  describe('xpToNextLevel', () => {
    it('should return positive value for any XP', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (xp) => {
            const toNext = xpToNextLevel(xp);
            expect(toNext).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should decrease as XP increases within same level', () => {
      // Test within level 2 (100-249 XP)
      const xp1 = 100;
      const xp2 = 200;
      
      expect(xpToNextLevel(xp1)).toBeGreaterThan(xpToNextLevel(xp2));
    });
  });

  describe('levelProgress', () => {
    it('should return value between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (xp) => {
            const progress = levelProgress(xp);
            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be 0 at level threshold', () => {
      // At exact threshold, progress should be 0
      expect(levelProgress(0)).toBe(0);
      expect(levelProgress(100)).toBe(0);
      expect(levelProgress(250)).toBe(0);
    });
  });
});
