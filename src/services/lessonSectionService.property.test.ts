/**
 * Lesson Section Service Property Tests
 * 
 * Property-based tests for the comprehensive curriculum content feature.
 * Uses fast-check for generating random test inputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  sortSectionsByDisplayOrder,
  validateContentCompleteness,
  validateNcertRefDisplay,
  validateRememberSectionRendering,
  type LessonSectionData,
  type SectionType,
} from './lessonSectionService';

// =============================================
// ARBITRARIES (Test Data Generators)
// =============================================

const sectionTypeArb = fc.constantFrom<SectionType>(
  'introduction', 'concept', 'example', 'formula', 'remember', 'summary'
);

const lessonSectionArb = fc.record({
  id: fc.uuid(),
  topicId: fc.uuid(),
  sectionType: sectionTypeArb,
  title: fc.string({ minLength: 1, maxLength: 100 }),
  content: fc.string({ minLength: 10, maxLength: 1000 }),
  displayOrder: fc.integer({ min: 0, max: 100 }),
  ncertRef: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
});

// =============================================
// PROPERTY TESTS
// =============================================

describe('Lesson Section Service Properties', () => {
  /**
   * **Feature: comprehensive-curriculum-content, Property 1: Section ordering consistency**
   * *For any* topic, lesson sections should be returned in display_order sequence,
   * and the order should be deterministic across multiple fetches.
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: Section ordering consistency', () => {
    it('should sort sections by display_order in ascending order', () => {
      fc.assert(
        fc.property(
          fc.array(lessonSectionArb, { minLength: 1, maxLength: 20 }),
          (sections) => {
            const sorted = sortSectionsByDisplayOrder(sections);
            
            // Verify sorted order
            for (let i = 1; i < sorted.length; i++) {
              expect(sorted[i].displayOrder).toBeGreaterThanOrEqual(sorted[i - 1].displayOrder);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be deterministic - same input produces same output', () => {
      fc.assert(
        fc.property(
          fc.array(lessonSectionArb, { minLength: 1, maxLength: 20 }),
          (sections) => {
            const sorted1 = sortSectionsByDisplayOrder(sections);
            const sorted2 = sortSectionsByDisplayOrder(sections);
            
            // Same input should produce identical output
            expect(sorted1.map(s => s.id)).toEqual(sorted2.map(s => s.id));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all sections (no data loss)', () => {
      fc.assert(
        fc.property(
          fc.array(lessonSectionArb, { minLength: 1, maxLength: 20 }),
          (sections) => {
            const sorted = sortSectionsByDisplayOrder(sections);
            
            // Same number of sections
            expect(sorted.length).toBe(sections.length);
            
            // All original IDs present
            const originalIds = new Set(sections.map(s => s.id));
            const sortedIds = new Set(sorted.map(s => s.id));
            expect(sortedIds).toEqual(originalIds);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: comprehensive-curriculum-content, Property 2: Content completeness**
   * *For any* topic with lesson sections, there should be at least one introduction
   * section and one summary section.
   * **Validates: Requirements 1.2**
   */
  describe('Property 2: Content completeness', () => {
    it('should validate that complete content has introduction and summary', () => {
      fc.assert(
        fc.property(
          fc.array(lessonSectionArb, { minLength: 2, maxLength: 20 }),
          (baseSections) => {
            // Create a complete set with introduction and summary
            const introSection: LessonSectionData = {
              id: 'intro-id',
              topicId: 'topic-1',
              sectionType: 'introduction',
              title: 'Introduction',
              content: 'Introduction content here',
              displayOrder: 0,
            };
            const summarySection: LessonSectionData = {
              id: 'summary-id',
              topicId: 'topic-1',
              sectionType: 'summary',
              title: 'Summary',
              content: 'Summary content here',
              displayOrder: 100,
            };
            
            const completeSections = [introSection, ...baseSections, summarySection];
            const result = validateContentCompleteness(completeSections);
            
            expect(result.isComplete).toBe(true);
            expect(result.hasIntroduction).toBe(true);
            expect(result.hasSummary).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect missing introduction', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              ...lessonSectionArb.model,
              sectionType: fc.constantFrom<SectionType>('concept', 'example', 'formula', 'remember'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (sections) => {
            // Add only summary, no introduction
            const summarySection: LessonSectionData = {
              id: 'summary-id',
              topicId: 'topic-1',
              sectionType: 'summary',
              title: 'Summary',
              content: 'Summary content',
              displayOrder: 100,
            };
            
            const incompleteSections = [...sections, summarySection];
            const result = validateContentCompleteness(incompleteSections);
            
            expect(result.hasIntroduction).toBe(false);
            expect(result.isComplete).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect missing summary', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              ...lessonSectionArb.model,
              sectionType: fc.constantFrom<SectionType>('concept', 'example', 'formula', 'remember'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (sections) => {
            // Add only introduction, no summary
            const introSection: LessonSectionData = {
              id: 'intro-id',
              topicId: 'topic-1',
              sectionType: 'introduction',
              title: 'Introduction',
              content: 'Introduction content',
              displayOrder: 0,
            };
            
            const incompleteSections = [introSection, ...sections];
            const result = validateContentCompleteness(incompleteSections);
            
            expect(result.hasSummary).toBe(false);
            expect(result.isComplete).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: comprehensive-curriculum-content, Property 3: NCERT reference display**
   * *For any* lesson section or practice question with an ncert_ref field set,
   * the reference should be included in the rendered output.
   * **Validates: Requirements 1.4, 2.4**
   */
  describe('Property 3: NCERT reference display', () => {
    it('should include ncert_ref in rendered output when present', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            topicId: fc.uuid(),
            sectionType: sectionTypeArb,
            title: fc.string({ minLength: 1, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 }),
            displayOrder: fc.integer({ min: 0, max: 100 }),
            ncertRef: fc.string({ minLength: 5, maxLength: 50 }),
          }),
          (section) => {
            const rendered = validateNcertRefDisplay(section);
            
            expect(rendered.hasNcertRef).toBe(true);
            expect(rendered.ncertRefDisplayed).toBe(true);
            expect(rendered.renderedContent).toContain(section.ncertRef);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle sections without ncert_ref gracefully', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            topicId: fc.uuid(),
            sectionType: sectionTypeArb,
            title: fc.string({ minLength: 1, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 }),
            displayOrder: fc.integer({ min: 0, max: 100 }),
          }),
          (section) => {
            const sectionWithoutRef = { ...section, ncertRef: undefined };
            const rendered = validateNcertRefDisplay(sectionWithoutRef);
            
            expect(rendered.hasNcertRef).toBe(false);
            expect(rendered.ncertRefDisplayed).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: comprehensive-curriculum-content, Property 9: Remember section rendering**
   * *For any* lesson section with section_type 'remember', the content should be
   * rendered with callout box styling.
   * **Validates: Requirements 6.2**
   */
  describe('Property 9: Remember section rendering', () => {
    it('should render remember sections with callout styling', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            topicId: fc.uuid(),
            sectionType: fc.constant<SectionType>('remember'),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 }),
            displayOrder: fc.integer({ min: 0, max: 100 }),
          }),
          (section) => {
            const result = validateRememberSectionRendering(section);
            
            expect(result.isRememberSection).toBe(true);
            expect(result.hasCalloutStyling).toBe(true);
            expect(result.styleClass).toContain('callout');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not apply callout styling to non-remember sections', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            topicId: fc.uuid(),
            sectionType: fc.constantFrom<SectionType>('introduction', 'concept', 'example', 'formula', 'summary'),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            content: fc.string({ minLength: 10, maxLength: 500 }),
            displayOrder: fc.integer({ min: 0, max: 100 }),
          }),
          (section) => {
            const result = validateRememberSectionRendering(section);
            
            expect(result.isRememberSection).toBe(false);
            // Non-remember sections should have their own appropriate styling
            expect(result.styleClass).not.toContain('remember-callout');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


// =============================================
// CONTENT COVERAGE PROPERTIES
// =============================================

/**
 * Validate minimum topics per chapter
 * Property 7: Minimum topics per chapter
 */
function validateMinTopicsPerChapter(
  chapters: Array<{ id: string; topicCount: number }>,
  minTopics: number = 3
): { isValid: boolean; failingChapters: string[] } {
  const failingChapters = chapters
    .filter(ch => ch.topicCount < minTopics)
    .map(ch => ch.id);
  
  return {
    isValid: failingChapters.length === 0,
    failingChapters,
  };
}

/**
 * Validate minimum questions per topic
 * Property 8: Minimum questions per topic
 */
function validateMinQuestionsPerTopic(
  topics: Array<{ id: string; questionCount: number }>,
  minQuestions: number = 10
): { isValid: boolean; failingTopics: string[] } {
  const failingTopics = topics
    .filter(t => t.questionCount < minQuestions)
    .map(t => t.id);
  
  return {
    isValid: failingTopics.length === 0,
    failingTopics,
  };
}

describe('Content Coverage Properties', () => {
  /**
   * **Feature: comprehensive-curriculum-content, Property 7: Minimum topics per chapter**
   * *For any* chapter in Class 10 Mathematics or Science, there should be at least
   * 3 topics with lesson content.
   * **Validates: Requirements 4.2, 5.2**
   */
  describe('Property 7: Minimum topics per chapter', () => {
    it('should validate chapters with sufficient topics', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              topicCount: fc.integer({ min: 3, max: 10 }),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (chapters) => {
            const result = validateMinTopicsPerChapter(chapters, 3);
            expect(result.isValid).toBe(true);
            expect(result.failingChapters).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect chapters with insufficient topics', () => {
      const chapters = [
        { id: 'ch1', topicCount: 5 },
        { id: 'ch2', topicCount: 2 }, // Failing
        { id: 'ch3', topicCount: 4 },
        { id: 'ch4', topicCount: 1 }, // Failing
      ];
      
      const result = validateMinTopicsPerChapter(chapters, 3);
      
      expect(result.isValid).toBe(false);
      expect(result.failingChapters).toContain('ch2');
      expect(result.failingChapters).toContain('ch4');
      expect(result.failingChapters).toHaveLength(2);
    });

    it('should pass when all chapters have exactly minimum topics', () => {
      const chapters = [
        { id: 'ch1', topicCount: 3 },
        { id: 'ch2', topicCount: 3 },
        { id: 'ch3', topicCount: 3 },
      ];
      
      const result = validateMinTopicsPerChapter(chapters, 3);
      expect(result.isValid).toBe(true);
    });
  });

  /**
   * **Feature: comprehensive-curriculum-content, Property 8: Minimum questions per topic**
   * *For any* topic with content, there should be at least 10 practice questions.
   * **Validates: Requirements 4.3, 5.3**
   */
  describe('Property 8: Minimum questions per topic', () => {
    it('should validate topics with sufficient questions', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              questionCount: fc.integer({ min: 10, max: 50 }),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (topics) => {
            const result = validateMinQuestionsPerTopic(topics, 10);
            expect(result.isValid).toBe(true);
            expect(result.failingTopics).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect topics with insufficient questions', () => {
      const topics = [
        { id: 't1', questionCount: 15 },
        { id: 't2', questionCount: 5 }, // Failing
        { id: 't3', questionCount: 12 },
        { id: 't4', questionCount: 8 }, // Failing
      ];
      
      const result = validateMinQuestionsPerTopic(topics, 10);
      
      expect(result.isValid).toBe(false);
      expect(result.failingTopics).toContain('t2');
      expect(result.failingTopics).toContain('t4');
      expect(result.failingTopics).toHaveLength(2);
    });

    it('should pass when all topics have exactly minimum questions', () => {
      const topics = [
        { id: 't1', questionCount: 10 },
        { id: 't2', questionCount: 10 },
        { id: 't3', questionCount: 10 },
      ];
      
      const result = validateMinQuestionsPerTopic(topics, 10);
      expect(result.isValid).toBe(true);
    });

    it('should handle empty topic array', () => {
      const result = validateMinQuestionsPerTopic([], 10);
      expect(result.isValid).toBe(true);
      expect(result.failingTopics).toHaveLength(0);
    });
  });
});
