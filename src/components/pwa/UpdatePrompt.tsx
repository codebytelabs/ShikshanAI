import { useServiceWorker } from "@/hooks/useServiceWorker";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

/**
 * Component that displays an update prompt when a new service worker is available.
 * Implements Requirements 2.2: Service worker update flow.
 * 
 * - Detects new service worker versions
 * - Shows update prompt to user
 * - Handles skipWaiting and reload
 */
export function UpdatePrompt() {
  const { needRefresh, isUpdating, updateServiceWorker, dismissUpdate } =
    useServiceWorker();

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-4 shadow-lg">
        <div className="flex-1">
          <p className="text-sm font-medium">Update available</p>
          <p className="text-xs text-muted-foreground">
            A new version of Vidya AI is ready
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={dismissUpdate}
            disabled={isUpdating}
            aria-label="Dismiss update"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={updateServiceWorker}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
}
