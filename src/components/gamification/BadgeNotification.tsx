/**
 * Badge Notification Component
 * Celebratory popup when student earns a new badge
 * Requirement 5.5: Display celebratory animation when badge earned
 */

import { useEffect, useState } from 'react';
import { Award, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { StudentBadge } from '@/services/gamification/types';

interface BadgeNotificationProps {
  badge: StudentBadge;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function BadgeNotification({
  badge,
  onDismiss,
  autoDismissMs = 5000,
}: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, autoDismissMs);

    return () => {
      clearTimeout(dismissTimer);
    };
  }, [autoDismissMs]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) return null;

  const badgeInfo = badge.badge;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={handleDismiss}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300',
          isAnimating
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        )}
      >
        <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-2xl w-[280px] text-center relative overflow-hidden">
          {/* Sparkle decorations */}
          <div className="absolute top-2 left-4 animate-pulse">
            <Sparkles className="w-4 h-4 text-white/80" />
          </div>
          <div className="absolute top-4 right-6 animate-pulse delay-100">
            <Sparkles className="w-3 h-3 text-white/80" />
          </div>
          <div className="absolute bottom-8 left-6 animate-pulse delay-200">
            <Sparkles className="w-3 h-3 text-white/80" />
          </div>
          <div className="absolute bottom-4 right-4 animate-pulse delay-300">
            <Sparkles className="w-4 h-4 text-white/80" />
          </div>
          
          {/* Close button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Badge icon */}
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 animate-bounce shadow-lg">
            <span className="text-4xl">{badgeInfo?.icon || '🏆'}</span>
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold mb-1">Badge Earned! 🎉</h2>
          
          {/* Badge name */}
          <div className="text-2xl font-black my-2 drop-shadow-lg">
            {badgeInfo?.name || 'Achievement'}
          </div>
          
          {/* Description */}
          <p className="text-white/90 text-sm mb-4">
            {badgeInfo?.description || 'You earned a new badge!'}
          </p>
          
          {/* Continue button */}
          <Button 
            variant="secondary" 
            onClick={handleDismiss}
            className="w-full font-semibold"
          >
            Awesome!
          </Button>
        </div>
      </div>
    </>
  );
}

// Hook for managing badge notifications
export function useBadgeNotification() {
  const [badge, setBadge] = useState<StudentBadge | null>(null);
  const [queue, setQueue] = useState<StudentBadge[]>([]);

  const showBadge = (newBadge: StudentBadge) => {
    if (badge) {
      // Queue if already showing one
      setQueue(prev => [...prev, newBadge]);
    } else {
      setBadge(newBadge);
    }
  };

  const showBadges = (badges: StudentBadge[]) => {
    if (badges.length === 0) return;
    
    if (badge) {
      setQueue(prev => [...prev, ...badges]);
    } else {
      setBadge(badges[0]);
      if (badges.length > 1) {
        setQueue(badges.slice(1));
      }
    }
  };

  const hideBadge = () => {
    setBadge(null);
    // Show next in queue after a short delay
    setTimeout(() => {
      if (queue.length > 0) {
        setBadge(queue[0]);
        setQueue(prev => prev.slice(1));
      }
    }, 300);
  };

  return { badge, showBadge, showBadges, hideBadge };
}
