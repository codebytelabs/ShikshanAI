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


// =============================================
// COMPREHENSIVE CURRICULUM CONTENT PROPERTIES
// =============================================

import type { Question } from './practiceService';

/**
 * Validate that a question has a non-empty solution
 * Property 5: Solution presence
 */
function validateSolutionPresence(question: Question): boolean {
  return question.solution !== null && question.solution.trim().length > 0;
}

/**
 * Validate that a question has a valid difficulty level
 * Property 6: Difficulty level presence
 */
function validateDifficultyLevel(question: Question): boolean {
  const validDifficulties = ['easy', 'medium', 'hard'];
  return validDifficulties.includes(question.difficulty);
}

/**
 * Validate question type diversity for a topic
 * Property 4: Question type diversity
 */
function validateQuestionTypeDiversity(questions: Question[]): boolean {
  if (questions.length === 0) return true;
  const types = new Set(questions.map(q => q.questionType));
  return types.size >= 2;
}

describe('Comprehensive Curriculum Content Properties', () => {
  /**
   * **Feature: comprehensive-curriculum-content, Property 5: Solution presence**
   * *For any* practice question, the solution field should be non-empty
   * and contain step-by-step explanation.
   * **Validates: Requirements 3.2**
   */
  describe('Property 5: Solution presence', () => {
    const questionWithSolutionArb = fc.record({
      id: fc.uuid(),
      topicId: fc.uuid(),
      question: fc.string({ minLength: 10, maxLength: 200 }),
      questionType: fc.constantFrom('mcq', 'numerical', 'short'),
      options: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 4, maxLength: 4 }), { nil: null }),
      correctAnswer: fc.string({ minLength: 1, maxLength: 100 }),
      hint: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: null }),
      solution: fc.string({ minLength: 20, maxLength: 500 }), // Non-empty solution
      curriculumRef: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: null }),
      difficulty: fc.constantFrom('easy', 'medium', 'hard'),
    });

    it('should validate that questions with solutions pass validation', () => {
      fc.assert(
        fc.property(questionWithSolutionArb, (question) => {
          expect(validateSolutionPresence(question)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject questions with null solutions', () => {
      const questionWithoutSolution: Question = {
        id: 'test-id',
        topicId: 'topic-id',
        question: 'What is 2 + 2?',
        questionType: 'mcq',
        options: ['1', '2', '3', '4'],
        correctAnswer: '4',
        hint: null,
        solution: null,
        curriculumRef: null,
        difficulty: 'easy',
      };
      expect(validateSolutionPresence(questionWithoutSolution)).toBe(false);
    });

    it('should reject questions with empty solutions', () => {
      const questionWithEmptySolution: Question = {
        id: 'test-id',
        topicId: 'topic-id',
        question: 'What is 2 + 2?',
        questionType: 'mcq',
        options: ['1', '2', '3', '4'],
        correctAnswer: '4',
        hint: null,
        solution: '   ',
        curriculumRef: null,
        difficulty: 'easy',
      };
      expect(validateSolutionPresence(questionWithEmptySolution)).toBe(false);
    });
  });

  /**
   * **Feature: comprehensive-curriculum-content, Property 6: Difficulty level presence**
   * *For any* practice question, the difficulty field should be set to one of:
   * 'easy', 'medium', 'hard'.
   * **Validates: Requirements 3.3**
   */
  describe('Property 6: Difficulty level presence', () => {
    const questionArb = fc.record({
      id: fc.uuid(),
      topicId: fc.uuid(),
      question: fc.string({ minLength: 10, maxLength: 200 }),
      questionType: fc.constantFrom('mcq', 'numerical', 'short'),
      options: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 4, maxLength: 4 }), { nil: null }),
      correctAnswer: fc.string({ minLength: 1, maxLength: 100 }),
      hint: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: null }),
      solution: fc.string({ minLength: 20, maxLength: 500 }),
      curriculumRef: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: null }),
      difficulty: fc.constantFrom('easy', 'medium', 'hard'),
    });

    it('should validate that questions have valid difficulty levels', () => {
      fc.assert(
        fc.property(questionArb, (question) => {
          expect(validateDifficultyLevel(question)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should accept easy difficulty', () => {
      const question: Question = {
        id: 'test-id',
        topicId: 'topic-id',
        question: 'What is 2 + 2?',
        questionType: 'mcq',
        options: ['1', '2', '3', '4'],
        correctAnswer: '4',
        hint: null,
        solution: 'Step 1: Add 2 and 2. Result: 4',
        curriculumRef: null,
        difficulty: 'easy',
      };
      expect(validateDifficultyLevel(question)).toBe(true);
    });

    it('should accept medium difficulty', () => {
      const question: Question = {
        id: 'test-id',
        topicId: 'topic-id',
        question: 'Solve: x² - 5x + 6 = 0',
        questionType: 'numerical',
        options: null,
        correctAnswer: '2, 3',
        hint: null,
        solution: 'Step 1: Factor. (x-2)(x-3) = 0. x = 2 or x = 3',
        curriculumRef: null,
        difficulty: 'medium',
      };
      expect(validateDifficultyLevel(question)).toBe(true);
    });

    it('should accept hard difficulty', () => {
      const question: Question = {
        id: 'test-id',
        topicId: 'topic-id',
        question: 'Prove that √2 is irrational',
        questionType: 'short',
        options: null,
        correctAnswer: 'Proof by contradiction',
        hint: null,
        solution: 'Assume √2 = p/q where p,q are coprime...',
        curriculumRef: null,
        difficulty: 'hard',
      };
      expect(validateDifficultyLevel(question)).toBe(true);
    });

    it('should reject invalid difficulty levels', () => {
      const question: Question = {
        id: 'test-id',
        topicId: 'topic-id',
        question: 'What is 2 + 2?',
        questionType: 'mcq',
        options: ['1', '2', '3', '4'],
        correctAnswer: '4',
        hint: null,
        solution: 'Step 1: Add 2 and 2. Result: 4',
        curriculumRef: null,
        difficulty: 'very_hard' as any, // Invalid
      };
      expect(validateDifficultyLevel(question)).toBe(false);
    });
  });

  /**
   * **Feature: comprehensive-curriculum-content, Property 4: Question type diversity**
   * *For any* topic with practice questions, there should be questions of at least
   * 2 different question types (mcq, numerical, short).
   * **Validates: Requirements 3.1**
   */
  describe('Property 4: Question type diversity', () => {
    it('should validate diverse question types', () => {
      const questions: Question[] = [
        {
          id: '1',
          topicId: 't1',
          question: 'MCQ question',
          questionType: 'mcq',
          options: ['a', 'b', 'c', 'd'],
          correctAnswer: 'a',
          hint: null,
          solution: 'Solution here',
          curriculumRef: null,
          difficulty: 'easy',
        },
        {
          id: '2',
          topicId: 't1',
          question: 'Numerical question',
          questionType: 'numerical',
          options: null,
          correctAnswer: '42',
          hint: null,
          solution: 'Solution here',
          curriculumRef: null,
          difficulty: 'medium',
        },
      ];
      expect(validateQuestionTypeDiversity(questions)).toBe(true);
    });

    it('should reject single question type', () => {
      const questions: Question[] = [
        {
          id: '1',
          topicId: 't1',
          question: 'MCQ question 1',
          questionType: 'mcq',
          options: ['a', 'b', 'c', 'd'],
          correctAnswer: 'a',
          hint: null,
          solution: 'Solution here',
          curriculumRef: null,
          difficulty: 'easy',
        },
        {
          id: '2',
          topicId: 't1',
          question: 'MCQ question 2',
          questionType: 'mcq',
          options: ['a', 'b', 'c', 'd'],
          correctAnswer: 'b',
          hint: null,
          solution: 'Solution here',
          curriculumRef: null,
          difficulty: 'medium',
        },
      ];
      expect(validateQuestionTypeDiversity(questions)).toBe(false);
    });

    it('should handle empty question array', () => {
      expect(validateQuestionTypeDiversity([])).toBe(true);
    });
  });
});
