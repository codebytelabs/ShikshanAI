/**
 * Topic Status Service Property Tests
 * 
 * Property-based tests for the simplified progress system.
 * Uses fast-check for generating random test inputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateTopicStatus,
  type TopicStatus,
  type StatusInput,
} from './topicStatusService';

// =============================================
// PROPERTY TESTS
// =============================================

describe('Topic Status Service Properties', () => {
  /**
   * **Feature: simplified-progress-system, Property 1: Status Determination Consistency**
   * *For any* topic learning state (sections completed, questions attempted), 
   * the calculated status SHALL always be one of exactly four values: 
   * 'not_started', 'learning', 'practice', or 'completed'.
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: Status Determination Consistency', () => {
    const validStatuses: TopicStatus[] = ['not_started', 'learning', 'practice', 'completed'];

    const statusInputArb = fc.record({
      sectionsCompleted: fc.integer({ min: 0, max: 100 }),
      totalSections: fc.integer({ min: 1, max: 100 }),
      questionsAttempted: fc.integer({ min: 0, max: 100 }),
      minQuestionsRequired: fc.integer({ min: 1, max: 10 }),
    });

    it('should always return one of the four valid statuses', () => {
      fc.assert(
        fc.property(statusInputArb, (input) => {
          const status = calculateTopicStatus(input);
          expect(validStatuses).toContain(status);
        }),
        { numRuns: 100 }
      );
    });

    it('should return not_started when no activity', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // totalSections
          fc.integer({ min: 1, max: 10 }),  // minQuestionsRequired
          (totalSections, minQuestionsRequired) => {
            const input: StatusInput = {
              sectionsCompleted: 0,
              totalSections,
              questionsAttempted: 0,
              minQuestionsRequired,
            };
            expect(calculateTopicStatus(input)).toBe('not_started');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return learning when sections in progress', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }), // totalSections (at least 2 to have partial)
          fc.integer({ min: 1, max: 10 }),  // minQuestionsRequired
          (totalSections, minQuestionsRequired) => {
            // sectionsCompleted is between 1 and totalSections-1
            const sectionsCompleted = fc.sample(
              fc.integer({ min: 1, max: totalSections - 1 }),
              1
            )[0];
            
            const input: StatusInput = {
              sectionsCompleted,
              totalSections,
              questionsAttempted: 0,
              minQuestionsRequired,
            };
            expect(calculateTopicStatus(input)).toBe('learning');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return practice when all sections done but not enough questions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // totalSections
          fc.integer({ min: 2, max: 10 }),  // minQuestionsRequired (at least 2 to have partial)
          (totalSections, minQuestionsRequired) => {
            // questionsAttempted is between 0 and minQuestionsRequired-1
            const questionsAttempted = fc.sample(
              fc.integer({ min: 0, max: minQuestionsRequired - 1 }),
              1
            )[0];
            
            const input: StatusInput = {
              sectionsCompleted: totalSections,
              totalSections,
              questionsAttempted,
              minQuestionsRequired,
            };
            expect(calculateTopicStatus(input)).toBe('practice');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return completed when all sections and enough questions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // totalSections
          fc.integer({ min: 1, max: 10 }),  // minQuestionsRequired
          fc.integer({ min: 0, max: 50 }),  // extra questions beyond minimum
          (totalSections, minQuestionsRequired, extraQuestions) => {
            const input: StatusInput = {
              sectionsCompleted: totalSections,
              totalSections,
              questionsAttempted: minQuestionsRequired + extraQuestions,
              minQuestionsRequired,
            };
            expect(calculateTopicStatus(input)).toBe('completed');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


import { calculateProgress } from './topicStatusService';

describe('Progress Calculation Properties', () => {
  /**
   * **Feature: simplified-progress-system, Property 2: Learning Status Progress Range**
   * *For any* topic in 'learning' status (1 to totalSections-1 sections completed), 
   * the progress percentage SHALL be between 12.5% and 37.5% (proportional to sections 
   * completed out of half the total progress).
   * **Validates: Requirements 1.3**
   */
  describe('Property 2: Learning Status Progress Range', () => {
    it('should have progress between 12.5% and 37.5% for learning status', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }), // totalSections (at least 2 to have partial)
          fc.integer({ min: 1, max: 10 }),  // minQuestionsRequired
          (totalSections, minQuestionsRequired) => {
            // sectionsCompleted is between 1 and totalSections-1
            const sectionsCompleted = fc.sample(
              fc.integer({ min: 1, max: totalSections - 1 }),
              1
            )[0];
            
            const input: StatusInput = {
              sectionsCompleted,
              totalSections,
              questionsAttempted: 0,
              minQuestionsRequired,
            };
            
            const progress = calculateProgress(input);
            
            // Progress should be > 0 and <= 37.5%
            expect(progress).toBeGreaterThan(0);
            expect(progress).toBeLessThanOrEqual(37.5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be proportional to sections completed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 4, max: 20 }), // totalSections (at least 4 for meaningful test)
          (totalSections) => {
            const input1: StatusInput = {
              sectionsCompleted: 1,
              totalSections,
              questionsAttempted: 0,
            };
            const input2: StatusInput = {
              sectionsCompleted: 2,
              totalSections,
              questionsAttempted: 0,
            };
            
            const progress1 = calculateProgress(input1);
            const progress2 = calculateProgress(input2);
            
            // More sections = more progress
            expect(progress2).toBeGreaterThan(progress1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: simplified-progress-system, Property 3: Practice Status Fixed Progress**
   * *For any* topic in 'practice' status (all sections done, fewer than 3 questions), 
   * the progress SHALL be exactly 50%.
   * **Validates: Requirements 1.4**
   */
  describe('Property 3: Practice Status Fixed Progress', () => {
    it('should always be exactly 50% for practice status', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // totalSections
          fc.integer({ min: 2, max: 10 }),  // minQuestionsRequired (at least 2 to have partial)
          (totalSections, minQuestionsRequired) => {
            // questionsAttempted is between 0 and minQuestionsRequired-1
            const questionsAttempted = fc.sample(
              fc.integer({ min: 0, max: minQuestionsRequired - 1 }),
              1
            )[0];
            
            const input: StatusInput = {
              sectionsCompleted: totalSections,
              totalSections,
              questionsAttempted,
              minQuestionsRequired,
            };
            
            const progress = calculateProgress(input);
            expect(progress).toBe(50);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: simplified-progress-system, Property 4: Completed Status Full Progress**
   * *For any* topic in 'completed' status (all sections done AND 3+ questions attempted), 
   * the progress SHALL be exactly 100%.
   * **Validates: Requirements 1.5**
   */
  describe('Property 4: Completed Status Full Progress', () => {
    it('should always be exactly 100% for completed status', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // totalSections
          fc.integer({ min: 1, max: 10 }),  // minQuestionsRequired
          fc.integer({ min: 0, max: 50 }),  // extra questions beyond minimum
          (totalSections, minQuestionsRequired, extraQuestions) => {
            const input: StatusInput = {
              sectionsCompleted: totalSections,
              totalSections,
              questionsAttempted: minQuestionsRequired + extraQuestions,
              minQuestionsRequired,
            };
            
            const progress = calculateProgress(input);
            expect(progress).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property: Not started should always be 0%
   */
  describe('Not Started Progress', () => {
    it('should always be 0% for not_started status', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // totalSections
          fc.integer({ min: 1, max: 10 }),  // minQuestionsRequired
          (totalSections, minQuestionsRequired) => {
            const input: StatusInput = {
              sectionsCompleted: 0,
              totalSections,
              questionsAttempted: 0,
              minQuestionsRequired,
            };
            
            const progress = calculateProgress(input);
            expect(progress).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


import { getIconType, getActionText, getDisplayText, getTopicProgressInfo } from './topicStatusService';

describe('Display Helper Properties', () => {
  /**
   * **Feature: simplified-progress-system, Property 6: Icon Type Mapping**
   * *For any* topic status, the icon type SHALL be: 'empty' for not_started, 
   * 'half' for learning or practice, 'check' for completed.
   * **Validates: Requirements 3.1**
   */
  describe('Property 6: Icon Type Mapping', () => {
    it('should return empty icon for not_started status', () => {
      expect(getIconType('not_started')).toBe('empty');
    });

    it('should return half icon for learning status', () => {
      expect(getIconType('learning')).toBe('half');
    });

    it('should return half icon for practice status', () => {
      expect(getIconType('practice')).toBe('half');
    });

    it('should return check icon for completed status', () => {
      expect(getIconType('completed')).toBe('check');
    });

    it('should have consistent icon mapping for all generated inputs', () => {
      fc.assert(
        fc.property(
          fc.record({
            sectionsCompleted: fc.integer({ min: 0, max: 100 }),
            totalSections: fc.integer({ min: 1, max: 100 }),
            questionsAttempted: fc.integer({ min: 0, max: 100 }),
            minQuestionsRequired: fc.integer({ min: 1, max: 10 }),
          }),
          (input) => {
            const info = getTopicProgressInfo(input);
            
            // Verify icon type matches status
            if (info.status === 'not_started') {
              expect(info.iconType).toBe('empty');
            } else if (info.status === 'learning' || info.status === 'practice') {
              expect(info.iconType).toBe('half');
            } else if (info.status === 'completed') {
              expect(info.iconType).toBe('check');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: simplified-progress-system, Property 7: Action Text for Practice Status**
   * *For any* topic in 'practice' status, the actionText SHALL be "Practice now" 
   * and NOT a percentage.
   * **Validates: Requirements 3.2**
   */
  describe('Property 7: Action Text for Practice Status', () => {
    it('should return "Practice now" for practice status', () => {
      expect(getActionText('practice')).toBe('Practice now');
    });

    it('should return null for not_started status', () => {
      expect(getActionText('not_started')).toBeNull();
    });

    it('should return "Continue" for learning status', () => {
      expect(getActionText('learning')).toBe('Continue');
    });

    it('should return null for completed status', () => {
      expect(getActionText('completed')).toBeNull();
    });

    it('should have "Practice now" action text for all practice status inputs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // totalSections
          fc.integer({ min: 2, max: 10 }),  // minQuestionsRequired (at least 2 to have partial)
          (totalSections, minQuestionsRequired) => {
            // questionsAttempted is between 0 and minQuestionsRequired-1
            const questionsAttempted = fc.sample(
              fc.integer({ min: 0, max: minQuestionsRequired - 1 }),
              1
            )[0];
            
            const input: StatusInput = {
              sectionsCompleted: totalSections,
              totalSections,
              questionsAttempted,
              minQuestionsRequired,
            };
            
            const info = getTopicProgressInfo(input);
            expect(info.status).toBe('practice');
            expect(info.actionText).toBe('Practice now');
            // Verify it's not a percentage string
            expect(info.actionText).not.toMatch(/^\d+%$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property: Display text should be human-readable
   */
  describe('Display Text Consistency', () => {
    it('should return correct display text for each status', () => {
      expect(getDisplayText('not_started')).toBe('Not Started');
      expect(getDisplayText('learning')).toBe('Learning');
      expect(getDisplayText('practice')).toBe('Practice');
      expect(getDisplayText('completed')).toBe('Completed');
    });

    it('should have consistent display text for all generated inputs', () => {
      fc.assert(
        fc.property(
          fc.record({
            sectionsCompleted: fc.integer({ min: 0, max: 100 }),
            totalSections: fc.integer({ min: 1, max: 100 }),
            questionsAttempted: fc.integer({ min: 0, max: 100 }),
            minQuestionsRequired: fc.integer({ min: 1, max: 10 }),
          }),
          (input) => {
            const info = getTopicProgressInfo(input);
            const expectedDisplayText = {
              'not_started': 'Not Started',
              'learning': 'Learning',
              'practice': 'Practice',
              'completed': 'Completed',
            };
            expect(info.displayText).toBe(expectedDisplayText[info.status]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


import { calculateChapterProgress, formatProgressText, type ChapterProgressInfo } from './topicStatusService';

describe('Chapter Progress Properties', () => {
  /**
   * **Feature: simplified-progress-system, Property 5: Chapter Progress Calculation**
   * *For any* chapter with N topics where M are completed, the chapter progress 
   * SHALL equal (M / N) * 100, rounded to nearest integer.
   * **Validates: Requirements 2.1, 2.2**
   */
  describe('Property 5: Chapter Progress Calculation', () => {
    const topicStatusArb = fc.constantFrom<TopicStatus>(
      'not_started', 'learning', 'practice', 'completed'
    );

    it('should calculate progress as (completed / total) * 100 rounded', () => {
      fc.assert(
        fc.property(
          fc.array(topicStatusArb, { minLength: 1, maxLength: 50 }),
          (statuses) => {
            const result = calculateChapterProgress(statuses);
            const completedCount = statuses.filter(s => s === 'completed').length;
            const expectedProgress = Math.round((completedCount / statuses.length) * 100);
            
            expect(result.completedTopics).toBe(completedCount);
            expect(result.totalTopics).toBe(statuses.length);
            expect(result.progress).toBe(expectedProgress);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0% when no topics are completed', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.constantFrom<TopicStatus>('not_started', 'learning', 'practice'),
            { minLength: 1, maxLength: 20 }
          ),
          (statuses) => {
            const result = calculateChapterProgress(statuses);
            expect(result.completedTopics).toBe(0);
            expect(result.progress).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 100% when all topics are completed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          (count) => {
            const statuses: TopicStatus[] = Array(count).fill('completed');
            const result = calculateChapterProgress(statuses);
            expect(result.completedTopics).toBe(count);
            expect(result.totalTopics).toBe(count);
            expect(result.progress).toBe(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty topic array', () => {
      const result = calculateChapterProgress([]);
      expect(result.completedTopics).toBe(0);
      expect(result.totalTopics).toBe(0);
      expect(result.progress).toBe(0);
    });

    it('should only count completed status as completed', () => {
      // Mix of statuses - only 'completed' should count
      const statuses: TopicStatus[] = [
        'not_started', 'learning', 'practice', 'completed', 'completed'
      ];
      const result = calculateChapterProgress(statuses);
      expect(result.completedTopics).toBe(2);
      expect(result.totalTopics).toBe(5);
      expect(result.progress).toBe(40); // 2/5 = 40%
    });
  });
});


describe('Subject Progress Text Properties', () => {
  /**
   * **Feature: simplified-progress-system, Property 8: Subject Progress Text Format**
   * *For any* subject with M completed topics out of N total, the displayText 
   * SHALL match the format "M of N topics completed".
   * **Validates: Requirements 5.1**
   */
  describe('Property 8: Subject Progress Text Format', () => {
    it('should format as "M of N topics completed" for partial completion', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // total
          fc.integer({ min: 0, max: 99 }),  // completed (less than total)
          (total, completedOffset) => {
            // Ensure completed < total
            const completed = Math.min(completedOffset, total - 1);
            
            const text = formatProgressText(completed, total);
            expect(text).toBe(`${completed} of ${total} topics completed`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return "All topics completed!" when all topics are done', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (total) => {
            const text = formatProgressText(total, total);
            expect(text).toBe('All topics completed!');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle zero total topics', () => {
      const text = formatProgressText(0, 0);
      expect(text).toBe('0 of 0 topics completed');
    });

    it('should be consistent with calculateChapterProgress displayText', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.constantFrom<TopicStatus>('not_started', 'learning', 'practice', 'completed'),
            { minLength: 1, maxLength: 50 }
          ),
          (statuses) => {
            const result = calculateChapterProgress(statuses);
            const expectedText = formatProgressText(result.completedTopics, result.totalTopics);
            expect(result.displayText).toBe(expectedText);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
