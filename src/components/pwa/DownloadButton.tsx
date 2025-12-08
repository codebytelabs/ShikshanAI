import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check, Loader2, AlertCircle, Trash2 } from "lucide-react";
import {
  downloadLessonPack,
  isChapterDownloaded,
  deleteLessonPack,
  type DownloadProgress,
} from "@/services/offlineService";
import { isStorageAvailable } from "@/services/storageService";
import { cn } from "@/lib/utils";

export interface DownloadButtonProps {
  chapterId: string;
  /** Estimated size in bytes for storage check */
  estimatedSize?: number;
  /** Callback when download completes */
  onDownloadComplete?: () => void;
  /** Callback when download fails */
  onDownloadError?: (error: string) => void;
  /** Show delete option when downloaded */
  showDelete?: boolean;
  /** Additional CSS classes */
  className?: string;
}

type DownloadState =
  | "idle"
  | "checking"
  | "downloading"
  | "downloaded"
  | "error";

/**
 * Download button component for chapters
 * Implements Requirements: 3.1, 3.3, 3.4, 3.5
 */
export function DownloadButton({
  chapterId,
  estimatedSize = 500 * 1024, // Default 500KB estimate
  onDownloadComplete,
  onDownloadError,
  showDelete = false,
  className,
}: DownloadButtonProps) {
  const [state, setState] = useState<DownloadState>("checking");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check initial download status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const downloaded = await isChapterDownloaded(chapterId);
        setState(downloaded ? "downloaded" : "idle");
      } catch {
        setState("idle");
      }
    };
    checkStatus();
  }, [chapterId]);


  const handleProgressUpdate = useCallback((p: DownloadProgress) => {
    setProgress(p.percentage);
  }, []);

  const handleDownload = async () => {
    setState("downloading");
    setProgress(0);
    setError(null);

    try {
      // Check storage availability first (Req 3.5)
      const hasSpace = await isStorageAvailable(estimatedSize);
      if (!hasSpace) {
        setError("Not enough storage space");
        setState("error");
        onDownloadError?.("STORAGE_FULL");
        return;
      }

      const result = await downloadLessonPack(chapterId, handleProgressUpdate);

      if (result.success) {
        setState("downloaded");
        onDownloadComplete?.();
      } else {
        const errorMsg =
          result.error === "STORAGE_FULL"
            ? "Not enough storage space"
            : result.error === "NETWORK_ERROR"
              ? "Network error. Please try again."
              : "Download failed";
        setError(errorMsg);
        setState("error");
        onDownloadError?.(result.error || "UNKNOWN");
      }
    } catch (err) {
      setError("Download failed");
      setState("error");
      onDownloadError?.("UNKNOWN");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLessonPack(chapterId);
      setState("idle");
    } catch {
      setError("Failed to delete");
    }
  };

  const handleRetry = () => {
    setError(null);
    handleDownload();
  };

  // Render based on state
  if (state === "checking") {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (state === "downloaded") {
    if (showDelete) {
      return (
        <div className={cn("flex items-center gap-2", className)}>
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5" />
            Downloaded
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-7 px-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    }
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("text-emerald-600", className)}
        disabled
      >
        <Check className="mr-1.5 h-4 w-4" />
        Downloaded
      </Button>
    );
  }

  if (state === "downloading") {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        {progress > 0 ? `${Math.round(progress)}%` : "Downloading..."}
      </Button>
    );
  }

  if (state === "error") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </span>
        <Button variant="outline" size="sm" onClick={handleRetry}>
          Retry
        </Button>
      </div>
    );
  }

  // idle state
  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className={className}>
      <Download className="mr-1.5 h-4 w-4" />
      Download
    </Button>
  );
}
