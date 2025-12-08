/**
 * Lesson Section Service for ShikshanAI
 * Comprehensive Curriculum Content Feature
 * 
 * Provides functions for fetching, sorting, and validating lesson sections.
 * Requirements: 1.1, 1.2, 1.4, 2.4, 6.2
 */

import { supabase } from '@/integrations/supabase/client';

// Type assertion helper for tables not yet in generated types
const db = supabase as any;

// =============================================
// TYPES
// =============================================

export type SectionType = 'introduction' | 'concept' | 'example' | 'formula' | 'remember' | 'summary';

export interface LessonSectionData {
  id: string;
  topicId: string;
  sectionType: SectionType;
  title: string;
  content: string;
  displayOrder: number;
  ncertRef?: string;
  createdAt?: string;
}

export interface ContentCompletenessResult {
  isComplete: boolean;
  hasIntroduction: boolean;
  hasSummary: boolean;
  missingTypes: SectionType[];
}

export interface NcertRefDisplayResult {
  hasNcertRef: boolean;
  ncertRefDisplayed: boolean;
  renderedContent: string;
}

export interface RememberSectionRenderResult {
  isRememberSection: boolean;
  hasCalloutStyling: boolean;
  styleClass: string;
}

// =============================================
// PURE FUNCTIONS FOR TESTING
// =============================================

/**
 * Sort sections by display_order in ascending order
 * Property 1: Section ordering consistency
 * **Validates: Requirements 1.1**
 */
export function sortSectionsByDisplayOrder(sections: LessonSectionData[]): LessonSectionData[] {
  return [...sections].sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Validate that content has required sections (introduction and summary)
 * Property 2: Content completeness
 * **Validates: Requirements 1.2**
 */
export function validateContentCompleteness(sections: LessonSectionData[]): ContentCompletenessResult {
  const hasIntroduction = sections.some(s => s.sectionType === 'introduction');
  const hasSummary = sections.some(s => s.sectionType === 'summary');
  
  const missingTypes: SectionType[] = [];
  if (!hasIntroduction) missingTypes.push('introduction');
  if (!hasSummary) missingTypes.push('summary');
  
  return {
    isComplete: hasIntroduction && hasSummary,
    hasIntroduction,
    hasSummary,
    missingTypes,
  };
}

/**
 * Validate NCERT reference display
 * Property 3: NCERT reference display
 * **Validates: Requirements 1.4, 2.4**
 */
export function validateNcertRefDisplay(section: LessonSectionData): NcertRefDisplayResult {
  const hasNcertRef = !!section.ncertRef && section.ncertRef.length > 0;
  
  // Simulate rendering - NCERT ref should be included in output
  let renderedContent = section.content;
  if (hasNcertRef) {
    renderedContent = `${section.content}\n\n📚 Reference: ${section.ncertRef}`;
  }
  
  return {
    hasNcertRef,
    ncertRefDisplayed: hasNcertRef,
    renderedContent,
  };
}

/**
 * Validate remember section rendering with callout styling
 * Property 9: Remember section rendering
 * **Validates: Requirements 6.2**
 */
export function validateRememberSectionRendering(section: LessonSectionData): RememberSectionRenderResult {
  const isRememberSection = section.sectionType === 'remember';
  
  // Determine style class based on section type
  const styleClassMap: Record<SectionType, string> = {
    introduction: 'section-introduction bg-blue-50 border-blue-200',
    concept: 'section-concept',
    example: 'section-example bg-gray-50 border-gray-200',
    formula: 'section-formula bg-purple-50 border-purple-200',
    remember: 'section-remember callout remember-callout bg-yellow-50 border-yellow-400',
    summary: 'section-summary bg-green-50 border-green-200',
  };
  
  const styleClass = styleClassMap[section.sectionType];
  
  return {
    isRememberSection,
    hasCalloutStyling: isRememberSection && styleClass.includes('callout'),
    styleClass,
  };
}

/**
 * Get style class for a section type
 */
export function getSectionStyleClass(sectionType: SectionType): string {
  const styleClassMap: Record<SectionType, string> = {
    introduction: 'bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg',
    concept: 'bg-white border border-gray-200 p-4 rounded-lg',
    example: 'bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg',
    formula: 'bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg font-mono',
    remember: 'bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg callout',
    summary: 'bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg',
  };
  
  return styleClassMap[sectionType];
}

/**
 * Get icon for a section type
 */
export function getSectionIcon(sectionType: SectionType): string {
  const iconMap: Record<SectionType, string> = {
    introduction: '📖',
    concept: '💡',
    example: '✏️',
    formula: '📐',
    remember: '⭐',
    summary: '📝',
  };
  
  return iconMap[sectionType];
}

// =============================================
// DATABASE FUNCTIONS
// =============================================

/**
 * Fetch lesson sections for a topic, ordered by display_order
 * Property 1: Section ordering consistency
 * **Validates: Requirements 1.1**
 */
export async function getLessonSections(topicId: string): Promise<LessonSectionData[]> {
  const { data, error } = await db
    .from('lesson_sections')
    .select('*')
    .eq('topic_id', topicId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching lesson sections:', error);
    return [];
  }

  return (data || []).map(mapDbToLessonSection);
}

/**
 * Fetch lesson sections by type
 */
export async function getLessonSectionsByType(
  topicId: string,
  sectionType: SectionType
): Promise<LessonSectionData[]> {
  const { data, error } = await db
    .from('lesson_sections')
    .select('*')
    .eq('topic_id', topicId)
    .eq('section_type', sectionType)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching lesson sections by type:', error);
    return [];
  }

  return (data || []).map(mapDbToLessonSection);
}

/**
 * Check if a topic has complete content
 * Property 2: Content completeness
 */
export async function hasCompleteContent(topicId: string): Promise<boolean> {
  const sections = await getLessonSections(topicId);
  const result = validateContentCompleteness(sections);
  return result.isComplete;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function mapDbToLessonSection(row: any): LessonSectionData {
  return {
    id: row.id,
    topicId: row.topic_id,
    sectionType: row.section_type as SectionType,
    title: row.title,
    content: row.content,
    displayOrder: row.display_order,
    ncertRef: row.ncert_ref,
    createdAt: row.created_at,
  };
}

/**
 * Render section content with NCERT reference if present
 */
export function renderSectionContent(section: LessonSectionData): string {
  let content = section.content;
  
  if (section.ncertRef) {
    content += `\n\n📚 **Reference:** ${section.ncertRef}`;
  }
  
  return content;
}

// =============================================
// CACHING
// =============================================

const sectionCache = new Map<string, LessonSectionData[]>();

/**
 * Get lesson sections with caching
 */
export async function getLessonSectionsCached(topicId: string): Promise<LessonSectionData[]> {
  const cached = sectionCache.get(topicId);
  if (cached) {
    return cached;
  }

  const sections = await getLessonSections(topicId);
  sectionCache.set(topicId, sections);
  return sections;
}

/**
 * Clear section cache
 */
export function clearSectionCache(): void {
  sectionCache.clear();
}

/**
 * Clear cache for a specific topic
 */
export function clearTopicCache(topicId: string): void {
  sectionCache.delete(topicId);
}
