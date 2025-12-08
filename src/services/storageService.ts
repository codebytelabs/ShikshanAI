/**
 * Storage Service for ShikshanAI
 * Manages storage quota and cleanup
 * Implements Requirements: 7.1, 7.2, 3.5, 2.4
 */

import {
  getTotalStorageUsed,
  getAllLessonPacks,
  getLessonPacksByLRU,
  deleteLessonPack,
  type LessonPack,
} from "./db";

// Storage limits
const MAX_STORAGE_BYTES = 50 * 1024 * 1024; // 50MB total limit
const STORAGE_WARNING_THRESHOLD = 0.8; // Warn at 80% usage

export interface StorageInfo {
  usedBytes: number;
  availableBytes: number;
  totalBytes: number;
  usagePercentage: number;
  isNearLimit: boolean;
}

export interface LessonPackStorageInfo {
  chapterId: string;
  chapterName: string;
  subjectName: string;
  sizeBytes: number;
  downloadedAt: number;
  lastAccessedAt: number;
}

/**
 * Gets total storage used by downloaded content
 * Implements Requirements 7.1
 */
export async function getUsedStorage(): Promise<number> {
  return getTotalStorageUsed();
}

/**
 * Gets available storage space
 * Implements Requirements 3.5
 */
export async function getAvailableStorage(): Promise<number> {
  const used = await getUsedStorage();
  return Math.max(0, MAX_STORAGE_BYTES - used);
}

/**
 * Gets comprehensive storage information
 * Implements Requirements 7.1
 */
export async function getStorageInfo(): Promise<StorageInfo> {
  const usedBytes = await getUsedStorage();
  const availableBytes = MAX_STORAGE_BYTES - usedBytes;
  const usagePercentage = (usedBytes / MAX_STORAGE_BYTES) * 100;

  return {
    usedBytes,
    availableBytes: Math.max(0, availableBytes),
    totalBytes: MAX_STORAGE_BYTES,
    usagePercentage,
    isNearLimit: usagePercentage >= STORAGE_WARNING_THRESHOLD * 100,
  };
}


/**
 * Gets the size of a specific lesson pack
 * Implements Requirements 7.2
 */
export async function getLessonPackSize(chapterId: string): Promise<number> {
  const packs = await getAllLessonPacks();
  const pack = packs.find((p) => p.chapterId === chapterId);
  return pack?.sizeBytes ?? 0;
}

/**
 * Gets storage info for all downloaded lesson packs
 * Implements Requirements 7.2
 */
export async function getAllLessonPackStorageInfo(): Promise<
  LessonPackStorageInfo[]
> {
  const packs = await getAllLessonPacks();
  return packs.map((pack) => ({
    chapterId: pack.chapterId,
    chapterName: pack.chapterName,
    subjectName: pack.subjectName,
    sizeBytes: pack.sizeBytes,
    downloadedAt: pack.downloadedAt,
    lastAccessedAt: pack.lastAccessedAt,
  }));
}

/**
 * Checks if there's enough storage for a download
 * Implements Requirements 3.5
 */
export async function isStorageAvailable(
  requiredBytes: number
): Promise<boolean> {
  const available = await getAvailableStorage();
  return available >= requiredBytes;
}

/**
 * Evicts least-recently-used content to free up space
 * Implements Requirements 2.4: Remove LRU items while preserving app shell
 */
export async function evictLRUContent(targetBytes: number): Promise<number> {
  let freedBytes = 0;
  const packs = await getLessonPacksByLRU();

  for (const pack of packs) {
    if (freedBytes >= targetBytes) {
      break;
    }

    console.log(
      `[StorageService] Evicting LRU pack: ${pack.chapterName} (${formatBytes(pack.sizeBytes)})`
    );
    await deleteLessonPack(pack.chapterId);
    freedBytes += pack.sizeBytes;
  }

  console.log(
    `[StorageService] Evicted ${formatBytes(freedBytes)} of content`
  );
  return freedBytes;
}

/**
 * Ensures there's enough space for a download, evicting if necessary
 * Implements Requirements 2.4, 3.5
 */
export async function ensureStorageSpace(
  requiredBytes: number
): Promise<boolean> {
  const available = await getAvailableStorage();

  if (available >= requiredBytes) {
    return true;
  }

  const needed = requiredBytes - available;
  const freed = await evictLRUContent(needed);

  return freed >= needed;
}

/**
 * Formats bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Gets storage estimate from browser API if available
 */
export async function getBrowserStorageEstimate(): Promise<{
  quota?: number;
  usage?: number;
} | null> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    try {
      return await navigator.storage.estimate();
    } catch {
      return null;
    }
  }
  return null;
}
