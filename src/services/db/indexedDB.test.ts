import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  openDatabase,
  closeDatabase,
  putLessonPack,
  getLessonPack,
  isChapterDownloaded,
  deleteLessonPack,
  getAllLessonPacks,
  queuePendingResponse,
  getUnsyncedResponses,
  markResponseSynced,
  getUnsyncedCount,
  incrementVisitCount,
  getMetadata,
  clearAllOfflineData,
  type LessonPack,
  type PendingResponse,
} from "./indexedDB";

describe("IndexedDB Service", () => {
  beforeEach(async () => {
    await openDatabase();
  });

  afterEach(async () => {
    await clearAllOfflineData();
    closeDatabase();
  });

  describe("Lesson Pack Operations", () => {
    const mockLessonPack: LessonPack = {
      chapterId: "chapter-1",
      chapterName: "Number Systems",
      subjectName: "Mathematics",
      subjectId: "math-1",
      topics: [
        {
          id: "topic-1",
          name: "Real Numbers",
          conceptCount: 5,
          content: "Content here",
          formulas: ["a^2 + b^2 = c^2"],
          textbookPageRef: "Page 1-10",
        },
      ],
      questions: [
        {
          id: "q-1",
          topicId: "topic-1",
          question: "What is 2+2?",
          questionType: "mcq",
          options: ["3", "4", "5", "6"],
          correctAnswer: "4",
          hint: "Count on fingers",
          solution: "2+2=4",
          curriculumRef: "Page 5",
          difficulty: "easy",
        },
      ],
      downloadedAt: Date.now(),
      lastAccessedAt: Date.now(),
      sizeBytes: 1024,
    };

    it("should store and retrieve a lesson pack", async () => {
      await putLessonPack(mockLessonPack);
      const retrieved = await getLessonPack("chapter-1");

      expect(retrieved).toBeDefined();
      expect(retrieved?.chapterId).toBe("chapter-1");
      expect(retrieved?.chapterName).toBe("Number Systems");
      expect(retrieved?.topics).toHaveLength(1);
      expect(retrieved?.questions).toHaveLength(1);
    });

    it("should check if chapter is downloaded", async () => {
      expect(await isChapterDownloaded("chapter-1")).toBe(false);
      await putLessonPack(mockLessonPack);
      expect(await isChapterDownloaded("chapter-1")).toBe(true);
    });

    it("should delete a lesson pack", async () => {
      await putLessonPack(mockLessonPack);
      expect(await isChapterDownloaded("chapter-1")).toBe(true);

      await deleteLessonPack("chapter-1");
      expect(await isChapterDownloaded("chapter-1")).toBe(false);
    });

    it("should get all lesson packs", async () => {
      await putLessonPack(mockLessonPack);
      await putLessonPack({ ...mockLessonPack, chapterId: "chapter-2" });

      const all = await getAllLessonPacks();
      expect(all).toHaveLength(2);
    });
  });


  describe("Pending Response Operations", () => {
    const mockResponse: PendingResponse = {
      id: "resp-1",
      questionId: "q-1",
      answer: "4",
      isCorrect: true,
      timestamp: Date.now(),
      synced: false,
    };

    it("should queue and retrieve pending responses", async () => {
      await queuePendingResponse(mockResponse);
      const unsynced = await getUnsyncedResponses();

      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].questionId).toBe("q-1");
      expect(unsynced[0].synced).toBe(false);
    });

    it("should count unsynced responses", async () => {
      expect(await getUnsyncedCount()).toBe(0);

      await queuePendingResponse(mockResponse);
      expect(await getUnsyncedCount()).toBe(1);

      await queuePendingResponse({ ...mockResponse, id: "resp-2" });
      expect(await getUnsyncedCount()).toBe(2);
    });

    it("should mark response as synced", async () => {
      await queuePendingResponse(mockResponse);
      expect(await getUnsyncedCount()).toBe(1);

      await markResponseSynced("resp-1");
      expect(await getUnsyncedCount()).toBe(0);
    });
  });

  describe("Metadata Operations", () => {
    it("should increment visit count", async () => {
      const count1 = await incrementVisitCount();
      expect(count1).toBe(1);

      const count2 = await incrementVisitCount();
      expect(count2).toBe(2);

      const metadata = await getMetadata();
      expect(metadata?.visitCount).toBe(2);
    });

    it("should track first visit timestamp", async () => {
      await incrementVisitCount();

      const metadata = await getMetadata();
      expect(metadata?.firstVisitAt).toBeDefined();
      expect(metadata?.firstVisitAt).toBeGreaterThan(0);
      // Should be within the last minute
      expect(Date.now() - (metadata?.firstVisitAt || 0)).toBeLessThan(60000);
    });
  });
});
