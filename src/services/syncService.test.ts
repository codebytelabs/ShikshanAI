import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  openDatabase,
  closeDatabase,
  clearAllOfflineData,
  type PendingResponse,
} from "./db";

// Mock supabase before importing syncService
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  },
}));

// Import after mocking
const { resolveConflict } = await import("./syncService");

describe("Sync Service", () => {
  beforeEach(async () => {
    await openDatabase();
  });

  afterEach(async () => {
    await clearAllOfflineData();
    closeDatabase();
  });

  describe("resolveConflict", () => {
    it("should keep the response with later timestamp", () => {
      const older: PendingResponse = {
        id: "resp-1",
        questionId: "q-1",
        answer: "old answer",
        isCorrect: false,
        timestamp: 1000,
        synced: false,
      };

      const newer: PendingResponse = {
        id: "resp-2",
        questionId: "q-1",
        answer: "new answer",
        isCorrect: true,
        timestamp: 2000,
        synced: false,
      };

      const result = resolveConflict(older, newer);
      expect(result.id).toBe("resp-2");
      expect(result.answer).toBe("new answer");
    });

    it("should keep local if timestamps are equal", () => {
      const local: PendingResponse = {
        id: "resp-1",
        questionId: "q-1",
        answer: "local",
        isCorrect: true,
        timestamp: 1000,
        synced: false,
      };

      const incoming: PendingResponse = {
        id: "resp-2",
        questionId: "q-1",
        answer: "incoming",
        isCorrect: true,
        timestamp: 1000,
        synced: false,
      };

      const result = resolveConflict(local, incoming);
      expect(result.id).toBe("resp-1");
    });
  });
});
