import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Network connection type based on Network Information API
 */
export type EffectiveConnectionType = "4g" | "3g" | "2g" | "slow-2g" | null;

export interface NetworkStatus {
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Whether the device was recently offline (for sync trigger) */
  wasOffline: boolean;
  /** Effective connection type if available */
  effectiveType: EffectiveConnectionType;
}

/**
 * Hook for detecting network status changes
 * Implements Requirements: 6.1, 6.2, 6.3
 *
 * - Detects network status changes within 3 seconds (Req 6.1)
 * - Tracks wasOffline state for sync trigger (Req 6.3)
 * - Detects effective connection type if available
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [effectiveType, setEffectiveType] =
    useState<EffectiveConnectionType>(null);

  // Track previous online state to detect transitions
  const prevOnlineRef = useRef(isOnline);

  /**
   * Gets the effective connection type from Network Information API
   */
  const getEffectiveType = useCallback((): EffectiveConnectionType => {
    if (typeof navigator === "undefined") return null;

    const connection =
      (navigator as Navigator & { connection?: NetworkInformation })
        .connection ||
      (navigator as Navigator & { mozConnection?: NetworkInformation })
        .mozConnection ||
      (navigator as Navigator & { webkitConnection?: NetworkInformation })
        .webkitConnection;

    if (connection?.effectiveType) {
      return connection.effectiveType as EffectiveConnectionType;
    }
    return null;
  }, []);

  /**
   * Handles online event
   */
  const handleOnline = useCallback(() => {
    console.log("[NetworkStatus] Device is online");
    setIsOnline(true);
    setEffectiveType(getEffectiveType());

    // If we were offline, set wasOffline flag for sync trigger
    if (!prevOnlineRef.current) {
      setWasOffline(true);
      // Clear wasOffline after a short delay to allow sync to trigger
      setTimeout(() => setWasOffline(false), 5000);
    }
    prevOnlineRef.current = true;
  }, [getEffectiveType]);


  /**
   * Handles offline event
   */
  const handleOffline = useCallback(() => {
    console.log("[NetworkStatus] Device is offline");
    setIsOnline(false);
    setEffectiveType(null);
    prevOnlineRef.current = false;
  }, []);

  /**
   * Handles connection change (Network Information API)
   */
  const handleConnectionChange = useCallback(() => {
    setEffectiveType(getEffectiveType());
  }, [getEffectiveType]);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    setEffectiveType(getEffectiveType());
    prevOnlineRef.current = navigator.onLine;

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for connection changes if available
    const connection =
      (navigator as Navigator & { connection?: NetworkInformation })
        .connection ||
      (navigator as Navigator & { mozConnection?: NetworkInformation })
        .mozConnection ||
      (navigator as Navigator & { webkitConnection?: NetworkInformation })
        .webkitConnection;

    if (connection) {
      connection.addEventListener("change", handleConnectionChange);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener("change", handleConnectionChange);
      }
    };
  }, [handleOnline, handleOffline, handleConnectionChange, getEffectiveType]);

  return {
    isOnline,
    wasOffline,
    effectiveType,
  };
}

/**
 * Network Information API types
 */
interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}
