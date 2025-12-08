import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  filterQuestionsByTopic,
  prioritizeQuestions,
  calculateStats,
  Question,
  PracticeStats,
} from './practiceService';

// Arbitrary for generating questions
const questionArb = (topicId?: string): fc.Arbitrary<Question> =>
  fc.record({
    id: fc.uuid(),
    topicId: topicId ? fc.constant(topicId) : fc.uuid(),
    question: fc.string({ minLength: 1, maxLength: 200 }),
    questionType: fc.constantFrom('mcq', 'numerical', 'short'),
    options: fc.option(fc.array(fc.string(), { minLength: 2, maxLength: 4 }), { nil: null }),
    correctAnswer: fc.option(fc.string(), { nil: null }),
    hint: fc.option(fc.string(), { nil: null }),
    solution: fc.option(fc.string(), { nil: null }),
    curriculumRef: fc.option(fc.string(), { nil: null }),
    difficulty: fc.constantFrom('easy', 'medium', 'hard'),
  });

describe('practiceService', () => {
  /**
   * **Feature: beta-ready-improvements, Property 6: Question Filtering by Topic**
   * *For any* topic ID, all questions returned by getQuestionsForTopic SHALL have that topic_id.
   * **Validates: Requirements 3.1**
   */
  describe('Property 6: Question Filtering by Topic', () => {
    it('should return only questions matching the topic ID', () => {
      fc.assert(
        fc.property(
          fc.uuid(), // target topic ID
          fc.array(questionArb(), { minLength: 0, maxLength: 20 }), // mixed questions
          (targetTopicId, questions) => {
            const filtered = filterQuestionsByTopic(questions, targetTopicId);
            
            // All returned questions should have the target topic ID
            filtered.forEach((q) => {
              expect(q.topicId).toBe(targetTopicId);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all questions when all have matching topic', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.integer({ min: 1, max: 10 }),
          (topicId, count) => {
            // Generate questions all with the same topic
            const questions: Question[] = [];
            for (let i = 0; i < count; i++) {
              questions.push({
                id: `q-${i}`,
                topicId,
                question: `Question ${i}`,
                questionType: 'mcq',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'A',
                hint: null,
                solution: null,
                curriculumRef: null,
                difficulty: 'medium',
              });
            }
            
            const filtered = filterQuestionsByTopic(questions, topicId);
            expect(filtered.length).toBe(count);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: beta-ready-improvements, Property 8: Question Prioritization Order**
   * *For any* practice session, unattempted questions SHALL appear before correctly-answered
   * questions in the returned list.
   * **Validates: Requirements 3.3**
   */
  describe('Property 8: Question Prioritization Order', () => {
    it('should order unattempted before incorrect before correct', () => {
      fc.assert(
        fc.property(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }), // question IDs
          (questionIds) => {
            // Create questions
            const questions: Question[] = questionIds.map((id) => ({
              id,
              topicId: 'topic-1',
              question: `Question ${id}`,
              questionType: 'mcq',
              options: ['A', 'B'],
              correctAnswer: 'A',
              hint: null,
              solution: null,
              ncertRef: null,
              difficulty: 'medium',
            }));

            // Create random attempt map
            const attemptMap = new Map<string, boolean>();
            questionIds.forEach((id, idx) => {
              if (idx % 3 === 0) {
                // Leave unattempted
              } else if (idx % 3 === 1) {
                attemptMap.set(id, false); // incorrect
              } else {
                attemptMap.set(id, true); // correct
              }
            });

            const prioritized = prioritizeQuestions(questions, attemptMap);

            // Find boundaries
            let lastUnattemptedIdx = -1;
            let firstIncorrectIdx = prioritized.length;
            let lastIncorrectIdx = -1;
            let firstCorrectIdx = prioritized.length;

            prioritized.forEach((q, idx) => {
              if (!attemptMap.has(q.id)) {
                lastUnattemptedIdx = idx;
              } else if (attemptMap.get(q.id) === false) {
                if (firstIncorrectIdx === prioritized.length) firstIncorrectIdx = idx;
                lastIncorrectIdx = idx;
              } else {
                if (firstCorrectIdx === prioritized.length) firstCorrectIdx = idx;
              }
            });

            // Unattempted should come before incorrect
            if (lastUnattemptedIdx >= 0 && firstIncorrectIdx < prioritized.length) {
              expect(lastUnattemptedIdx).toBeLessThan(firstIncorrectIdx);
            }

            // Incorrect should come before correct
            if (lastIncorrectIdx >= 0 && firstCorrectIdx < prioritized.length) {
              expect(lastIncorrectIdx).toBeLessThan(firstCorrectIdx);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: beta-ready-improvements, Property 9: Practice Stats Accuracy**
   * *For any* topic and student, the sum of (correct + incorrect + unattempted) SHALL equal totalQuestions.
   * **Validates: Requirements 3.5**
   */
  describe('Property 9: Practice Stats Accuracy', () => {
    it('should have correct + incorrect + unattempted = totalQuestions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // total questions
          fc.array(fc.tuple(fc.uuid(), fc.boolean()), { minLength: 0, maxLength: 50 }), // attempts
          (totalQuestions, attempts) => {
            // Build attempt map (limit to totalQuestions)
            const attemptMap = new Map<string, boolean>();
            attempts.slice(0, totalQuestions).forEach(([id, isCorrect]) => {
              attemptMap.set(id, isCorrect);
            });

            const stats = calculateStats(totalQuestions, attemptMap);

            // The sum should equal total
            expect(stats.correct + stats.incorrect + stats.unattempted).toBe(stats.totalQuestions);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have attempted = correct + incorrect', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.array(fc.tuple(fc.uuid(), fc.boolean()), { minLength: 0, maxLength: 50 }),
          (totalQuestions, attempts) => {
            const attemptMap = new Map<string, boolean>();
            attempts.slice(0, totalQuestions).forEach(([id, isCorrect]) => {
              attemptMap.set(id, isCorrect);
            });

            const stats = calculateStats(totalQuestions, attemptMap);

            expect(stats.attempted).toBe(stats.correct + stats.incorrect);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: beta-ready-improvements, Property 7: Attempt Recording Persistence**
   * Note: This property tests the pure calculation logic. The actual persistence
   * is tested via integration tests with the database.
   * **Validates: Requirements 3.2**
   */
  describe('Property 7: Attempt Recording Persistence', () => {
    it('should correctly count attempts in stats', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          fc.array(fc.boolean(), { minLength: 1, maxLength: 50 }),
          (totalQuestions, attemptResults) => {
            // Create attempt map
            const attemptMap = new Map<string, boolean>();
            attemptResults.slice(0, totalQuestions).forEach((isCorrect, idx) => {
              attemptMap.set(`q-${idx}`, isCorrect);
            });

            const stats = calculateStats(totalQuestions, attemptMap);

            // Attempted count should match map size
            expect(stats.attempted).toBe(attemptMap.size);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
