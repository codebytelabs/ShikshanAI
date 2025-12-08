/**
 * Progress Ring Component
 * Circular progress indicator for mastery
 * Requirement 6.3: Show mastery percentage with visual progress ring
 */

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 'md',
  showPercentage = true,
  className,
}: ProgressRingProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeConfig = {
    sm: { size: 32, strokeWidth: 3, fontSize: 'text-xs' },
    md: { size: 48, strokeWidth: 4, fontSize: 'text-sm' },
    lg: { size: 64, strokeWidth: 5, fontSize: 'text-base' },
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // Color based on progress level
  const getColor = () => {
    if (clampedProgress >= 80) return 'text-green-500';
    if (clampedProgress >= 50) return 'text-yellow-500';
    if (clampedProgress >= 30) return 'text-orange-500';
    return 'text-gray-400';
  };

  const getStrokeColor = () => {
    if (clampedProgress >= 80) return 'stroke-green-500';
    if (clampedProgress >= 50) return 'stroke-yellow-500';
    if (clampedProgress >= 30) return 'stroke-orange-500';
    return 'stroke-gray-400';
  };

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: config.size, height: config.size }}
    >
      <svg
        className="transform -rotate-90"
        width={config.size}
        height={config.size}
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn('transition-all duration-500', getStrokeColor())}
        />
      </svg>
      {showPercentage && (
        <span
          className={cn(
            'absolute font-semibold',
            config.fontSize,
            getColor()
          )}
        >
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
}

// Mastery indicator with label
interface MasteryIndicatorProps {
  mastery: number;
  isMastered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MasteryIndicator({
  mastery,
  isMastered,
  size = 'md',
  className,
}: MasteryIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ProgressRing progress={mastery} size={size} />
      {isMastered && (
        <span className="text-green-600 text-xs font-medium">Mastered!</span>
      )}
    </div>
  );
}
