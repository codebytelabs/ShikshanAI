import { useEffect, useState, useCallback } from "react";
import { useNetworkStatus } from "./useNetworkStatus";
import {
  triggerSync,
  getPendingCount,
  type SyncResult,
} from "@/services/syncService";

export interface UseOfflineSyncReturn {
  /** Whether the device is online */
  isOnline: boolean;
  /** Number of pending items to sync */
  pendingCount: number;
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** Result of the last sync operation */
  lastSyncResult: SyncResult | null;
  /** Manually trigger a sync */
  manualSync: () => Promise<void>;
}

/**
 * Hook that integrates sync service with network monitor
 * Implements Requirements: 5.2, 6.3
 *
 * - Triggers sync when network becomes available (Req 5.2)
 * - Tracks pending count for UI display (Req 5.4)
 */
export function useOfflineSync(): UseOfflineSyncReturn {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  /**
   * Refreshes the pending count from IndexedDB
   */
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch (error) {
      console.error("[useOfflineSync] Failed to get pending count:", error);
    }
  }, []);

  /**
   * Performs sync operation
   */
  const performSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    try {
      const result = await triggerSync();
      if (result) {
        setLastSyncResult(result);
      }
      await refreshPendingCount();
    } catch (error) {
      console.error("[useOfflineSync] Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, refreshPendingCount]);

  /**
   * Manual sync trigger for UI
   */
  const manualSync = useCallback(async () => {
    await performSync();
  }, [performSync]);

  // Refresh pending count on mount and when online status changes
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount, isOnline]);

  // Auto-sync when coming back online (Req 5.2, 6.3)
  useEffect(() => {
    if (wasOffline && isOnline) {
      console.log("[useOfflineSync] Back online, triggering sync");
      performSync();
    }
  }, [wasOffline, isOnline, performSync]);

  // Periodic pending count refresh
  useEffect(() => {
    const interval = setInterval(refreshPendingCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    manualSync,
  };
}
