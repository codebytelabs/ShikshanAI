/**
 * Badge Collection Component
 * Grid of earned badges with locked badges as silhouettes
 * Requirements: 5.5, 5.6
 */

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Badge, StudentBadge } from '@/services/gamification/types';

interface BadgeCollectionProps {
  earnedBadges: StudentBadge[];
  allBadges: Badge[];
  className?: string;
}

export function BadgeCollection({
  earnedBadges,
  allBadges,
  className,
}: BadgeCollectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));

  return (
    <>
      <div className={cn('grid grid-cols-4 gap-3', className)}>
        {allBadges.map((badge) => {
          const isEarned = earnedBadgeIds.has(badge.id);
          const earnedBadge = earnedBadges.find(b => b.badgeId === badge.id);

          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={cn(
                'aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all',
                isEarned
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              {isEarned ? (
                <span className="text-2xl">{badge.icon}</span>
              ) : (
                <div className="relative">
                  <span className="text-2xl opacity-20 grayscale">
                    {badge.icon}
                  </span>
                  <Lock className="w-3 h-3 text-gray-400 absolute -bottom-1 -right-1" />
                </div>
              )}
              <span
                className={cn(
                  'text-xs mt-1 text-center line-clamp-1',
                  isEarned ? 'text-gray-700' : 'text-gray-400'
                )}
              >
                {badge.name}
              </span>
            </button>
          );
        })}
      </div>

      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-3xl">{selectedBadge?.icon}</span>
              {selectedBadge?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-gray-600">{selectedBadge?.description}</p>
            {earnedBadgeIds.has(selectedBadge?.id || '') ? (
              <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                ✓ Earned on{' '}
                {new Date(
                  earnedBadges.find(b => b.badgeId === selectedBadge?.id)
                    ?.earnedAt || ''
                ).toLocaleDateString()}
              </div>
            ) : (
              <div className="bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm">
                🔒 Keep learning to unlock this badge!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
