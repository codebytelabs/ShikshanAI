import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
      <Flame className="h-5 w-5 text-destructive" />
      <span className="font-bold text-card-foreground">{streak}</span>
      <span className="text-sm text-muted-foreground">day streak</span>
    </div>
  );
}
