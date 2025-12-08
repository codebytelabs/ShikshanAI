import { useState, useEffect, useCallback } from "react";
import { getMetadata, incrementVisitCount } from "@/services/db";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface UseInstallPromptReturn {
  /** Whether the install prompt can be shown */
  canShowPrompt: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** Whether the prompt is currently visible */
  showPrompt: boolean;
  /** Trigger the native install prompt */
  promptInstall: () => Promise<void>;
  /** Dismiss the custom prompt */
  dismissPrompt: () => void;
}

// 7 days in milliseconds
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Hook to manage PWA install prompt
 * Implements Requirements 1.1: Show install prompt after second visit within a week
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [canShowPrompt, setCanShowPrompt] = useState(false);

  // Check if app is already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running in standalone mode (installed)
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone ===
          true;
      setIsInstalled(isStandalone);
    };

    checkInstalled();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener("change", checkInstalled);

    return () => mediaQuery.removeEventListener("change", checkInstalled);
  }, []);


  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setCanShowPrompt(false);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Track visits and determine if we should show prompt (Req 1.1)
  useEffect(() => {
    const checkVisitCount = async () => {
      if (isInstalled) return;

      try {
        // Only run if IndexedDB is available
        if (typeof indexedDB === "undefined") return;
        
        const metadata = await getMetadata();
        const now = Date.now();
        const firstVisit = metadata?.firstVisitAt ?? now;

        // Increment visit count
        const newCount = await incrementVisitCount();

        // Show prompt after second visit within 7 days
        const withinWeek = now - firstVisit < SEVEN_DAYS_MS;
        if (newCount >= 2 && withinWeek && canShowPrompt) {
          // Small delay to not interrupt initial page load
          setTimeout(() => setShowPrompt(true), 3000);
        }
      } catch (error) {
        // Silently fail - install prompt is not critical
        console.warn("[useInstallPrompt] Failed to check visit count:", error);
      }
    };

    checkVisitCount();
  }, [isInstalled, canShowPrompt]);

  /**
   * Trigger the native install prompt
   */
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
      setCanShowPrompt(false);
    } catch (error) {
      console.error("[useInstallPrompt] Install prompt failed:", error);
    }
  }, [deferredPrompt]);

  /**
   * Dismiss the custom prompt
   */
  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return {
    canShowPrompt,
    isInstalled,
    showPrompt,
    promptInstall,
    dismissPrompt,
  };
}
