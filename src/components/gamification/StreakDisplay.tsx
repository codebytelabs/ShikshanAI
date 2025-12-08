/**
 * Streak Display Component
 * Flame icon with streak count and warning state
 * Requirements: 4.3, 4.4
 */

import { Flame, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: number;
  isAtRisk?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StreakDisplay({
  streak,
  isAtRisk = false,
  size = 'md',
  showLabel = true,
  className,
}: StreakDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1.5',
        sizeClasses[size],
        className
      )}
    >
      <div className="relative">
        <Flame
          className={cn(
            iconSizes[size],
            streak > 0
              ? 'text-orange-500 fill-orange-500'
              : 'text-gray-400'
          )}
        />
        {isAtRisk && streak > 0 && (
          <AlertTriangle className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
        )}
      </div>
      <span
        className={cn(
          'font-semibold',
          streak > 0 ? 'text-orange-600' : 'text-gray-500'
        )}
      >
        {streak}
      </span>
      {showLabel && (
        <span className="text-gray-500 text-sm">
          {streak === 1 ? 'day' : 'days'}
        </span>
      )}
      {isAtRisk && streak > 0 && (
        <span className="text-yellow-600 text-xs ml-1">
          Keep it going!
        </span>
      )}
    </div>
  );
}
