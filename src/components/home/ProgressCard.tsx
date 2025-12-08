import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

interface SubjectProgress {
  id: string;
  name: string;
  icon: string | null;
  chaptersCount: number;
  progress: number;
  completedTopics?: number;
  totalTopics?: number;
  displayText?: string; // "X of Y topics completed"
}

interface ProgressCardProps {
  subject: SubjectProgress;
}

export function ProgressCard({ subject }: ProgressCardProps) {
  const isAllComplete = subject.completedTopics === subject.totalTopics && subject.totalTopics > 0;
  
  return (
    <Link 
      to={`/learn?subject=${subject.id}`}
      className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{subject.icon || '📚'}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground">{subject.name}</h3>
          {/* Show "X of Y topics completed" instead of percentage */}
          <p className="text-sm text-muted-foreground">
            {subject.displayText || `${subject.chaptersCount} chapters available`}
          </p>
        </div>
        <div className="text-right">
          {isAllComplete ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Done!</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary">{subject.progress}%</span>
          )}
        </div>
      </div>
      <Progress value={subject.progress} className="mt-3 h-2" />
    </Link>
  );
}
