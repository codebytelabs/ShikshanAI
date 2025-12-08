import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, HardDrive, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getStorageInfo,
  getAllLessonPackStorageInfo,
  formatBytes,
  type StorageInfo,
  type LessonPackStorageInfo,
} from "@/services/storageService";
import { deleteLessonPack, clearAllOfflineData } from "@/services/offlineService";
import { cn } from "@/lib/utils";

/**
 * Storage Manager component for Profile page
 * Implements Requirements: 7.1, 7.2, 7.3, 7.4
 */
export function StorageManager() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [lessonPacks, setLessonPacks] = useState<LessonPackStorageInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [info, packs] = await Promise.all([
        getStorageInfo(),
        getAllLessonPackStorageInfo(),
      ]);
      setStorageInfo(info);
      setLessonPacks(packs);
    } catch (error) {
      console.error("[StorageManager] Failed to load storage info:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);


  const handleDeletePack = async (chapterId: string) => {
    try {
      await deleteLessonPack(chapterId);
      await refreshData();
    } catch (error) {
      console.error("[StorageManager] Failed to delete pack:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllOfflineData();
      await refreshData();
    } catch (error) {
      console.error("[StorageManager] Failed to clear all:", error);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-2 rounded bg-muted" />
          <div className="h-16 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Offline Storage</h3>
      </div>

      {/* Storage Usage - Req 7.1 */}
      {storageInfo && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatBytes(storageInfo.usedBytes)} of{" "}
              {formatBytes(storageInfo.totalBytes)} used
            </span>
            <span
              className={cn(
                "font-medium",
                storageInfo.isNearLimit ? "text-amber-500" : "text-foreground"
              )}
            >
              {Math.round(storageInfo.usagePercentage)}%
            </span>
          </div>
          <Progress
            value={storageInfo.usagePercentage}
            className={cn(
              "mt-2 h-2",
              storageInfo.isNearLimit && "[&>div]:bg-amber-500"
            )}
          />
          {storageInfo.isNearLimit && (
            <p className="mt-2 flex items-center gap-1 text-xs text-amber-500">
              <AlertTriangle className="h-3 w-3" />
              Storage is almost full
            </p>
          )}
        </div>
      )}

      {/* Downloaded Chapters - Req 7.2 */}
      {lessonPacks.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">
            Downloaded Chapters ({lessonPacks.length})
          </p>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {lessonPacks.map((pack) => (
              <div
                key={pack.chapterId}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {pack.chapterName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pack.subjectName} • {formatBytes(pack.sizeBytes)}
                  </p>
                </div>
                {/* Delete button - Req 7.3 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePack(pack.chapterId)}
                  className="ml-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No chapters downloaded yet
        </p>
      )}

      {/* Clear All Button - Req 7.4 */}
      {lessonPacks.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Offline Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all offline data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all downloaded chapters and free up{" "}
                {storageInfo ? formatBytes(storageInfo.usedBytes) : "storage"}.
                Your progress will be preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAll}>
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
