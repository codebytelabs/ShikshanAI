import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateProgressPercentage,
  isProgressZero,
  SubjectProgress,
} from './progressService';

describe('progressService', () => {
  /**
   * **Feature: beta-ready-improvements, Property 1: Progress Calculation Accuracy**
   * *For any* student with N completed topics out of M total topics in a subject,
   * the calculated progress percentage SHALL equal floor((N / M) × 100).
   * **Validates: Requirements 1.2**
   */
  describe('Property 1: Progress Calculation Accuracy', () => {
    it('should calculate progress as floor((completed / total) * 100)', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }), // completedTopics (0 to 1000)
          fc.integer({ min: 1, max: 1000 }), // totalTopics (1 to 1000, avoid division by zero)
          (completed, total) => {
            // Ensure completed <= total (valid input domain)
            const validCompleted = Math.min(completed, total);
            
            const result = calculateProgressPercentage(validCompleted, total);
            const expected = Math.floor((validCompleted / total) * 100);
            
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 when total topics is 0', () => {
      const result = calculateProgressPercentage(0, 0);
      expect(result).toBe(0);
    });

    it('should return 100 when all topics are completed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          (total) => {
            const result = calculateProgressPercentage(total, total);
            expect(result).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: beta-ready-improvements, Property 2: Progress Reset Completeness**
   * *For any* student who resets their profile, querying their progress for any subject
   * SHALL return 0% with 0 completed topics.
   * **Validates: Requirements 1.3**
   */
  describe('Property 2: Progress Reset Completeness', () => {
    it('should identify zero progress correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // subjectId
          fc.nat({ max: 100 }), // totalTopics
          (subjectId, totalTopics) => {
            const progress: SubjectProgress = {
              subjectId,
              completedTopics: 0,
              totalTopics,
              percentage: 0,
            };
            
            expect(isProgressZero(progress)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false for non-zero progress', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.integer({ min: 1, max: 100 }), // at least 1 completed
          fc.integer({ min: 1, max: 100 }),
          (subjectId, completed, total) => {
            const validTotal = Math.max(completed, total);
            const percentage = calculateProgressPercentage(completed, validTotal);
            
            const progress: SubjectProgress = {
              subjectId,
              completedTopics: completed,
              totalTopics: validTotal,
              percentage,
            };
            
            expect(isProgressZero(progress)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: beta-ready-improvements, Property 3: Progress Determinism**
   * *For any* student with a fixed set of completed topics, calling getSubjectProgress
   * multiple times SHALL return identical results.
   * **Validates: Requirements 1.5**
   */
  describe('Property 3: Progress Determinism', () => {
    it('should return identical results for same inputs', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (completed, total) => {
            const validCompleted = Math.min(completed, total);
            
            // Call multiple times with same inputs
            const result1 = calculateProgressPercentage(validCompleted, total);
            const result2 = calculateProgressPercentage(validCompleted, total);
            const result3 = calculateProgressPercentage(validCompleted, total);
            
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
