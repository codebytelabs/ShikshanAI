/**
 * XP Notification Component
 * Animated popup showing XP earned
 * Requirement 3.6: Display animated notification showing points earned
 */

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPNotificationProps {
  amount: number;
  reason?: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function XPNotification({
  amount,
  reason,
  onDismiss,
  autoDismissMs = 2000,
}: XPNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Start exit animation before dismissing
    const exitTimer = setTimeout(() => {
      setIsAnimating(false);
    }, autoDismissMs - 300);

    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, autoDismissMs);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [autoDismissMs, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
        isAnimating
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-4 scale-95'
      )}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce-once">
        <Star className="w-5 h-5 fill-white animate-spin-slow" />
        <span className="font-bold text-lg">+{amount} XP</span>
        {reason && (
          <span className="text-white/80 text-sm ml-1">{reason}</span>
        )}
      </div>
    </div>
  );
}

// Hook for managing XP notifications
export function useXPNotification() {
  const [notification, setNotification] = useState<{
    amount: number;
    reason?: string;
  } | null>(null);

  const showXP = (amount: number, reason?: string) => {
    setNotification({ amount, reason });
  };

  const hideXP = () => {
    setNotification(null);
  };

  return { notification, showXP, hideXP };
}
