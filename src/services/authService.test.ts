import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  shouldShowSyncPrompt,
  getMostRecentProgress,
  isProfileLinked,
} from './authService';

describe('authService', () => {
  /**
   * **Feature: beta-ready-improvements, Property 11: Auth Data Linking**
   * *For any* user who authenticates, their student_profile SHALL have user_id set to their auth user ID.
   * **Validates: Requirements 4.2**
   */
  describe('Property 11: Auth Data Linking', () => {
    it('should correctly identify linked profiles', () => {
      fc.assert(
        fc.property(fc.uuid(), (userId) => {
          expect(isProfileLinked(userId)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly identify unlinked profiles', () => {
      const unlinkedValues = [null, undefined, ''];
      unlinkedValues.forEach((value) => {
        expect(isProfileLinked(value)).toBe(false);
      });
    });
  });

  /**
   * **Feature: beta-ready-improvements, Property 12: Session Count Prompt Trigger**
   * *For any* anonymous user with session_count >= 3, the system SHALL indicate a prompt should be shown.
   * **Validates: Requirements 4.4**
   */
  describe('Property 12: Session Count Prompt Trigger', () => {
    it('should show prompt for anonymous users with 3+ sessions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 1000 }), // session count >= 3
          (sessionCount) => {
            const hasUserId = false; // anonymous user
            expect(shouldShowSyncPrompt(sessionCount, hasUserId)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not show prompt for users with less than 3 sessions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2 }), // session count < 3
          fc.boolean(), // hasUserId
          (sessionCount, hasUserId) => {
            expect(shouldShowSyncPrompt(sessionCount, hasUserId)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not show prompt for authenticated users', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }), // any session count
          (sessionCount) => {
            const hasUserId = true; // authenticated user
            expect(shouldShowSyncPrompt(sessionCount, hasUserId)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: beta-ready-improvements, Property 13: Profile Auth State Display**
   * *For any* user without a linked user_id, the profile page state SHALL indicate login options should be shown.
   * **Validates: Requirements 4.5**
   */
  describe('Property 13: Profile Auth State Display', () => {
    it('should indicate login options for unlinked profiles', () => {
      const unlinkedValues = [null, undefined, ''];
      unlinkedValues.forEach((userId) => {
        const shouldShowLogin = !isProfileLinked(userId);
        expect(shouldShowLogin).toBe(true);
      });
    });

    it('should not show login options for linked profiles', () => {
      fc.assert(
        fc.property(fc.uuid(), (userId) => {
          const shouldShowLogin = !isProfileLinked(userId);
          expect(shouldShowLogin).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: beta-ready-improvements, Property 14: Data Merge Recency**
   * *For any* topic with progress in both anonymous and authenticated data,
   * the merged result SHALL use the record with the most recent timestamp.
   * **Validates: Requirements 4.7**
   */
  describe('Property 14: Data Merge Recency', () => {
    it('should return the more recent progress record', () => {
      // Use integer timestamps to avoid NaN date issues
      fc.assert(
        fc.property(
          fc.integer({ min: 1577836800000, max: 1893456000000 }), // 2020-01-01 to 2030-01-01 in ms
          fc.integer({ min: 1577836800000, max: 1893456000000 }),
          fc.integer({ min: 0, max: 100 }), // mastery1
          fc.integer({ min: 0, max: 100 }), // mastery2
          (time1, time2, mastery1, mastery2) => {
            const progress1 = {
              id: 'p1',
              mastery: mastery1,
              updated_at: new Date(time1).toISOString(),
            };
            const progress2 = {
              id: 'p2',
              mastery: mastery2,
              updated_at: new Date(time2).toISOString(),
            };

            const result = getMostRecentProgress(progress1, progress2);

            // The result should be the one with the more recent timestamp
            if (time1 >= time2) {
              expect(result.id).toBe('p1');
            } else {
              expect(result.id).toBe('p2');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle null timestamps by treating them as oldest', () => {
      const withTimestamp = {
        id: 'with',
        mastery: 50,
        updated_at: new Date().toISOString(),
      };
      const withoutTimestamp = {
        id: 'without',
        mastery: 75,
        updated_at: null,
      };

      const result = getMostRecentProgress(withTimestamp, withoutTimestamp);
      expect(result.id).toBe('with');

      const result2 = getMostRecentProgress(withoutTimestamp, withTimestamp);
      expect(result2.id).toBe('with');
    });
  });
});
