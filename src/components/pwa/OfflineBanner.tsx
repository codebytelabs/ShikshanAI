import { WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OfflineBannerProps {
  /** Whether the device is offline */
  isOffline: boolean;
  /** Number of pending items to sync */
  pendingSyncCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Banner component that displays when the device is offline
 * Implements Requirements: 6.2, 6.3
 *
 * - Shows non-intrusive banner when offline (Req 6.2)
 * - Displays pending sync count (Req 5.4)
 * - Auto-hides when back online (Req 6.3)
 */
export function OfflineBanner({
  isOffline,
  pendingSyncCount = 0,
  className,
}: OfflineBannerProps) {
  if (!isOffline) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 bg-amber-500 px-3 py-1.5 text-xs font-medium text-white",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      <span>You're offline</span>
      {pendingSyncCount > 0 && (
        <>
          <span className="mx-1">•</span>
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          <span>
            {pendingSyncCount} {pendingSyncCount === 1 ? "item" : "items"} to
            sync
          </span>
        </>
      )}
    </div>
  );
}
