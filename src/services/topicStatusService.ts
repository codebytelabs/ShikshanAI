/**
 * Topic Status Service
 * 
 * Provides a simplified status-based progress system for topics.
 * Replaces the confusing dual progress/mastery system with clear statuses.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * The four possible statuses for a topic
 * Requirements: 1.1
 */
export type TopicStatus = 'not_started' | 'learning' | 'practice' | 'completed';

/**
 * Icon types for visual representation of topic status
 * Requirements: 3.1
 */
export type IconType = 'empty' | 'half' | 'check';

/**
 * Complete progress information for a topic
 * Requirements: 1.1, 3.1, 3.2, 3.3
 */
export interface TopicProgressInfo {
  status: TopicStatus;
  progress: number; // 0-100
  displayText: string;
  actionText: string | null;
  iconType: IconType;
}

/**
 * Input data for calculating topic status
 * Requirements: 1.1
 */
export interface StatusInput {
  sectionsCompleted: number;
  totalSections: number;
  questionsAttempted: number;
  minQuestionsRequired?: number; // Default: 3
}

/**
 * Progress information for a chapter
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export interface ChapterProgressInfo {
  completedTopics: number;
  totalTopics: number;
  progress: number; // 0-100
  displayText: string;
}


// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MIN_QUESTIONS = 3;
const DEFAULT_TOTAL_SECTIONS = 4;

// ============================================================================
// Status Calculation Functions
// ============================================================================

/**
 * Normalize input values to handle invalid/negative inputs
 * @internal
 */
function normalizeInput(input: StatusInput): Required<StatusInput> {
  return {
    sectionsCompleted: Math.max(0, input.sectionsCompleted ?? 0),
    totalSections: Math.max(1, input.totalSections ?? DEFAULT_TOTAL_SECTIONS),
    questionsAttempted: Math.max(0, input.questionsAttempted ?? 0),
    // Allow 0 for minQuestionsRequired (topics with no practice questions)
    minQuestionsRequired: Math.max(0, input.minQuestionsRequired ?? DEFAULT_MIN_QUESTIONS),
  };
}

/**
 * Determine the status of a topic based on learning progress
 * 
 * Status rules:
 * - 'not_started': sectionsCompleted = 0 AND questionsAttempted = 0
 * - 'learning': sectionsCompleted > 0 but < totalSections
 * - 'practice': sectionsCompleted = totalSections but questionsAttempted < minQuestionsRequired
 * - 'completed': sectionsCompleted = totalSections AND questionsAttempted >= minQuestionsRequired
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export function calculateTopicStatus(input: StatusInput): TopicStatus {
  const normalized = normalizeInput(input);
  const { sectionsCompleted, totalSections, questionsAttempted, minQuestionsRequired } = normalized;

  // Not started: no sections and no questions
  if (sectionsCompleted === 0 && questionsAttempted === 0) {
    return 'not_started';
  }

  // Completed: all sections done AND enough questions attempted
  if (sectionsCompleted >= totalSections && questionsAttempted >= minQuestionsRequired) {
    return 'completed';
  }

  // Practice: all sections done but not enough questions
  if (sectionsCompleted >= totalSections) {
    return 'practice';
  }

  // Learning: some sections done but not all
  return 'learning';
}


/**
 * Calculate progress percentage based on topic status and sections completed
 * 
 * Progress rules:
 * - not_started: 0%
 * - learning: 12.5% per section (up to 37.5% at 3/4 sections)
 * - practice: 50%
 * - completed: 100%
 * 
 * Requirements: 1.3, 1.4, 1.5
 */
export function calculateProgress(input: StatusInput): number {
  const normalized = normalizeInput(input);
  const status = calculateTopicStatus(normalized);

  switch (status) {
    case 'not_started':
      return 0;

    case 'learning': {
      // Progress is proportional to sections completed
      // Each section contributes 12.5% (50% / 4 sections = 12.5% per section)
      // Max learning progress is 37.5% (3 sections out of 4)
      const progressPerSection = 50 / normalized.totalSections;
      return Math.min(progressPerSection * normalized.sectionsCompleted, 37.5);
    }

    case 'practice':
      return 50;

    case 'completed':
      return 100;

    default:
      return 0;
  }
}

// ============================================================================
// Display Helper Functions
// ============================================================================

/**
 * Get human-readable display text for a topic status
 * 
 * Requirements: 3.1, 3.2, 3.3
 */
export function getDisplayText(status: TopicStatus): string {
  switch (status) {
    case 'not_started':
      return 'Not Started';
    case 'learning':
      return 'Learning';
    case 'practice':
      return 'Practice';
    case 'completed':
      return 'Completed';
    default:
      return 'Not Started';
  }
}

/**
 * Get action text for a topic status (what the user should do next)
 * 
 * Requirements: 3.1, 3.2, 3.3
 */
export function getActionText(status: TopicStatus): string | null {
  switch (status) {
    case 'not_started':
      return null;
    case 'learning':
      return 'Continue';
    case 'practice':
      return 'Practice now';
    case 'completed':
      return null;
    default:
      return null;
  }
}

/**
 * Get icon type for visual representation of topic status
 * 
 * Icon mapping:
 * - not_started: 'empty' (empty circle)
 * - learning: 'half' (half-filled circle)
 * - practice: 'half' (half-filled circle)
 * - completed: 'check' (checkmark)
 * 
 * Requirements: 3.1
 */
export function getIconType(status: TopicStatus): IconType {
  switch (status) {
    case 'not_started':
      return 'empty';
    case 'learning':
      return 'half';
    case 'practice':
      return 'half';
    case 'completed':
      return 'check';
    default:
      return 'empty';
  }
}

/**
 * Get complete topic progress info including status, progress, and display data
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3
 */
export function getTopicProgressInfo(input: StatusInput): TopicProgressInfo {
  const status = calculateTopicStatus(input);
  const progress = calculateProgress(input);
  const displayText = getDisplayText(status);
  const actionText = getActionText(status);
  const iconType = getIconType(status);

  return {
    status,
    progress,
    displayText,
    actionText,
    iconType,
  };
}


// ============================================================================
// Chapter Progress Functions
// ============================================================================

/**
 * Calculate chapter progress based on topic statuses
 * 
 * Progress is calculated as: (completedTopics / totalTopics) * 100
 * Only topics with 'completed' status count as completed.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function calculateChapterProgress(topicStatuses: TopicStatus[]): ChapterProgressInfo {
  const totalTopics = topicStatuses.length;
  
  if (totalTopics === 0) {
    return {
      completedTopics: 0,
      totalTopics: 0,
      progress: 0,
      displayText: '0 of 0 topics completed',
    };
  }

  const completedTopics = topicStatuses.filter(status => status === 'completed').length;
  const progress = Math.round((completedTopics / totalTopics) * 100);
  const displayText = formatProgressText(completedTopics, totalTopics);

  return {
    completedTopics,
    totalTopics,
    progress,
    displayText,
  };
}

/**
 * Format subject/chapter progress text
 * 
 * Format: "X of Y topics completed"
 * Special case: "All topics completed!" when X = Y
 * 
 * Requirements: 5.1, 5.3
 */
export function formatProgressText(completed: number, total: number): string {
  if (total === 0) {
    return '0 of 0 topics completed';
  }
  
  if (completed === total) {
    return 'All topics completed!';
  }
  
  return `${completed} of ${total} topics completed`;
}


// ============================================================================
// Database Query Functions
// ============================================================================

import { supabase } from '@/integrations/supabase/client';

// Type assertion helper for tables not yet in generated types
const db = supabase as any;

/**
 * Data needed to calculate topic status from database
 */
export interface TopicStatusData {
  topicId: string;
  sectionsCompleted: number;
  totalSections: number;
  questionsAttempted: number;
  totalQuestionsAvailable: number; // Total questions available for this topic
}

/**
 * Fetch learning and practice data for a topic to calculate status
 * 
 * Requirements: 1.1
 * @param studentId - The student's ID
 * @param topicId - The topic's ID
 * @returns Data needed for status calculation
 */
export async function getTopicStatusData(
  studentId: string,
  topicId: string
): Promise<TopicStatusData> {
  try {
    // Get sections completed from student_topic_learning
    const { data: learningData, error: learningError } = await db
      .from('student_topic_learning')
      .select('sections_completed, total_sections')
      .eq('student_id', studentId)
      .eq('topic_id', topicId)
      .single();

    if (learningError && learningError.code !== 'PGRST116') {
      console.error('Error fetching learning data:', learningError);
    }

    // Get all question IDs for this topic first
    const { data: topicQuestions, error: questionsError } = await supabase
      .from('practice_questions')
      .select('id')
      .eq('topic_id', topicId);

    if (questionsError) {
      console.error('Error fetching topic questions:', questionsError);
    }

    const questionIds = topicQuestions?.map(q => q.id) || [];

    // Get questions attempted count from question_attempts table
    let questionsAttempted = 0;
    if (questionIds.length > 0) {
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('question_attempts')
        .select('question_id')
        .eq('student_id', studentId)
        .in('question_id', questionIds);

      if (attemptsError) {
        console.error('Error fetching question attempts:', attemptsError);
      } else {
        // Count unique questions attempted (not total attempts)
        const uniqueQuestions = new Set(attemptsData?.map(a => a.question_id) || []);
        questionsAttempted = uniqueQuestions.size;
      }
    }

    const sectionsCompleted = learningData?.sections_completed ?? 0;
    const totalSections = learningData?.total_sections ?? 4;

    const totalQuestionsAvailable = questionIds.length;

    console.log(`Topic ${topicId} status data:`, {
      sectionsCompleted,
      totalSections,
      questionsAttempted,
      totalQuestionsAvailable
    });

    return {
      topicId,
      sectionsCompleted,
      totalSections,
      questionsAttempted,
      totalQuestionsAvailable,
    };
  } catch (error) {
    console.error('Error in getTopicStatusData:', error);
    return {
      topicId,
      sectionsCompleted: 0,
      totalSections: 4,
      questionsAttempted: 0,
      totalQuestionsAvailable: 0,
    };
  }
}

/**
 * Calculate the effective minimum questions required for a topic
 * - If a topic has 0 questions, return 0 (completing sections is enough)
 * - If a topic has fewer than 3 questions, use the total available
 * - Otherwise, use the default of 3
 */
export function getEffectiveMinQuestions(totalQuestionsAvailable: number): number {
  if (totalQuestionsAvailable === 0) {
    return 0; // No questions available, completing sections is enough
  }
  return Math.min(DEFAULT_MIN_QUESTIONS, totalQuestionsAvailable);
}

/**
 * Get complete topic progress info from database
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3
 * @param studentId - The student's ID
 * @param topicId - The topic's ID
 * @returns Complete progress info for the topic
 */
export async function getTopicProgressFromDB(
  studentId: string,
  topicId: string
): Promise<TopicProgressInfo> {
  const statusData = await getTopicStatusData(studentId, topicId);
  const minQuestionsRequired = getEffectiveMinQuestions(statusData.totalQuestionsAvailable);
  
  return getTopicProgressInfo({
    sectionsCompleted: statusData.sectionsCompleted,
    totalSections: statusData.totalSections,
    questionsAttempted: statusData.questionsAttempted,
    minQuestionsRequired,
  });
}

/**
 * Get status data for all topics in a chapter
 * 
 * Requirements: 2.1
 * @param studentId - The student's ID
 * @param chapterId - The chapter's ID
 * @returns Array of topic status data
 */
export async function getChapterTopicsStatusData(
  studentId: string,
  chapterId: string
): Promise<TopicStatusData[]> {
  // Get all topics in the chapter
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id')
    .eq('chapter_id', chapterId)
    .order('display_order');

  if (topicsError || !topics) {
    return [];
  }

  // Get status data for each topic
  const statusDataPromises = topics.map(topic => 
    getTopicStatusData(studentId, topic.id)
  );

  return Promise.all(statusDataPromises);
}

/**
 * Get chapter progress info from database
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 * @param studentId - The student's ID
 * @param chapterId - The chapter's ID
 * @returns Chapter progress info
 */
export async function getChapterProgressFromDB(
  studentId: string,
  chapterId: string
): Promise<ChapterProgressInfo> {
  const topicsData = await getChapterTopicsStatusData(studentId, chapterId);
  
  // Calculate status for each topic
  const topicStatuses = topicsData.map(data => 
    calculateTopicStatus({
      sectionsCompleted: data.sectionsCompleted,
      totalSections: data.totalSections,
      questionsAttempted: data.questionsAttempted,
    })
  );

  return calculateChapterProgress(topicStatuses);
}
