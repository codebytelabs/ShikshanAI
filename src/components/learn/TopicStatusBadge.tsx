/**
 * TopicStatusBadge Component
 * 
 * Displays the status of a topic with appropriate icon and styling.
 * Uses the simplified progress system statuses.
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

import { cn } from '@/lib/utils';
import { Circle, CircleDot, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TopicStatus, IconType } from '@/services/topicStatusService';

interface TopicStatusBadgeProps {
  status: TopicStatus;
  displayText: string;
  actionText: string | null;
  iconType: IconType;
  onActionClick?: () => void;
  showActionButton?: boolean;
  className?: string;
}

/**
 * Get the appropriate icon component for the status
 */
function StatusIcon({ iconType, status }: { iconType: IconType; status: TopicStatus }) {
  const iconClasses = cn(
    'h-5 w-5 flex-shrink-0',
    {
      'text-muted-foreground': status === 'not_started',
      'text-blue-500': status === 'learning',
      'text-orange-500': status === 'practice',
      'text-green-500': status === 'completed',
    }
  );

  switch (iconType) {
    case 'empty':
      return <Circle className={iconClasses} />;
    case 'half':
      return <CircleDot className={iconClasses} />;
    case 'check':
      return <CheckCircle2 className={iconClasses} />;
    default:
      return <Circle className={iconClasses} />;
  }
}

/**
 * Get the text color class for the status
 */
function getStatusTextColor(status: TopicStatus): string {
  switch (status) {
    case 'not_started':
      return 'text-muted-foreground';
    case 'learning':
      return 'text-blue-600';
    case 'practice':
      return 'text-orange-600';
    case 'completed':
      return 'text-green-600';
    default:
      return 'text-muted-foreground';
  }
}

export function TopicStatusBadge({
  status,
  displayText,
  actionText,
  iconType,
  onActionClick,
  showActionButton = true,
  className,
}: TopicStatusBadgeProps) {
  const textColor = getStatusTextColor(status);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StatusIcon iconType={iconType} status={status} />
      
      {showActionButton && actionText && onActionClick ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onActionClick();
          }}
          className={cn(
            'h-auto px-2 py-1 text-sm font-medium',
            status === 'practice' ? 'text-orange-600 hover:text-orange-700' : textColor
          )}
        >
          {actionText}
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      ) : (
        <span className={cn('text-sm font-medium', textColor)}>
          {displayText}
        </span>
      )}
    </div>
  );
}

/**
 * Compact version for use in lists
 */
export function TopicStatusIndicator({
  status,
  iconType,
  className,
}: {
  status: TopicStatus;
  iconType: IconType;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center', className)}>
      <StatusIcon iconType={iconType} status={status} />
    </div>
  );
}
