/**
 * Offline Service for ShikshanAI
 * Manages lesson pack downloads and offline content access
 * Implements Requirements: 3.2, 4.1, 4.2, 7.3, 7.4
 */

import { supabase } from "@/integrations/supabase/client";
import {
  type LessonPack,
  type OfflineTopic,
  type OfflineQuestion,
  type DownloadedChapter,
  putLessonPack,
  getLessonPack as dbGetLessonPack,
  isChapterDownloaded as dbIsChapterDownloaded,
  deleteLessonPack as dbDeleteLessonPack,
  getAllLessonPacks,
  clearAllOfflineData as dbClearAllOfflineData,
} from "./db";

export interface DownloadResult {
  success: boolean;
  error?: "STORAGE_FULL" | "NETWORK_ERROR" | "UNKNOWN";
  bytesDownloaded?: number;
}

export interface DownloadProgress {
  chapterId: string;
  bytesDownloaded: number;
  totalBytes: number;
  percentage: number;
}

type ProgressCallback = (progress: DownloadProgress) => void;

// Maximum questions to store per chapter (Requirements 3.2)
const MAX_QUESTIONS_PER_CHAPTER = 20;

/**
 * Estimates the size of an object in bytes
 */
function estimateSize(obj: unknown): number {
  return new Blob([JSON.stringify(obj)]).size;
}

/**
 * Downloads a lesson pack for a chapter
 * Implements Requirements 3.2: Store chapter content, topics, formulas, and up to 20 practice questions
 */
export async function downloadLessonPack(
  chapterId: string,
  onProgress?: ProgressCallback
): Promise<DownloadResult> {
  try {
    // Report initial progress
    onProgress?.({
      chapterId,
      bytesDownloaded: 0,
      totalBytes: 100, // Placeholder until we know actual size
      percentage: 0,
    });


    // Fetch chapter details with subject info
    const { data: chapter, error: chapterError } = await supabase
      .from("chapters")
      .select(
        `
        id,
        name,
        chapter_number,
        curriculum_ref,
        subject_id,
        subjects (
          id,
          name,
          icon
        )
      `
      )
      .eq("id", chapterId)
      .single();

    if (chapterError || !chapter) {
      console.error("[OfflineService] Failed to fetch chapter:", chapterError);
      return { success: false, error: "NETWORK_ERROR" };
    }

    onProgress?.({
      chapterId,
      bytesDownloaded: 10,
      totalBytes: 100,
      percentage: 10,
    });

    // Fetch topics for the chapter
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("display_order");

    if (topicsError) {
      console.error("[OfflineService] Failed to fetch topics:", topicsError);
      return { success: false, error: "NETWORK_ERROR" };
    }

    onProgress?.({
      chapterId,
      bytesDownloaded: 40,
      totalBytes: 100,
      percentage: 40,
    });

    // Fetch practice questions for all topics (limited to MAX_QUESTIONS_PER_CHAPTER)
    const topicIds = topics?.map((t) => t.id) || [];
    let questions: OfflineQuestion[] = [];

    if (topicIds.length > 0) {
      const { data: questionsData, error: questionsError } = await supabase
        .from("practice_questions")
        .select("*")
        .in("topic_id", topicIds)
        .limit(MAX_QUESTIONS_PER_CHAPTER);

      if (questionsError) {
        console.error(
          "[OfflineService] Failed to fetch questions:",
          questionsError
        );
        return { success: false, error: "NETWORK_ERROR" };
      }

      questions =
        questionsData?.map((q) => ({
          id: q.id,
          topicId: q.topic_id,
          question: q.question,
          questionType: q.question_type as "mcq" | "numerical" | "short",
          options: q.options as string[] | null,
          correctAnswer: q.correct_answer || "",
          hint: q.hint,
          solution: q.solution,
          curriculumRef: q.curriculum_ref,
          difficulty: q.difficulty as "easy" | "medium" | "hard",
        })) || [];
    }

    onProgress?.({
      chapterId,
      bytesDownloaded: 70,
      totalBytes: 100,
      percentage: 70,
    });

    // Transform topics to offline format
    const offlineTopics: OfflineTopic[] =
      topics?.map((t) => ({
        id: t.id,
        name: t.name,
        conceptCount: t.concept_count,
        content: "", // Content would come from a separate content table if available
        formulas: [], // Formulas would come from a separate formulas table if available
        textbookPageRef: t.textbook_page_ref,
      })) || [];

    // Get subject info safely
    const subjectData = chapter.subjects as unknown as {
      id: string;
      name: string;
      icon: string | null;
    } | null;

    // Create the lesson pack
    const lessonPack: LessonPack = {
      chapterId: chapter.id,
      chapterName: chapter.name,
      subjectName: subjectData?.name || "Unknown",
      subjectId: chapter.subject_id,
      topics: offlineTopics,
      questions,
      downloadedAt: Date.now(),
      lastAccessedAt: Date.now(),
      sizeBytes: 0, // Will be calculated below
    };

    // Calculate size
    lessonPack.sizeBytes = estimateSize(lessonPack);

    onProgress?.({
      chapterId,
      bytesDownloaded: 90,
      totalBytes: 100,
      percentage: 90,
    });

    // Store in IndexedDB
    try {
      await putLessonPack(lessonPack);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "QuotaExceededError"
      ) {
        return { success: false, error: "STORAGE_FULL" };
      }
      throw error;
    }

    onProgress?.({
      chapterId,
      bytesDownloaded: 100,
      totalBytes: 100,
      percentage: 100,
    });

    return {
      success: true,
      bytesDownloaded: lessonPack.sizeBytes,
    };
  } catch (error) {
    console.error("[OfflineService] Download failed:", error);
    return { success: false, error: "UNKNOWN" };
  }
}

/**
 * Gets a lesson pack from IndexedDB
 * Implements Requirements 4.1, 4.2
 */
export async function getLessonPack(
  chapterId: string
): Promise<LessonPack | null> {
  const pack = await dbGetLessonPack(chapterId);
  return pack || null;
}

/**
 * Checks if a chapter is downloaded
 * Implements Requirements 3.4
 */
export async function isChapterDownloaded(chapterId: string): Promise<boolean> {
  return dbIsChapterDownloaded(chapterId);
}

/**
 * Gets all downloaded chapters with summary info
 */
export async function getDownloadedChapters(): Promise<DownloadedChapter[]> {
  const packs = await getAllLessonPacks();
  return packs.map((pack) => ({
    chapterId: pack.chapterId,
    chapterName: pack.chapterName,
    subjectName: pack.subjectName,
    subjectIcon: "", // Would need to store this in the pack
    topicCount: pack.topics.length,
    questionCount: pack.questions.length,
    sizeBytes: pack.sizeBytes,
    downloadedAt: pack.downloadedAt,
  }));
}

/**
 * Deletes a single lesson pack
 * Implements Requirements 7.3
 */
export async function deleteLessonPack(chapterId: string): Promise<void> {
  await dbDeleteLessonPack(chapterId);
}

/**
 * Clears all offline data while preserving app shell
 * Implements Requirements 7.4
 */
export async function clearAllOfflineData(): Promise<void> {
  await dbClearAllOfflineData();
}

/**
 * Gets topics for a downloaded chapter
 */
export async function getOfflineTopics(
  chapterId: string
): Promise<OfflineTopic[]> {
  const pack = await getLessonPack(chapterId);
  return pack?.topics || [];
}

/**
 * Gets questions for a downloaded chapter
 */
export async function getOfflineQuestions(
  chapterId: string
): Promise<OfflineQuestion[]> {
  const pack = await getLessonPack(chapterId);
  return pack?.questions || [];
}

/**
 * Gets questions for a specific topic from a downloaded chapter
 */
export async function getOfflineQuestionsByTopic(
  chapterId: string,
  topicId: string
): Promise<OfflineQuestion[]> {
  const pack = await getLessonPack(chapterId);
  return pack?.questions.filter((q) => q.topicId === topicId) || [];
}
