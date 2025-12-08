/**
 * Practice Service Property Tests
 * Tests for question prioritization and consecutive wrong detection
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// =============================================
// PURE FUNCTIONS FOR TESTING
// =============================================

interface TopicWithMastery {
  topicId: string;
  mastery: number;
  questions: string[];
}

/**
 * Prioritize questions by topic mastery (lower mastery first)
 * Property 12: Question Prioritization by Mastery
 */
function prioritizeQuestionsByMastery(
  topics: TopicWithMastery[]
): string[] {
  // Sort topics by mastery (ascending - lower mastery first)
  const sortedTopics = [...topics].sort((a, b) => a.mastery - b.mastery);

  // Flatten questions maintaining priority order
  return sortedTopics.flatMap(t => t.questions);
}

/**
 * Check if questions are properly prioritized
 * Questions from lower mastery topics should come before higher mastery
 */
function areQuestionsPrioritized(
  topics: TopicWithMastery[],
  orderedQuestions: string[]
): boolean {
  if (orderedQuestions.length === 0) return true;

  // Build a map of question -> topic mastery
  const questionMastery = new Map<string, number>();
  for (const topic of topics) {
    for (const q of topic.questions) {
      questionMastery.set(q, topic.mastery);
    }
  }

  // Check that questions are in non-decreasing mastery order
  let prevMastery = -1;
  for (const q of orderedQuestions) {
    const mastery = questionMastery.get(q);
    if (mastery === undefined) continue;
    if (mastery < prevMastery) return false;
    prevMastery = mastery;
  }

  return true;
}

/**
 * Detect consecutive wrong answers
 * Property 13: Consecutive Wrong Answer Detection
 */
function detectConsecutiveWrong(
  answers: boolean[],
  threshold: number = 3
): boolean {
  let consecutive = 0;
  for (const isCorrect of answers) {
    if (!isCorrect) {
      consecutive++;
      if (consecutive >= threshold) return true;
    } else {
      consecutive = 0;
    }
  }
  return false;
}

/**
 * Count max consecutive wrong answers
 */
function maxConsecutiveWrong(answers: boolean[]): number {
  let max = 0;
  let current = 0;
  for (const isCorrect of answers) {
    if (!isCorrect) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }
  return max;
}

// =============================================
// PROPERTY TESTS
// =============================================

describe('Practice Service Properties', () => {
  /**
   * **Feature: learning-experience-overhaul, Property 12: Question Prioritization by Mastery**
   * *For any* practice session, questions from topics with lower mastery SHALL
   * appear before questions from topics with higher mastery.
   * **Validates: Requirements 7.1**
   */
  describe('Property 12: Question Prioritization by Mastery', () => {
    const topicArb = fc.record({
      topicId: fc.uuid(),
      mastery: fc.integer({ min: 0, max: 100 }),
      questions: fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
    });

    it('should prioritize questions from lower mastery topics first', () => {
      fc.assert(
        fc.property(
          fc.array(topicArb, { minLength: 1, maxLength: 10 }),
          (topics) => {
            const prioritized = prioritizeQuestionsByMastery(topics);
            expect(areQuestionsPrioritized(topics, prioritized)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all questions from all topics', () => {
      fc.assert(
        fc.property(
          fc.array(topicArb, { minLength: 1, maxLength: 10 }),
          (topics) => {
            const prioritized = prioritizeQuestionsByMastery(topics);
            const totalQuestions = topics.reduce((sum, t) => sum + t.questions.length, 0);
            expect(prioritized.length).toBe(totalQuestions);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should put 0% mastery topics before 100% mastery topics', () => {
      const lowMasteryTopic: TopicWithMastery = {
        topicId: 'low',
        mastery: 0,
        questions: ['q1', 'q2'],
      };
      const highMasteryTopic: TopicWithMastery = {
        topicId: 'high',
        mastery: 100,
        questions: ['q3', 'q4'],
      };

      const prioritized = prioritizeQuestionsByMastery([highMasteryTopic, lowMasteryTopic]);

      // Low mastery questions should come first
      expect(prioritized.indexOf('q1')).toBeLessThan(prioritized.indexOf('q3'));
      expect(prioritized.indexOf('q2')).toBeLessThan(prioritized.indexOf('q4'));
    });
  });

  /**
   * **Feature: learning-experience-overhaul, Property 13: Consecutive Wrong Answer Detection**
   * *For any* sequence of 3 consecutive wrong answers in a practice session,
   * the system SHALL trigger a review suggestion.
   * **Validates: Requirements 7.4**
   */
  describe('Property 13: Consecutive Wrong Answer Detection', () => {
    it('should detect 3 or more consecutive wrong answers', () => {
      fc.assert(
        fc.property(
          fc.array(fc.boolean(), { minLength: 0, maxLength: 20 }),
          (answers) => {
            const detected = detectConsecutiveWrong(answers, 3);
            const maxWrong = maxConsecutiveWrong(answers);

            if (maxWrong >= 3) {
              expect(detected).toBe(true);
            } else {
              expect(detected).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not trigger for fewer than 3 consecutive wrong', () => {
      // Two wrong, then correct
      expect(detectConsecutiveWrong([false, false, true], 3)).toBe(false);
      // Alternating
      expect(detectConsecutiveWrong([false, true, false, true, false], 3)).toBe(false);
    });

    it('should trigger for exactly 3 consecutive wrong', () => {
      expect(detectConsecutiveWrong([false, false, false], 3)).toBe(true);
      expect(detectConsecutiveWrong([true, false, false, false], 3)).toBe(true);
      expect(detectConsecutiveWrong([false, false, false, true], 3)).toBe(true);
    });

    it('should reset count after a correct answer', () => {
      // 2 wrong, 1 correct, 2 wrong - should not trigger
      expect(detectConsecutiveWrong([false, false, true, false, false], 3)).toBe(false);
    });

    it('should handle empty answer array', () => {
      expect(detectConsecutiveWrong([], 3)).toBe(false);
    });

    it('should handle all correct answers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (count) => {
            const allCorrect = Array(count).fill(true);
            expect(detectConsecutiveWrong(allCorrect, 3)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
