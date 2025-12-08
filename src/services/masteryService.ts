/**
 * Mastery Service for ShikshanAI
 * Implements topic mastery tracking and calculation
 * 
 * NOTE: This service is kept for internal mastery tracking (for future spaced repetition).
 * The UI now uses the simplified status system from topicStatusService.ts
 * which shows: Not Started, Learning, Practice, Completed
 * 
 * Requirements: 6.1-6.5
 */

import { supabase } from '@/integrations/supabase/client';
import { MASTERY_THRESHOLDS } from './gamification/types';

// Type assertion helper for tables not yet in generated types
const db = supabase as any;

// =============================================
// INTERFACES
// =============================================

export interface TopicMastery {
  topicId: string;
  mastery: number; // 0-100
  conceptCompleted: boolean;
  practiceAttempts: number;
  correctAnswers: number;
  lastStudiedAt: string | null;
}

// =============================================
// MASTERY CALCULATION FUNCTIONS
// =============================================

/**
 * Check if a topic is mastered (>= 80%)
 * Property 6: Mastery Threshold Detection
 * For any topic with mastery >= 80%, this function SHALL return true
 * For mastery < 80%, it SHALL return false
 * 
 * Requirement 6.4: Mark topic as "Mastered" when mastery reaches 80%
 * @param mastery - Current mastery percentage (0-100)
 * @returns true if mastered, false otherwise
 */
export function isTopicMastered(mastery: number): boolean {
  return mastery >= MASTERY_THRESHOLDS.MASTERED;
}

/**
 * Calculate new mastery after a practice answer
 * Property 5: Mastery Calculation Bounds
 * The resulting mastery SHALL be between 0 and 100 inclusive
 * SHALL increase for correct answers and decrease for incorrect answers
 * 
 * Requirement 6.2: Update mastery based on accuracy
 * @param currentMastery - Current mastery percentage
 * @param isCorrect - Whether the answer was correct
 * @returns New mastery value (0-100)
 */
export function calculateMasteryChange(
  currentMastery: number,
  isCorrect: boolean
): number {
  let newMastery: number;

  if (isCorrect) {
    newMastery = currentMastery + MASTERY_THRESHOLDS.CORRECT_ANSWER_INCREASE;
  } else {
    newMastery = currentMastery - MASTERY_THRESHOLDS.INCORRECT_ANSWER_DECREASE;
  }

  // Clamp to bounds
  return Math.max(
    MASTERY_THRESHOLDS.MIN_MASTERY,
    Math.min(MASTERY_THRESHOLDS.MAX_MASTERY, newMastery)
  );
}

// =============================================
// DATABASE FUNCTIONS
// =============================================

/**
 * Get mastery data for a topic
 * Requirement 6.3: Display mastery percentage with visual progress ring
 * @param studentId - The student's ID
 * @param topicId - The topic's ID
 * @returns TopicMastery data or null if not found
 */
export async function getTopicMastery(
  studentId: string,
  topicId: string
): Promise<TopicMastery | null> {
  const { data, error } = await db
    .from('student_topic_progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('topic_id', topicId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    topicId: data.topic_id,
    mastery: data.mastery,
    conceptCompleted: data.mastery >= MASTERY_THRESHOLDS.INITIAL_CONCEPT_COMPLETE,
    practiceAttempts: data.attempts,
    correctAnswers: data.correct_count,
    lastStudiedAt: data.last_studied_at,
  };
}

/**
 * Get mastery data for all topics in a chapter
 * Requirement 6.5: Calculate average mastery across all topics
 * @param studentId - The student's ID
 * @param topicIds - Array of topic IDs in the chapter
 * @returns Array of TopicMastery data
 */
export async function getChapterMastery(
  studentId: string,
  topicIds: string[]
): Promise<{ topics: TopicMastery[]; averageMastery: number }> {
  if (topicIds.length === 0) {
    return { topics: [], averageMastery: 0 };
  }

  const { data, error } = await db
    .from('student_topic_progress')
    .select('*')
    .eq('student_id', studentId)
    .in('topic_id', topicIds);

  if (error) {
    console.error('Failed to fetch chapter mastery:', error);
    return { topics: [], averageMastery: 0 };
  }

  const topics: TopicMastery[] = (data || []).map((row: any) => ({
    topicId: row.topic_id,
    mastery: row.mastery,
    conceptCompleted: row.mastery >= MASTERY_THRESHOLDS.INITIAL_CONCEPT_COMPLETE,
    practiceAttempts: row.attempts,
    correctAnswers: row.correct_count,
    lastStudiedAt: row.last_studied_at,
  }));

  // Calculate average mastery (topics without progress count as 0)
  const totalMastery = topics.reduce((sum, t) => sum + t.mastery, 0);
  const averageMastery = topicIds.length > 0 
    ? Math.round(totalMastery / topicIds.length) 
    : 0;

  return { topics, averageMastery };
}

/**
 * Complete concept learning for a topic
 * Requirement 6.1: Set initial mastery to 30% after concept completion
 * @param studentId - The student's ID
 * @param topicId - The topic's ID
 * @returns New mastery value
 */
export async function completeConceptLearning(
  studentId: string,
  topicId: string
): Promise<number> {
  // Check if progress record exists
  const existing = await getTopicMastery(studentId, topicId);

  if (existing) {
    // If already has mastery >= initial, don't reduce it
    if (existing.mastery >= MASTERY_THRESHOLDS.INITIAL_CONCEPT_COMPLETE) {
      return existing.mastery;
    }

    // Update to initial mastery
    const { error } = await db
      .from('student_topic_progress')
      .update({
        mastery: MASTERY_THRESHOLDS.INITIAL_CONCEPT_COMPLETE,
        last_studied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(), // Mark as completed
      })
      .eq('student_id', studentId)
      .eq('topic_id', topicId);

    if (error) {
      throw new Error(`Failed to update mastery: ${error.message}`);
    }

    return MASTERY_THRESHOLDS.INITIAL_CONCEPT_COMPLETE;
  }

  // Create new progress record
  const { error } = await db
    .from('student_topic_progress')
    .insert({
      student_id: studentId,
      topic_id: topicId,
      mastery: MASTERY_THRESHOLDS.INITIAL_CONCEPT_COMPLETE,
      attempts: 0,
      correct_count: 0,
      last_studied_at: new Date().toISOString(),
      completed_at: new Date().toISOString(), // Mark as completed
    });

  if (error) {
    throw new Error(`Failed to create mastery record: ${error.message}`);
  }

  return MASTERY_THRESHOLDS.INITIAL_CONCEPT_COMPLETE;
}

/**
 * Update mastery after a practice question
 * Requirement 6.2: Update mastery based on accuracy
 * @param studentId - The student's ID
 * @param topicId - The topic's ID
 * @param isCorrect - Whether the answer was correct
 * @returns New mastery value
 */
export async function updateMasteryFromPractice(
  studentId: string,
  topicId: string,
  isCorrect: boolean
): Promise<number> {
  const existing = await getTopicMastery(studentId, topicId);

  if (existing) {
    const newMastery = calculateMasteryChange(existing.mastery, isCorrect);
    const newAttempts = existing.practiceAttempts + 1;
    const newCorrect = isCorrect ? existing.correctAnswers + 1 : existing.correctAnswers;

    const { error } = await db
      .from('student_topic_progress')
      .update({
        mastery: newMastery,
        attempts: newAttempts,
        correct_count: newCorrect,
        last_studied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('topic_id', topicId);

    if (error) {
      throw new Error(`Failed to update mastery: ${error.message}`);
    }

    return newMastery;
  }

  // Create new record if doesn't exist (shouldn't happen normally)
  const initialMastery = isCorrect 
    ? MASTERY_THRESHOLDS.CORRECT_ANSWER_INCREASE 
    : 0;

  const { error } = await db
    .from('student_topic_progress')
    .insert({
      student_id: studentId,
      topic_id: topicId,
      mastery: initialMastery,
      attempts: 1,
      correct_count: isCorrect ? 1 : 0,
      last_studied_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Failed to create mastery record: ${error.message}`);
  }

  return initialMastery;
}

/**
 * Get all topics that need review (low mastery)
 * @param studentId - The student's ID
 * @param threshold - Mastery threshold below which topics need review
 * @returns Array of topic IDs needing review
 */
export async function getTopicsNeedingReview(
  studentId: string,
  threshold: number = 50
): Promise<string[]> {
  const { data, error } = await db
    .from('student_topic_progress')
    .select('topic_id')
    .eq('student_id', studentId)
    .lt('mastery', threshold)
    .order('mastery', { ascending: true });

  if (error) {
    console.error('Failed to fetch topics needing review:', error);
    return [];
  }

  return (data || []).map((row: any) => row.topic_id);
}

// Re-export constants
export { MASTERY_THRESHOLDS } from './gamification/types';
