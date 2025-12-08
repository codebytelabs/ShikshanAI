/**
 * Lesson Service for ShikshanAI
 * Implements AI-powered lesson generation and section tracking
 * Requirements: 1.1-1.8, 2.1-2.5
 */

import { supabase } from '@/integrations/supabase/client';
import { sendMessage, StudentContext } from './aiTutorService';

// Type assertion helper for tables not yet in generated types
const db = supabase as any;

// =============================================
// INTERFACES
// =============================================

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  example?: string;
  visualDescription?: string;
  checkpoint: boolean;
}

export interface TopicLesson {
  topicId: string;
  topicName: string;
  sections: LessonSection[];
  generatedAt: Date;
}

export interface LessonContext {
  gradeName: string;
  subjectName: string;
  chapterName: string;
  topicName: string;
}

export interface TopicLearningProgress {
  id: string;
  studentId: string;
  topicId: string;
  sectionsCompleted: number;
  totalSections: number;
  conceptCompleted: boolean;
  completedAt: string | null;
}

// =============================================
// LESSON GENERATION
// =============================================

/**
 * Generate lesson content using AI
 * Property 10: Content Generation for Empty Topics
 * For any topic without pre-existing content, SHALL generate content
 * with 3-5 sections, each containing a title and content string.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 * @param topicId - The topic's ID
 * @param context - Lesson context with grade, subject, chapter, topic
 * @returns Generated lesson with sections
 */
export async function generateLesson(
  topicId: string,
  context: LessonContext
): Promise<TopicLesson> {
  const prompt = buildLessonPrompt(context);

  const studentContext: StudentContext = {
    gradeName: context.gradeName,
    subjectName: context.subjectName,
    chapterName: context.chapterName,
    topicName: context.topicName,
  };

  try {
    const response = await sendMessage(
      [{ role: 'user', content: prompt }],
      studentContext
    );

    const sections = parseLessonResponse(response, context.topicName);

    return {
      topicId,
      topicName: context.topicName,
      sections,
      generatedAt: new Date(),
    };
  } catch (error) {
    // Return fallback content if AI fails
    console.error('Failed to generate lesson:', error);
    return createFallbackLesson(topicId, context.topicName);
  }
}

/**
 * Build the prompt for lesson generation
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */
function buildLessonPrompt(context: LessonContext): string {
  return `Create an educational lesson for a ${context.gradeName} student on the topic "${context.topicName}" from the chapter "${context.chapterName}" in ${context.subjectName}.

Requirements:
1. Create exactly 4 sections that progressively build understanding
2. Each section should have a clear title and detailed explanation
3. Include at least one real-world example relevant to Indian students
4. Use simple, age-appropriate language
5. Follow CBSE/NCERT curriculum guidelines

Format your response EXACTLY like this (use these exact markers):

[SECTION 1]
TITLE: Introduction to ${context.topicName}
CONTENT: (2-3 paragraphs explaining the basic concept)
EXAMPLE: (A relatable real-world example)

[SECTION 2]
TITLE: Understanding the Key Concepts
CONTENT: (2-3 paragraphs going deeper into the topic)
EXAMPLE: (Another practical example)

[SECTION 3]
TITLE: Step-by-Step Process
CONTENT: (Detailed walkthrough of how to apply the concept)
EXAMPLE: (Worked example with steps)

[SECTION 4]
TITLE: Summary and Key Points
CONTENT: (Recap of main points and important formulas/rules)
EXAMPLE: (Quick practice scenario)

Make the content engaging and easy to understand for a ${context.gradeName} student.`;
}

/**
 * Parse AI response into lesson sections
 * Property 10: Each section must have title and content
 */
function parseLessonResponse(response: string, topicName: string): LessonSection[] {
  const sections: LessonSection[] = [];
  const sectionRegex = /\[SECTION \d+\]\s*TITLE:\s*(.+?)\s*CONTENT:\s*([\s\S]+?)(?:EXAMPLE:\s*([\s\S]+?))?(?=\[SECTION|\s*$)/gi;

  let match;
  let sectionIndex = 0;

  while ((match = sectionRegex.exec(response)) !== null) {
    sectionIndex++;
    sections.push({
      id: `section-${sectionIndex}`,
      title: match[1].trim(),
      content: match[2].trim(),
      example: match[3]?.trim(),
      checkpoint: true, // All sections have checkpoints
    });
  }

  // If parsing failed, create sections from raw content
  if (sections.length === 0) {
    return createSectionsFromRawContent(response, topicName);
  }

  // Ensure we have at least 3 sections
  while (sections.length < 3) {
    sections.push({
      id: `section-${sections.length + 1}`,
      title: `Part ${sections.length + 1}`,
      content: 'Content is being prepared...',
      checkpoint: true,
    });
  }

  return sections;
}

/**
 * Create sections from raw content when parsing fails
 */
function createSectionsFromRawContent(content: string, topicName: string): LessonSection[] {
  // Split content into roughly equal parts
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);

  if (paragraphs.length >= 3) {
    return [
      {
        id: 'section-1',
        title: `Introduction to ${topicName}`,
        content: paragraphs.slice(0, Math.ceil(paragraphs.length / 3)).join('\n\n'),
        checkpoint: true,
      },
      {
        id: 'section-2',
        title: 'Key Concepts',
        content: paragraphs.slice(Math.ceil(paragraphs.length / 3), Math.ceil(2 * paragraphs.length / 3)).join('\n\n'),
        checkpoint: true,
      },
      {
        id: 'section-3',
        title: 'Summary',
        content: paragraphs.slice(Math.ceil(2 * paragraphs.length / 3)).join('\n\n'),
        checkpoint: true,
      },
    ];
  }

  // Fallback to single section
  return [
    {
      id: 'section-1',
      title: `Understanding ${topicName}`,
      content: content || 'Content is being prepared...',
      checkpoint: true,
    },
  ];
}

/**
 * Create fallback lesson when AI generation fails
 */
function createFallbackLesson(topicId: string, topicName: string): TopicLesson {
  return {
    topicId,
    topicName,
    sections: [
      {
        id: 'section-1',
        title: `Introduction to ${topicName}`,
        content: `Welcome to the lesson on ${topicName}. This topic is an important part of your curriculum. Let's explore the key concepts together.`,
        checkpoint: true,
      },
      {
        id: 'section-2',
        title: 'Key Concepts',
        content: `In this section, we'll dive deeper into ${topicName}. Understanding these concepts will help you solve problems and apply your knowledge.`,
        checkpoint: true,
      },
      {
        id: 'section-3',
        title: 'Practice and Summary',
        content: `Now that you've learned about ${topicName}, let's review the key points. Remember to practice regularly to strengthen your understanding.`,
        checkpoint: true,
      },
    ],
    generatedAt: new Date(),
  };
}

// =============================================
// LESSON CACHING AND RETRIEVAL
// =============================================

// In-memory cache for lessons (could be moved to IndexedDB for persistence)
const lessonCache = new Map<string, TopicLesson>();

/**
 * Get lesson for a topic (from cache or generate new)
 * Requirements: 1.1, 1.8
 * @param topicId - The topic's ID
 * @param context - Lesson context
 * @returns Lesson content
 */
export async function getLesson(
  topicId: string,
  context: LessonContext
): Promise<TopicLesson> {
  // Check cache first
  const cached = lessonCache.get(topicId);
  if (cached) {
    return cached;
  }

  // Generate new lesson
  const lesson = await generateLesson(topicId, context);

  // Cache the lesson
  lessonCache.set(topicId, lesson);

  return lesson;
}

/**
 * Clear lesson cache (useful for testing or forcing regeneration)
 */
export function clearLessonCache(): void {
  lessonCache.clear();
}

// =============================================
// SECTION COMPLETION TRACKING
// =============================================

/**
 * Get learning progress for a topic
 * @param studentId - The student's ID
 * @param topicId - The topic's ID
 * @returns Learning progress or null
 */
export async function getLearningProgress(
  studentId: string,
  topicId: string
): Promise<TopicLearningProgress | null> {
  const { data, error } = await db
    .from('student_topic_learning')
    .select('*')
    .eq('student_id', studentId)
    .eq('topic_id', topicId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    studentId: data.student_id,
    topicId: data.topic_id,
    sectionsCompleted: data.sections_completed,
    totalSections: data.total_sections,
    conceptCompleted: data.concept_completed,
    completedAt: data.completed_at,
  };
}

/**
 * Complete a section in a lesson
 * Property 8: Section Completion Progress
 * Completing a section SHALL increment sectionsCompleted by exactly 1
 * When sectionsCompleted equals totalSections, conceptCompleted SHALL be true
 * 
 * Requirements: 1.4, 1.5
 * @param studentId - The student's ID
 * @param topicId - The topic's ID
 * @param totalSections - Total number of sections in the lesson
 * @returns Updated progress
 */
export async function completeSection(
  studentId: string,
  topicId: string,
  totalSections: number
): Promise<TopicLearningProgress> {
  const existing = await getLearningProgress(studentId, topicId);

  if (existing) {
    const newSectionsCompleted = Math.min(
      existing.sectionsCompleted + 1,
      totalSections
    );
    const conceptCompleted = newSectionsCompleted >= totalSections;

    const updates: any = {
      sections_completed: newSectionsCompleted,
      total_sections: totalSections,
      concept_completed: conceptCompleted,
      updated_at: new Date().toISOString(),
    };

    if (conceptCompleted && !existing.completedAt) {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await db
      .from('student_topic_learning')
      .update(updates)
      .eq('student_id', studentId)
      .eq('topic_id', topicId);

    if (error) {
      throw new Error(`Failed to update section progress: ${error.message}`);
    }

    return {
      ...existing,
      sectionsCompleted: newSectionsCompleted,
      totalSections,
      conceptCompleted,
      completedAt: conceptCompleted ? updates.completed_at : existing.completedAt,
    };
  }

  // Create new progress record
  const { data, error } = await db
    .from('student_topic_learning')
    .insert({
      student_id: studentId,
      topic_id: topicId,
      sections_completed: 1,
      total_sections: totalSections,
      concept_completed: totalSections === 1,
      completed_at: totalSections === 1 ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create learning progress: ${error.message}`);
  }

  return {
    id: data.id,
    studentId: data.student_id,
    topicId: data.topic_id,
    sectionsCompleted: data.sections_completed,
    totalSections: data.total_sections,
    conceptCompleted: data.concept_completed,
    completedAt: data.completed_at,
  };
}

/**
 * Check if concept learning is complete for a topic
 * @param studentId - The student's ID
 * @param topicId - The topic's ID
 * @returns true if concept learning is complete
 */
export async function isConceptComplete(
  studentId: string,
  topicId: string
): Promise<boolean> {
  const progress = await getLearningProgress(studentId, topicId);
  return progress?.conceptCompleted ?? false;
}

// =============================================
// PURE FUNCTIONS FOR TESTING
// =============================================

/**
 * Validate lesson structure
 * Property 10: Content Generation for Empty Topics
 * Lesson must have 3-5 sections, each with title and content
 */
export function validateLessonStructure(lesson: TopicLesson): boolean {
  if (!lesson.sections || lesson.sections.length < 3 || lesson.sections.length > 5) {
    return false;
  }

  return lesson.sections.every(
    section => section.title && section.title.length > 0 && section.content && section.content.length > 0
  );
}

/**
 * Calculate section completion progress
 * Property 8: Section Completion Progress
 */
export function calculateSectionProgress(
  sectionsCompleted: number,
  totalSections: number
): { newCompleted: number; isComplete: boolean } {
  const newCompleted = Math.min(sectionsCompleted + 1, totalSections);
  return {
    newCompleted,
    isComplete: newCompleted >= totalSections,
  };
}
