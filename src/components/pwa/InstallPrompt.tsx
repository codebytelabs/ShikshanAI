import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

/**
 * Install prompt banner component
 * Implements Requirements 1.1: Show install prompt after second visit within a week
 */
export function InstallPrompt() {
  const { showPrompt, promptInstall, dismissPrompt, isInstalled } =
    useInstallPrompt();

  // Don't show if already installed or prompt shouldn't be shown
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4">
      <div className="rounded-xl border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground">
              Install ShikshanAI
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add to your home screen for quick access and offline study
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={promptInstall}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={dismissPrompt}>
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
