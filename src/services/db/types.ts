/**
 * IndexedDB Types for ShikshanAI Offline Support
 * Based on design.md schema specifications
 */

// Lesson Pack Types
export interface OfflineTopic {
  id: string;
  name: string;
  conceptCount: number;
  content: string; // Markdown content
  formulas: string[]; // LaTeX formulas
  textbookPageRef: string | null;
}

export interface OfflineQuestion {
  id: string;
  topicId: string;
  question: string;
  questionType: "mcq" | "numerical" | "short";
  options: string[] | null;
  correctAnswer: string;
  hint: string | null;
  solution: string | null;
  curriculumRef: string | null;
  difficulty: "easy" | "medium" | "hard";
}

export interface LessonPack {
  chapterId: string;
  chapterName: string;
  subjectName: string;
  subjectId: string;
  topics: OfflineTopic[];
  questions: OfflineQuestion[];
  downloadedAt: number;
  lastAccessedAt: number;
  sizeBytes: number;
}

export interface DownloadedChapter {
  chapterId: string;
  chapterName: string;
  subjectName: string;
  subjectIcon: string;
  topicCount: number;
  questionCount: number;
  sizeBytes: number;
  downloadedAt: number;
}

// Pending Response Types
export interface PendingResponse {
  id: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timestamp: number;
  synced: boolean;
}

// Offline Progress Types
export interface OfflineProgress {
  key: string; // `${studentId}-${topicId}`
  topicId: string;
  studentId: string;
  attempts: number;
  correctCount: number;
  lastAttemptAt: number;
}

// Metadata Types
export interface AppMetadata {
  key: string;
  lastSyncAt: number;
  visitCount: number;
  firstVisitAt: number;
}

// Database Schema
export const DB_NAME = "shikshanai-offline";
export const DB_VERSION = 1;

export const STORE_NAMES = {
  LESSON_PACKS: "lessonPacks",
  PENDING_RESPONSES: "pendingResponses",
  OFFLINE_PROGRESS: "offlineProgress",
  METADATA: "metadata",
} as const;

export type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES];
