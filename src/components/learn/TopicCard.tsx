import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface TopicData {
  id: string;
  name: string;
  conceptCount: number;
  mastery: number;
}

interface TopicCardProps {
  topic: TopicData;
  onClick: () => void;
}

export function TopicCard({ topic, onClick }: TopicCardProps) {
  const getMasteryColor = (mastery: number) => {
    if (mastery >= 70) return 'text-primary';
    if (mastery >= 40) return 'text-chart-4';
    return 'text-muted-foreground';
  };

  const getMasteryLabel = (mastery: number) => {
    if (mastery >= 70) return 'Strong';
    if (mastery >= 40) return 'Learning';
    if (mastery > 0) return 'Needs practice';
    return 'Not started';
  };

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        {topic.mastery >= 70 ? (
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
        ) : (
          <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground mt-0.5" />
        )}
        
        <div className="flex-1">
          <h3 className="font-medium text-card-foreground">{topic.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("text-sm font-medium", getMasteryColor(topic.mastery))}>
              {getMasteryLabel(topic.mastery)}
            </span>
            <span className="text-xs text-muted-foreground">
              • {topic.conceptCount} concepts
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <span className={cn("text-lg font-bold", getMasteryColor(topic.mastery))}>
            {topic.mastery}%
          </span>
        </div>
      </div>
    </button>
  );
}
