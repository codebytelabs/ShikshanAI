import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getUsedStorage,
  getStorageInfo,
  formatBytes,
  isStorageAvailable,
} from "./storageService";
import {
  openDatabase,
  closeDatabase,
  putLessonPack,
  clearAllOfflineData,
  type LessonPack,
} from "./db";

describe("Storage Service", () => {
  beforeEach(async () => {
    await openDatabase();
  });

  afterEach(async () => {
    await clearAllOfflineData();
    closeDatabase();
  });

  const createMockPack = (id: string, sizeBytes: number): LessonPack => ({
    chapterId: id,
    chapterName: `Chapter ${id}`,
    subjectName: "Math",
    subjectId: "math-1",
    topics: [],
    questions: [],
    downloadedAt: Date.now(),
    lastAccessedAt: Date.now(),
    sizeBytes,
  });

  describe("getUsedStorage", () => {
    it("should return 0 when no content is downloaded", async () => {
      const used = await getUsedStorage();
      expect(used).toBe(0);
    });

    it("should sum up all lesson pack sizes", async () => {
      await putLessonPack(createMockPack("ch-1", 1000));
      await putLessonPack(createMockPack("ch-2", 2000));

      const used = await getUsedStorage();
      expect(used).toBe(3000);
    });
  });

  describe("getStorageInfo", () => {
    it("should return correct storage info", async () => {
      await putLessonPack(createMockPack("ch-1", 1024 * 1024)); // 1MB

      const info = await getStorageInfo();
      expect(info.usedBytes).toBe(1024 * 1024);
      expect(info.totalBytes).toBe(50 * 1024 * 1024); // 50MB
      expect(info.availableBytes).toBe(49 * 1024 * 1024);
      expect(info.usagePercentage).toBeCloseTo(2, 0);
      expect(info.isNearLimit).toBe(false);
    });
  });

  describe("isStorageAvailable", () => {
    it("should return true when enough space", async () => {
      const available = await isStorageAvailable(1024);
      expect(available).toBe(true);
    });
  });

  describe("formatBytes", () => {
    it("should format bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 B");
      expect(formatBytes(500)).toBe("500 B");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1024 * 1024)).toBe("1 MB");
      expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MB");
    });
  });
});
