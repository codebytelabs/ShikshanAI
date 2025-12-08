import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  topicId: string;
  question: string;
  questionType: string;
  options: string[] | null;
  correctAnswer: string | null;
  hint: string | null;
  solution: string | null;
  curriculumRef: string | null;
  difficulty: string;
}

export interface QuestionAttempt {
  questionId: string;
  studentId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  attemptedAt?: string;
}

export interface PracticeStats {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
}

/**
 * Get questions for a topic with smart prioritization
 * Requirements: 3.1, 3.3
 * 
 * Priority order:
 * 1. Unattempted questions
 * 2. Incorrectly answered questions
 * 3. Correctly answered questions (for re-practice)
 */
export async function getQuestionsForTopic(
  topicId: string,
  studentId: string
): Promise<Question[]> {
  // Get all questions for the topic
  const { data: questions, error: questionsError } = await supabase
    .from('practice_questions')
    .select('*')
    .eq('topic_id', topicId);

  if (questionsError) {
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }

  if (!questions || questions.length === 0) {
    return [];
  }

  // Get student's attempts for these questions
  const questionIds = questions.map((q) => q.id);
  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('question_id, is_correct')
    .eq('student_id', studentId)
    .in('question_id', questionIds);

  if (attemptsError) {
    throw new Error(`Failed to fetch attempts: ${attemptsError.message}`);
  }

  // Create a map of question attempts (latest attempt per question)
  const attemptMap = new Map<string, boolean>();
  attempts?.forEach((a) => {
    attemptMap.set(a.question_id, a.is_correct);
  });

  // Categorize questions
  const unattempted: Question[] = [];
  const incorrect: Question[] = [];
  const correct: Question[] = [];

  questions.forEach((q) => {
    const question: Question = {
      id: q.id,
      topicId: q.topic_id,
      question: q.question,
      questionType: q.question_type,
      options: q.options as string[] | null,
      correctAnswer: q.correct_answer,
      hint: q.hint,
      solution: q.solution,
      curriculumRef: q.curriculum_ref,
      difficulty: q.difficulty,
    };

    if (!attemptMap.has(q.id)) {
      unattempted.push(question);
    } else if (attemptMap.get(q.id) === false) {
      incorrect.push(question);
    } else {
      correct.push(question);
    }
  });

  // Return in priority order: unattempted, incorrect, correct
  return [...unattempted, ...incorrect, ...correct];
}

/**
 * Record a question attempt
 * Requirements: 3.2
 */
export async function recordAttempt(attempt: QuestionAttempt): Promise<void> {
  const { error } = await supabase.from('question_attempts').insert({
    student_id: attempt.studentId,
    question_id: attempt.questionId,
    selected_answer: attempt.selectedAnswer,
    is_correct: attempt.isCorrect,
    attempted_at: attempt.attemptedAt || new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to record attempt: ${error.message}`);
  }
}


/**
 * Get practice statistics for a topic
 * Requirements: 3.5
 */
export async function getStats(
  topicId: string,
  studentId: string
): Promise<PracticeStats> {
  // Get total questions for the topic
  const { count: totalCount, error: totalError } = await supabase
    .from('practice_questions')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId);

  if (totalError) {
    throw new Error(`Failed to fetch total questions: ${totalError.message}`);
  }

  const totalQuestions = totalCount ?? 0;

  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      attempted: 0,
      correct: 0,
      incorrect: 0,
      unattempted: 0,
    };
  }

  // Get all question IDs for this topic
  const { data: questions, error: questionsError } = await supabase
    .from('practice_questions')
    .select('id')
    .eq('topic_id', topicId);

  if (questionsError) {
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }

  const questionIds = questions?.map((q) => q.id) ?? [];

  // Get attempts for these questions by this student
  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('question_id, is_correct')
    .eq('student_id', studentId)
    .in('question_id', questionIds);

  if (attemptsError) {
    throw new Error(`Failed to fetch attempts: ${attemptsError.message}`);
  }

  // Calculate stats (use latest attempt per question)
  const attemptMap = new Map<string, boolean>();
  attempts?.forEach((a) => {
    attemptMap.set(a.question_id, a.is_correct);
  });

  let correct = 0;
  let incorrect = 0;

  attemptMap.forEach((isCorrect) => {
    if (isCorrect) {
      correct++;
    } else {
      incorrect++;
    }
  });

  const attempted = attemptMap.size;
  const unattempted = totalQuestions - attempted;

  return {
    totalQuestions,
    attempted,
    correct,
    incorrect,
    unattempted,
  };
}

/**
 * Pure function to prioritize questions based on attempt status
 * For testing - Requirements: 3.3
 */
export function prioritizeQuestions(
  questions: Question[],
  attemptMap: Map<string, boolean>
): Question[] {
  const unattempted: Question[] = [];
  const incorrect: Question[] = [];
  const correct: Question[] = [];

  questions.forEach((q) => {
    if (!attemptMap.has(q.id)) {
      unattempted.push(q);
    } else if (attemptMap.get(q.id) === false) {
      incorrect.push(q);
    } else {
      correct.push(q);
    }
  });

  return [...unattempted, ...incorrect, ...correct];
}

/**
 * Pure function to calculate stats from attempt data
 * For testing - Requirements: 3.5
 */
export function calculateStats(
  totalQuestions: number,
  attemptMap: Map<string, boolean>
): PracticeStats {
  let correct = 0;
  let incorrect = 0;

  attemptMap.forEach((isCorrect) => {
    if (isCorrect) {
      correct++;
    } else {
      incorrect++;
    }
  });

  const attempted = attemptMap.size;
  const unattempted = totalQuestions - attempted;

  return {
    totalQuestions,
    attempted,
    correct,
    incorrect,
    unattempted,
  };
}

/**
 * Pure function to filter questions by topic
 * For testing - Requirements: 3.1
 */
export function filterQuestionsByTopic(
  questions: Question[],
  topicId: string
): Question[] {
  return questions.filter((q) => q.topicId === topicId);
}
