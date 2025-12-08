/**
 * IndexedDB Wrapper Service for ShikshanAI Offline Support
 * Implements Requirements: 3.2, 5.1
 *
 * Provides CRUD operations for:
 * - lessonPacks: Downloaded chapter content
 * - pendingResponses: Offline practice responses awaiting sync
 * - offlineProgress: Local progress tracking
 * - metadata: App state (visit count, sync timestamps)
 */

import {
  DB_NAME,
  DB_VERSION,
  STORE_NAMES,
  type LessonPack,
  type PendingResponse,
  type OfflineProgress,
  type AppMetadata,
  type StoreName,
} from "./types";

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens or returns the existing IndexedDB connection
 */
export async function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null;
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      createStores(db);
    };
  });

  return dbPromise;
}


/**
 * Creates object stores during database upgrade
 */
function createStores(db: IDBDatabase): void {
  // Lesson Packs store - keyed by chapterId
  if (!db.objectStoreNames.contains(STORE_NAMES.LESSON_PACKS)) {
    const lessonPackStore = db.createObjectStore(STORE_NAMES.LESSON_PACKS, {
      keyPath: "chapterId",
    });
    lessonPackStore.createIndex("downloadedAt", "downloadedAt", {
      unique: false,
    });
    lessonPackStore.createIndex("subjectId", "subjectId", { unique: false });
    lessonPackStore.createIndex("lastAccessedAt", "lastAccessedAt", {
      unique: false,
    });
  }

  // Pending Responses store - auto-generated key
  if (!db.objectStoreNames.contains(STORE_NAMES.PENDING_RESPONSES)) {
    const pendingStore = db.createObjectStore(STORE_NAMES.PENDING_RESPONSES, {
      keyPath: "id",
    });
    pendingStore.createIndex("timestamp", "timestamp", { unique: false });
    pendingStore.createIndex("synced", "synced", { unique: false });
    pendingStore.createIndex("questionId", "questionId", { unique: false });
  }

  // Offline Progress store - composite key
  if (!db.objectStoreNames.contains(STORE_NAMES.OFFLINE_PROGRESS)) {
    const progressStore = db.createObjectStore(STORE_NAMES.OFFLINE_PROGRESS, {
      keyPath: "key",
    });
    progressStore.createIndex("topicId", "topicId", { unique: false });
    progressStore.createIndex("lastAttemptAt", "lastAttemptAt", {
      unique: false,
    });
  }

  // Metadata store - simple key-value
  if (!db.objectStoreNames.contains(STORE_NAMES.METADATA)) {
    db.createObjectStore(STORE_NAMES.METADATA, { keyPath: "key" });
  }
}

/**
 * Closes the database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    dbPromise = null;
  }
}

/**
 * Generic get operation
 */
export async function get<T>(
  storeName: StoreName,
  key: IDBValidKey
): Promise<T | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () =>
      reject(new Error(`Failed to get from ${storeName}: ${request.error}`));
  });
}

/**
 * Generic put operation (insert or update)
 */
export async function put<T>(storeName: StoreName, value: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(value);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to put in ${storeName}: ${request.error}`));
  });
}

/**
 * Generic delete operation
 */
export async function remove(
  storeName: StoreName,
  key: IDBValidKey
): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to delete from ${storeName}: ${request.error}`));
  });
}

/**
 * Get all items from a store
 */
export async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () =>
      reject(new Error(`Failed to getAll from ${storeName}: ${request.error}`));
  });
}

/**
 * Get items by index
 */
export async function getByIndex<T>(
  storeName: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () =>
      reject(
        new Error(
          `Failed to getByIndex from ${storeName}.${indexName}: ${request.error}`
        )
      );
  });
}

/**
 * Clear all items from a store
 */
export async function clear(storeName: StoreName): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to clear ${storeName}: ${request.error}`));
  });
}

/**
 * Count items in a store
 */
export async function count(storeName: StoreName): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error(`Failed to count ${storeName}: ${request.error}`));
  });
}

/**
 * Count items by index value
 */
export async function countByIndex(
  storeName: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.count(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error(
          `Failed to countByIndex ${storeName}.${indexName}: ${request.error}`
        )
      );
  });
}


// ============================================
// Lesson Pack Operations
// ============================================

/**
 * Store a lesson pack
 */
export async function putLessonPack(lessonPack: LessonPack): Promise<void> {
  return put(STORE_NAMES.LESSON_PACKS, lessonPack);
}

/**
 * Get a lesson pack by chapter ID
 */
export async function getLessonPack(
  chapterId: string
): Promise<LessonPack | undefined> {
  const pack = await get<LessonPack>(STORE_NAMES.LESSON_PACKS, chapterId);
  if (pack) {
    // Update last accessed time
    pack.lastAccessedAt = Date.now();
    await put(STORE_NAMES.LESSON_PACKS, pack);
  }
  return pack;
}

/**
 * Check if a chapter is downloaded
 */
export async function isChapterDownloaded(chapterId: string): Promise<boolean> {
  const pack = await get<LessonPack>(STORE_NAMES.LESSON_PACKS, chapterId);
  return pack !== undefined;
}

/**
 * Get all downloaded lesson packs
 */
export async function getAllLessonPacks(): Promise<LessonPack[]> {
  return getAll<LessonPack>(STORE_NAMES.LESSON_PACKS);
}

/**
 * Delete a lesson pack
 */
export async function deleteLessonPack(chapterId: string): Promise<void> {
  return remove(STORE_NAMES.LESSON_PACKS, chapterId);
}

/**
 * Clear all lesson packs
 */
export async function clearAllLessonPacks(): Promise<void> {
  return clear(STORE_NAMES.LESSON_PACKS);
}

/**
 * Get lesson packs sorted by last accessed time (oldest first)
 * Used for LRU cache eviction
 */
export async function getLessonPacksByLRU(): Promise<LessonPack[]> {
  const packs = await getAllLessonPacks();
  return packs.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
}

// ============================================
// Pending Response Operations
// ============================================

/**
 * Queue a response for sync
 */
export async function queuePendingResponse(
  response: PendingResponse
): Promise<void> {
  return put(STORE_NAMES.PENDING_RESPONSES, response);
}

/**
 * Get all pending (unsynced) responses
 */
export async function getPendingResponses(): Promise<PendingResponse[]> {
  return getByIndex<PendingResponse>(
    STORE_NAMES.PENDING_RESPONSES,
    "synced",
    0 // false is stored as 0
  );
}

/**
 * Get all unsynced responses
 */
export async function getUnsyncedResponses(): Promise<PendingResponse[]> {
  const all = await getAll<PendingResponse>(STORE_NAMES.PENDING_RESPONSES);
  return all.filter((r) => !r.synced);
}

/**
 * Mark a response as synced
 */
export async function markResponseSynced(id: string): Promise<void> {
  const response = await get<PendingResponse>(
    STORE_NAMES.PENDING_RESPONSES,
    id
  );
  if (response) {
    response.synced = true;
    await put(STORE_NAMES.PENDING_RESPONSES, response);
  }
}

/**
 * Delete a pending response
 */
export async function deletePendingResponse(id: string): Promise<void> {
  return remove(STORE_NAMES.PENDING_RESPONSES, id);
}

/**
 * Get count of unsynced responses
 */
export async function getUnsyncedCount(): Promise<number> {
  const unsynced = await getUnsyncedResponses();
  return unsynced.length;
}

/**
 * Clear all synced responses
 */
export async function clearSyncedResponses(): Promise<void> {
  const all = await getAll<PendingResponse>(STORE_NAMES.PENDING_RESPONSES);
  const synced = all.filter((r) => r.synced);
  for (const response of synced) {
    await remove(STORE_NAMES.PENDING_RESPONSES, response.id);
  }
}

/**
 * Get response by question ID (for conflict detection)
 */
export async function getResponseByQuestionId(
  questionId: string
): Promise<PendingResponse | undefined> {
  const responses = await getByIndex<PendingResponse>(
    STORE_NAMES.PENDING_RESPONSES,
    "questionId",
    questionId
  );
  // Return the most recent one
  return responses.sort((a, b) => b.timestamp - a.timestamp)[0];
}

// ============================================
// Offline Progress Operations
// ============================================

/**
 * Update offline progress for a topic
 */
export async function updateOfflineProgress(
  progress: OfflineProgress
): Promise<void> {
  return put(STORE_NAMES.OFFLINE_PROGRESS, progress);
}

/**
 * Get offline progress for a topic
 */
export async function getOfflineProgress(
  studentId: string,
  topicId: string
): Promise<OfflineProgress | undefined> {
  const key = `${studentId}-${topicId}`;
  return get<OfflineProgress>(STORE_NAMES.OFFLINE_PROGRESS, key);
}

/**
 * Get all offline progress
 */
export async function getAllOfflineProgress(): Promise<OfflineProgress[]> {
  return getAll<OfflineProgress>(STORE_NAMES.OFFLINE_PROGRESS);
}

/**
 * Clear all offline progress
 */
export async function clearOfflineProgress(): Promise<void> {
  return clear(STORE_NAMES.OFFLINE_PROGRESS);
}

// ============================================
// Metadata Operations
// ============================================

/**
 * Get app metadata
 */
export async function getMetadata(): Promise<AppMetadata | undefined> {
  return get<AppMetadata>(STORE_NAMES.METADATA, "app");
}

/**
 * Update app metadata
 */
export async function updateMetadata(
  updates: Partial<Omit<AppMetadata, "key">>
): Promise<void> {
  const existing = await getMetadata();
  const metadata: AppMetadata = {
    key: "app",
    lastSyncAt: updates.lastSyncAt ?? existing?.lastSyncAt ?? 0,
    visitCount: updates.visitCount ?? existing?.visitCount ?? 0,
    firstVisitAt: updates.firstVisitAt ?? existing?.firstVisitAt ?? Date.now(),
  };
  return put(STORE_NAMES.METADATA, metadata);
}

/**
 * Increment visit count and return new count
 */
export async function incrementVisitCount(): Promise<number> {
  const metadata = await getMetadata();
  const newCount = (metadata?.visitCount ?? 0) + 1;
  await updateMetadata({
    visitCount: newCount,
    firstVisitAt: metadata?.firstVisitAt ?? Date.now(),
  });
  return newCount;
}

/**
 * Update last sync timestamp
 */
export async function updateLastSyncTime(): Promise<void> {
  await updateMetadata({ lastSyncAt: Date.now() });
}

// ============================================
// Utility Operations
// ============================================

/**
 * Clear all offline data except app shell
 * Implements Requirements 7.4
 */
export async function clearAllOfflineData(): Promise<void> {
  await clearAllLessonPacks();
  await clear(STORE_NAMES.PENDING_RESPONSES);
  await clearOfflineProgress();
  // Keep metadata (visit count, etc.)
}

/**
 * Calculate total storage used by lesson packs
 */
export async function getTotalStorageUsed(): Promise<number> {
  const packs = await getAllLessonPacks();
  return packs.reduce((total, pack) => total + pack.sizeBytes, 0);
}

/**
 * Check if database is available
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await openDatabase();
    return true;
  } catch {
    return false;
  }
}
