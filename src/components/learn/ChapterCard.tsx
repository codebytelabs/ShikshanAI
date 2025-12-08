import { Progress } from '@/components/ui/progress';
import { Lock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterData {
  id: string;
  name: string;
  topicsCount: number;
  progress: number;
  isLocked: boolean;
  completedTopics?: number;
  totalTopics?: number;
  displayText?: string;
}

interface ChapterCardProps {
  chapter: ChapterData;
  index: number;
  onClick: () => void;
}

export function ChapterCard({ chapter, index, onClick }: ChapterCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={chapter.isLocked}
      className={cn(
        "w-full rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-all",
        chapter.isLocked 
          ? "opacity-60 cursor-not-allowed" 
          : "hover:shadow-md active:scale-[0.99]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold",
          chapter.isLocked 
            ? "bg-muted text-muted-foreground" 
            : chapter.progress >= 60 
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
        )}>
          {chapter.isLocked ? <Lock className="h-4 w-4" /> : index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground line-clamp-2">
            {chapter.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {chapter.topicsCount} topics
          </p>
          
          {!chapter.isLocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {chapter.displayText || `${chapter.completedTopics ?? 0} of ${chapter.totalTopics ?? chapter.topicsCount} topics completed`}
                </span>
                {chapter.completedTopics === chapter.totalTopics && chapter.totalTopics > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="font-medium text-primary">{chapter.progress}%</span>
                )}
              </div>
              <Progress value={chapter.progress} className="mt-1 h-1.5" />
            </div>
          )}
        </div>
        
        {!chapter.isLocked && (
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}
