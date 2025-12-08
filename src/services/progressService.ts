import { supabase } from '@/integrations/supabase/client';
import { 
  getTopicStatusData, 
  getEffectiveMinQuestions,
  calculateTopicStatus,
  formatProgressText,
} from './topicStatusService';

// Type assertion helper for tables not yet in generated types
const db = supabase as any;

export interface TopicProgress {
  topicId: string;
  completedAt: string;
  score?: number;
}

export interface SubjectProgress {
  subjectId: string;
  completedTopics: number;
  totalTopics: number;
  percentage: number;
  displayText: string; // New: "X of Y topics completed"
}

/**
 * Mark a topic as complete for a student
 * Requirements: 1.1
 */
export async function markTopicComplete(
  studentId: string,
  topicId: string,
  score?: number
): Promise<void> {
  const { error } = await supabase
    .from('student_topic_progress')
    .upsert(
      {
        student_id: studentId,
        topic_id: topicId,
        completed_at: new Date().toISOString(),
        score: score ?? null,
        mastery: score ?? 100,
        last_studied_at: new Date().toISOString(),
      },
      {
        onConflict: 'student_id,topic_id',
      }
    );

  if (error) {
    throw new Error(`Failed to mark topic complete: ${error.message}`);
  }
}

/**
 * Get progress for a specific subject using the new status-based system
 * Counts only fully completed topics (lesson + practice done)
 * 
 * Requirements: 2.1, 5.1, 5.2
 */
export async function getSubjectProgress(
  studentId: string,
  subjectId: string
): Promise<SubjectProgress> {
  // Get all topics for this subject through chapters
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('id')
    .eq('subject_id', subjectId);

  if (chaptersError) {
    throw new Error(`Failed to fetch chapters: ${chaptersError.message}`);
  }

  if (!chapters || chapters.length === 0) {
    return {
      subjectId,
      completedTopics: 0,
      totalTopics: 0,
      percentage: 0,
      displayText: formatProgressText(0, 0),
    };
  }

  const chapterIds = chapters.map((c) => c.id);

  // Get all topics for this subject
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id')
    .in('chapter_id', chapterIds);

  if (topicsError) {
    throw new Error(`Failed to fetch topics: ${topicsError.message}`);
  }

  const total = topics?.length ?? 0;

  if (total === 0) {
    return {
      subjectId,
      completedTopics: 0,
      totalTopics: 0,
      percentage: 0,
      displayText: formatProgressText(0, 0),
    };
  }

  // Get status for each topic and count completed ones
  const topicStatuses = await Promise.all(
    topics.map(async (topic) => {
      const statusData = await getTopicStatusData(studentId, topic.id);
      const minQuestionsRequired = getEffectiveMinQuestions(statusData.totalQuestionsAvailable);
      return calculateTopicStatus({
        sectionsCompleted: statusData.sectionsCompleted,
        totalSections: statusData.totalSections,
        questionsAttempted: statusData.questionsAttempted,
        minQuestionsRequired,
      });
    })
  );

  // Count only fully completed topics
  const completed = topicStatuses.filter(status => status === 'completed').length;
  const percentage = Math.round((completed / total) * 100);

  return {
    subjectId,
    completedTopics: completed,
    totalTopics: total,
    percentage,
    displayText: formatProgressText(completed, total),
  };
}


/**
 * Get progress for all subjects a student is enrolled in
 * Requirements: 1.4
 */
export async function getAllProgress(studentId: string): Promise<SubjectProgress[]> {
  // Get student's enrolled subjects
  const { data: studentSubjects, error: subjectsError } = await supabase
    .from('student_subjects')
    .select('subject_id')
    .eq('student_id', studentId);

  if (subjectsError) {
    throw new Error(`Failed to fetch student subjects: ${subjectsError.message}`);
  }

  if (!studentSubjects || studentSubjects.length === 0) {
    return [];
  }

  // Get progress for each subject
  const progressPromises = studentSubjects.map((ss) =>
    getSubjectProgress(studentId, ss.subject_id)
  );

  return Promise.all(progressPromises);
}

/**
 * Reset all progress for a student (including gamification data)
 * Requirements: 1.3
 */
export async function resetProgress(studentId: string): Promise<void> {
  // Delete all topic progress records for this student
  const { error: progressError } = await supabase
    .from('student_topic_progress')
    .delete()
    .eq('student_id', studentId);

  if (progressError) {
    throw new Error(`Failed to reset topic progress: ${progressError.message}`);
  }

  // Delete all question attempts for this student
  const { error: attemptsError } = await supabase
    .from('question_attempts')
    .delete()
    .eq('student_id', studentId);

  if (attemptsError) {
    throw new Error(`Failed to reset question attempts: ${attemptsError.message}`);
  }

  // Delete all practice sessions for this student
  const { error: sessionsError } = await supabase
    .from('practice_sessions')
    .delete()
    .eq('student_id', studentId);

  if (sessionsError) {
    throw new Error(`Failed to reset practice sessions: ${sessionsError.message}`);
  }
  
  // Delete topic learning progress
  const { error: learningError } = await db
    .from('student_topic_learning')
    .delete()
    .eq('student_id', studentId);

  if (learningError) {
    console.error('Failed to reset topic learning:', learningError);
  }
  
  // Delete XP transactions
  const { error: xpError } = await db
    .from('xp_transactions')
    .delete()
    .eq('student_id', studentId);

  if (xpError) {
    console.error('Failed to reset XP transactions:', xpError);
  }
  
  // Delete earned badges
  const { error: badgesError } = await db
    .from('student_badges')
    .delete()
    .eq('student_id', studentId);

  if (badgesError) {
    console.error('Failed to reset badges:', badgesError);
  }
  
  // Reset gamification data (XP, level, streak) to defaults
  const { error: gamificationError } = await db
    .from('student_gamification')
    .update({
      xp: 0,
      level: 1,
      streak: 0,
      last_activity_date: null,
      daily_progress_minutes: 0,
      daily_goal_completed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('student_id', studentId);

  if (gamificationError) {
    console.error('Failed to reset gamification:', gamificationError);
  }
}

/**
 * Calculate progress percentage from completed and total counts
 * Pure function for testing - Requirements: 1.2
 */
export function calculateProgressPercentage(
  completedTopics: number,
  totalTopics: number
): number {
  if (totalTopics === 0) {
    return 0;
  }
  return Math.floor((completedTopics / totalTopics) * 100);
}

/**
 * Check if progress should be shown as zero for a fresh profile
 * Pure function for testing - Requirements: 1.4
 */
export function isProgressZero(progress: SubjectProgress): boolean {
  return progress.completedTopics === 0 && progress.percentage === 0;
}
