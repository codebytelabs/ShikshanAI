/**
 * Lesson Section Service Unit Tests
 * Requirements: 1.1, 1.2
 */

import { describe, it, expect } from 'vitest';
import {
  sortSectionsByDisplayOrder,
  validateContentCompleteness,
  getSectionStyleClass,
  getSectionIcon,
  renderSectionContent,
  type LessonSectionData,
  type SectionType,
} from './lessonSectionService';

describe('lessonSectionService', () => {
  describe('sortSectionsByDisplayOrder', () => {
    it('should sort sections by display_order ascending', () => {
      const sections: LessonSectionData[] = [
        { id: '3', topicId: 't1', sectionType: 'summary', title: 'Summary', content: 'c', displayOrder: 30 },
        { id: '1', topicId: 't1', sectionType: 'introduction', title: 'Intro', content: 'c', displayOrder: 10 },
        { id: '2', topicId: 't1', sectionType: 'concept', title: 'Concept', content: 'c', displayOrder: 20 },
      ];

      const sorted = sortSectionsByDisplayOrder(sections);

      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('2');
      expect(sorted[2].id).toBe('3');
    });

    it('should handle empty array', () => {
      const sorted = sortSectionsByDisplayOrder([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single section', () => {
      const sections: LessonSectionData[] = [
        { id: '1', topicId: 't1', sectionType: 'introduction', title: 'Intro', content: 'c', displayOrder: 0 },
      ];

      const sorted = sortSectionsByDisplayOrder(sections);
      expect(sorted.length).toBe(1);
      expect(sorted[0].id).toBe('1');
    });

    it('should not mutate original array', () => {
      const sections: LessonSectionData[] = [
        { id: '2', topicId: 't1', sectionType: 'concept', title: 'Concept', content: 'c', displayOrder: 20 },
        { id: '1', topicId: 't1', sectionType: 'introduction', title: 'Intro', content: 'c', displayOrder: 10 },
      ];

      const sorted = sortSectionsByDisplayOrder(sections);

      expect(sections[0].id).toBe('2'); // Original unchanged
      expect(sorted[0].id).toBe('1'); // Sorted correctly
    });
  });

  describe('validateContentCompleteness', () => {
    it('should return complete when both introduction and summary exist', () => {
      const sections: LessonSectionData[] = [
        { id: '1', topicId: 't1', sectionType: 'introduction', title: 'Intro', content: 'c', displayOrder: 0 },
        { id: '2', topicId: 't1', sectionType: 'concept', title: 'Concept', content: 'c', displayOrder: 10 },
        { id: '3', topicId: 't1', sectionType: 'summary', title: 'Summary', content: 'c', displayOrder: 20 },
      ];

      const result = validateContentCompleteness(sections);

      expect(result.isComplete).toBe(true);
      expect(result.hasIntroduction).toBe(true);
      expect(result.hasSummary).toBe(true);
      expect(result.missingTypes).toEqual([]);
    });

    it('should detect missing introduction', () => {
      const sections: LessonSectionData[] = [
        { id: '1', topicId: 't1', sectionType: 'concept', title: 'Concept', content: 'c', displayOrder: 0 },
        { id: '2', topicId: 't1', sectionType: 'summary', title: 'Summary', content: 'c', displayOrder: 10 },
      ];

      const result = validateContentCompleteness(sections);

      expect(result.isComplete).toBe(false);
      expect(result.hasIntroduction).toBe(false);
      expect(result.hasSummary).toBe(true);
      expect(result.missingTypes).toContain('introduction');
    });

    it('should detect missing summary', () => {
      const sections: LessonSectionData[] = [
        { id: '1', topicId: 't1', sectionType: 'introduction', title: 'Intro', content: 'c', displayOrder: 0 },
        { id: '2', topicId: 't1', sectionType: 'concept', title: 'Concept', content: 'c', displayOrder: 10 },
      ];

      const result = validateContentCompleteness(sections);

      expect(result.isComplete).toBe(false);
      expect(result.hasIntroduction).toBe(true);
      expect(result.hasSummary).toBe(false);
      expect(result.missingTypes).toContain('summary');
    });

    it('should handle empty sections array', () => {
      const result = validateContentCompleteness([]);

      expect(result.isComplete).toBe(false);
      expect(result.hasIntroduction).toBe(false);
      expect(result.hasSummary).toBe(false);
      expect(result.missingTypes).toContain('introduction');
      expect(result.missingTypes).toContain('summary');
    });
  });

  describe('getSectionStyleClass', () => {
    it('should return correct style for introduction', () => {
      const style = getSectionStyleClass('introduction');
      expect(style).toContain('blue');
    });

    it('should return correct style for remember (callout)', () => {
      const style = getSectionStyleClass('remember');
      expect(style).toContain('yellow');
      expect(style).toContain('callout');
    });

    it('should return correct style for formula', () => {
      const style = getSectionStyleClass('formula');
      expect(style).toContain('purple');
      expect(style).toContain('font-mono');
    });

    it('should return correct style for summary', () => {
      const style = getSectionStyleClass('summary');
      expect(style).toContain('green');
    });
  });

  describe('getSectionIcon', () => {
    const expectedIcons: Record<SectionType, string> = {
      introduction: '📖',
      concept: '💡',
      example: '✏️',
      formula: '📐',
      remember: '⭐',
      summary: '📝',
    };

    Object.entries(expectedIcons).forEach(([type, icon]) => {
      it(`should return ${icon} for ${type}`, () => {
        expect(getSectionIcon(type as SectionType)).toBe(icon);
      });
    });
  });

  describe('renderSectionContent', () => {
    it('should include NCERT reference when present', () => {
      const section: LessonSectionData = {
        id: '1',
        topicId: 't1',
        sectionType: 'concept',
        title: 'Test',
        content: 'Main content here',
        displayOrder: 0,
        ncertRef: 'NCERT Class 10 Math, p. 5',
      };

      const rendered = renderSectionContent(section);

      expect(rendered).toContain('Main content here');
      expect(rendered).toContain('NCERT Class 10 Math, p. 5');
      expect(rendered).toContain('Reference');
    });

    it('should not add reference section when ncertRef is missing', () => {
      const section: LessonSectionData = {
        id: '1',
        topicId: 't1',
        sectionType: 'concept',
        title: 'Test',
        content: 'Main content here',
        displayOrder: 0,
      };

      const rendered = renderSectionContent(section);

      expect(rendered).toBe('Main content here');
      expect(rendered).not.toContain('Reference');
    });
  });
});
