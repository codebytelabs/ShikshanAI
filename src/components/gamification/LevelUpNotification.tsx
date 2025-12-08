/**
 * Level Up Notification Component
 * Celebratory popup when student reaches a new level
 * Requirement 3.7: Display total XP and current level prominently
 */

import { useEffect, useState } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LevelUpNotificationProps {
  newLevel: number;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function LevelUpNotification({
  newLevel,
  onDismiss,
  autoDismissMs = 5000,
}: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Auto-dismiss after delay
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
        <div className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground p-6 rounded-2xl shadow-2xl w-[280px] text-center relative overflow-hidden">
          {/* Sparkle decorations */}
          <div className="absolute top-2 left-4 animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="absolute top-4 right-6 animate-pulse delay-100">
            <Sparkles className="w-3 h-3 text-yellow-300" />
          </div>
          <div className="absolute bottom-8 left-6 animate-pulse delay-200">
            <Sparkles className="w-3 h-3 text-yellow-300" />
          </div>
          <div className="absolute bottom-4 right-4 animate-pulse delay-300">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          
          {/* Close button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Trophy icon */}
          <div className="mx-auto w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4 animate-bounce shadow-lg">
            <Trophy className="w-8 h-8 text-yellow-800" />
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold mb-1">Level Up! 🎉</h2>
          
          {/* Level display */}
          <div className="text-5xl font-black my-3 drop-shadow-lg">
            {newLevel}
          </div>
          
          {/* Message */}
          <p className="text-primary-foreground/90 text-sm mb-4">
            You've reached Level {newLevel}!<br />
            Keep up the great work!
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

// Hook for managing level-up notifications
export function useLevelUpNotification() {
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const showLevelUp = (newLevel: number) => {
    setLevelUp(newLevel);
  };

  const hideLevelUp = () => {
    setLevelUp(null);
  };

  return { levelUp, showLevelUp, hideLevelUp };
}
