import { useState, useCallback, useEffect } from "react";

export interface ServiceWorkerState {
  needRefresh: boolean;
  offlineReady: boolean;
  isUpdating: boolean;
}

export interface UseServiceWorkerReturn extends ServiceWorkerState {
  updateServiceWorker: () => Promise<void>;
  dismissUpdate: () => void;
}

/**
 * Hook to manage service worker registration and updates.
 * Handles the update flow with user prompts as per Requirements 2.2.
 * 
 * Returns default values when PWA is not available (dev mode).
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [swUpdate, setSwUpdate] = useState<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    // Dynamically import PWA register to avoid issues when PWA is disabled
    const loadPWA = async () => {
      try {
        // @ts-ignore - virtual module from vite-plugin-pwa
        const { registerSW } = await import("virtual:pwa-register");
        
        const updateSW = registerSW({
          onRegistered(registration) {
            if (registration) {
              console.log("[SW] Service worker registered successfully");
              // Check for updates periodically (every hour)
              setInterval(() => {
                registration.update();
              }, 60 * 60 * 1000);
            }
          },
          onRegisterError(error) {
            console.error("[SW] Service worker registration failed:", error);
          },
          onNeedRefresh() {
            console.log("[SW] New content available, waiting for user confirmation");
            setNeedRefresh(true);
          },
          onOfflineReady() {
            console.log("[SW] App is ready for offline use");
            setOfflineReady(true);
          },
        });

        setSwUpdate(() => updateSW);
      } catch (error) {
        // PWA not available (dev mode or not configured)
        console.log("[SW] PWA not available in this environment");
      }
    };

    loadPWA();
  }, []);

  /**
   * Triggers the service worker update.
   */
  const updateServiceWorker = useCallback(async () => {
    if (!swUpdate) return;
    
    setIsUpdating(true);
    try {
      await swUpdate(true); // true = reload after update
    } catch (error) {
      console.error("[SW] Failed to update service worker:", error);
      setIsUpdating(false);
    }
  }, [swUpdate]);

  /**
   * Dismisses the update prompt without updating.
   */
  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  return {
    needRefresh,
    offlineReady,
    isUpdating,
    updateServiceWorker,
    dismissUpdate,
  };
}
