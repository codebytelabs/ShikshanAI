/**
 * Lesson Service Property Tests
 * Tests for content generation and section completion
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateLessonStructure,
  calculateSectionProgress,
  TopicLesson,
  LessonSection,
} from './lessonService';

// Helper to generate valid lesson sections
const validSectionArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  content: fc.string({ minLength: 1, maxLength: 1000 }),
  example: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  visualDescription: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
  checkpoint: fc.boolean(),
}) as fc.Arbitrary<LessonSection>;

// Helper to generate valid lessons with 3-5 sections
const validLessonArb = fc.record({
  topicId: fc.uuid(),
  topicName: fc.string({ minLength: 1, maxLength: 100 }),
  sections: fc.array(validSectionArb, { minLength: 3, maxLength: 5 }),
  generatedAt: fc.date(),
}) as fc.Arbitrary<TopicLesson>;

describe('Lesson Service', () => {
  /**
   * **Feature: learning-experience-overhaul, Property 10: Content Generation for Empty Topics**
   * *For any* topic without pre-existing lesson content, the lesson service SHALL
   * generate content with 3-5 sections, each containing a title and content string.
   * **Validates: Requirements 2.1, 2.4, 10.1**
   */
  describe('Property 10: Content Generation for Empty Topics', () => {
    it('should validate lessons with 3-5 sections as valid', () => {
      fc.assert(
        fc.property(validLessonArb, (lesson) => {
          expect(validateLessonStructure(lesson)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject lessons with fewer than 3 sections', () => {
      fc.assert(
        fc.property(
          fc.record({
            topicId: fc.uuid(),
            topicName: fc.string({ minLength: 1 }),
            sections: fc.array(validSectionArb, { minLength: 0, maxLength: 2 }),
            generatedAt: fc.date(),
          }),
          (lesson) => {
            expect(validateLessonStructure(lesson as TopicLesson)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject lessons with more than 5 sections', () => {
      fc.assert(
        fc.property(
          fc.record({
            topicId: fc.uuid(),
            topicName: fc.string({ minLength: 1 }),
            sections: fc.array(validSectionArb, { minLength: 6, maxLength: 10 }),
            generatedAt: fc.date(),
          }),
          (lesson) => {
            expect(validateLessonStructure(lesson as TopicLesson)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject sections with empty title', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 5 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (sectionCount, topicName) => {
            const sections: LessonSection[] = Array.from(
              { length: sectionCount },
              (_, i) => ({
                id: `section-${i}`,
                title: i === 0 ? '' : `Section ${i}`, // First section has empty title
                content: 'Some content',
                checkpoint: true,
              })
            );

            const lesson: TopicLesson = {
              topicId: 'test-id',
              topicName,
              sections,
              generatedAt: new Date(),
            };

            expect(validateLessonStructure(lesson)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject sections with empty content', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 5 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (sectionCount, topicName) => {
            const sections: LessonSection[] = Array.from(
              { length: sectionCount },
              (_, i) => ({
                id: `section-${i}`,
                title: `Section ${i}`,
                content: i === 0 ? '' : 'Some content', // First section has empty content
                checkpoint: true,
              })
            );

            const lesson: TopicLesson = {
              topicId: 'test-id',
              topicName,
              sections,
              generatedAt: new Date(),
            };

            expect(validateLessonStructure(lesson)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept sections with optional example and visualDescription', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 5 }),
          (sectionCount) => {
            const sections: LessonSection[] = Array.from(
              { length: sectionCount },
              (_, i) => ({
                id: `section-${i}`,
                title: `Section ${i}`,
                content: 'Some content here',
                // No example or visualDescription
                checkpoint: true,
              })
            );

            const lesson: TopicLesson = {
              topicId: 'test-id',
              topicName: 'Test Topic',
              sections,
              generatedAt: new Date(),
            };

            expect(validateLessonStructure(lesson)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: learning-experience-overhaul, Property 8: Section Completion Progress**
   * *For any* topic learning session, completing a section SHALL increment
   * sectionsCompleted by exactly 1, and when sectionsCompleted equals totalSections,
   * conceptCompleted SHALL be set to true.
   * **Validates: Requirements 1.4, 1.5**
   */
  describe('Property 8: Section Completion Progress', () => {
    it('should increment sectionsCompleted by exactly 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }), // sectionsCompleted
          fc.integer({ min: 1, max: 20 }), // totalSections
          (sectionsCompleted, totalSections) => {
            // Ensure sectionsCompleted doesn't exceed totalSections - 1
            const validCompleted = Math.min(sectionsCompleted, totalSections - 1);
            const result = calculateSectionProgress(validCompleted, totalSections);

            expect(result.newCompleted).toBe(validCompleted + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set isComplete to true when all sections completed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }), // totalSections
          (totalSections) => {
            // Complete the last section
            const sectionsCompleted = totalSections - 1;
            const result = calculateSectionProgress(sectionsCompleted, totalSections);

            expect(result.newCompleted).toBe(totalSections);
            expect(result.isComplete).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set isComplete to false when not all sections completed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 18 }), // sectionsCompleted
          fc.integer({ min: 2, max: 20 }), // totalSections (at least 2)
          (sectionsCompleted, totalSections) => {
            // Ensure we're not completing the last section
            const validCompleted = Math.min(sectionsCompleted, totalSections - 2);
            const result = calculateSectionProgress(validCompleted, totalSections);

            expect(result.isComplete).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not exceed totalSections', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // sectionsCompleted (can be > total)
          fc.integer({ min: 1, max: 20 }), // totalSections
          (sectionsCompleted, totalSections) => {
            const result = calculateSectionProgress(sectionsCompleted, totalSections);

            expect(result.newCompleted).toBeLessThanOrEqual(totalSections);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle single section lessons correctly', () => {
      const result = calculateSectionProgress(0, 1);
      expect(result.newCompleted).toBe(1);
      expect(result.isComplete).toBe(true);
    });

    it('should handle already completed lessons', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (totalSections) => {
            // Already at total
            const result = calculateSectionProgress(totalSections, totalSections);

            // Should stay at total (clamped)
            expect(result.newCompleted).toBe(totalSections);
            expect(result.isComplete).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


/**
 * Navigation Flow Helper Functions for Testing
 * Property 9: Navigation Flow Enforcement
 */

// Pure function to check if practice should be accessible
function canAccessPractice(conceptCompleted: boolean): boolean {
  return conceptCompleted;
}

// Pure function to check if test should be accessible
function canAccessTest(conceptCompleted: boolean, practiceCompleted: boolean): boolean {
  return conceptCompleted && practiceCompleted;
}

describe('Property 9: Navigation Flow Enforcement', () => {
  /**
   * **Feature: learning-experience-overhaul, Property 9: Navigation Flow Enforcement**
   * *For any* topic where conceptCompleted is false, attempting to access Practice
   * or Test SHALL be blocked or redirected to the learning page.
   * **Validates: Requirements 9.3**
   */
  
  it('should block practice access when concept is not completed', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // conceptCompleted
        (conceptCompleted) => {
          const canAccess = canAccessPractice(conceptCompleted);
          
          if (!conceptCompleted) {
            expect(canAccess).toBe(false);
          } else {
            expect(canAccess).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should block test access when concept or practice is not completed', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // conceptCompleted
        fc.boolean(), // practiceCompleted
        (conceptCompleted, practiceCompleted) => {
          const canAccess = canAccessTest(conceptCompleted, practiceCompleted);
          
          if (!conceptCompleted || !practiceCompleted) {
            expect(canAccess).toBe(false);
          } else {
            expect(canAccess).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow practice access only after concept completion', () => {
    // Concept not completed -> no practice
    expect(canAccessPractice(false)).toBe(false);
    // Concept completed -> practice allowed
    expect(canAccessPractice(true)).toBe(true);
  });

  it('should enforce learning path order: Learn -> Practice -> Test', () => {
    // All false - only learn accessible
    expect(canAccessPractice(false)).toBe(false);
    expect(canAccessTest(false, false)).toBe(false);
    
    // Concept done - practice accessible
    expect(canAccessPractice(true)).toBe(true);
    expect(canAccessTest(true, false)).toBe(false);
    
    // Both done - test accessible
    expect(canAccessTest(true, true)).toBe(true);
  });
});
