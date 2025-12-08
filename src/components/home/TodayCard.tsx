import { Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TodayTask {
  id: string;
  title: string;
  subject: string;
  duration: string;
  type: string;
}

interface TodayCardProps {
  tasks: TodayTask[];
  onStart: () => void;
}

export function TodayCard({ tasks, onStart }: TodayCardProps) {
  const totalDuration = tasks.length * 5;
  
  return (
    <div className="rounded-xl bg-primary p-5 text-primary-foreground shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">Today's 10 Minutes</h2>
          <p className="mt-1 text-sm opacity-90">
            {tasks.length} tasks • {totalDuration} minutes
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">{totalDuration}m</span>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="rounded-lg bg-primary-foreground/10 px-3 py-2"
          >
            <p className="font-medium">{task.title}</p>
            <p className="text-xs opacity-80">{task.subject}</p>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={onStart}
        className="mt-4 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
      >
        <Play className="mr-2 h-4 w-4" />
        Start Learning
      </Button>
    </div>
  );
}
