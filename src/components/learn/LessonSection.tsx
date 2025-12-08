/**
 * Lesson Section Component
 * Display section content with formatting, examples, and checkpoint
 * Requirements: 1.2, 1.3, 1.4
 */

import { CheckCircle2, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LessonSectionProps {
  title: string;
  content: string;
  example?: string;
  keyPoints?: string[];
  isCompleted: boolean;
  isLast: boolean;
  onComplete: () => void;
  onNext: () => void;
  xpReward?: number;
}

export function LessonSection({
  title,
  content,
  example,
  keyPoints,
  isCompleted,
  isLast,
  onComplete,
  onNext,
  xpReward = 10,
}: LessonSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>

        {/* Main content */}
        <div className="mt-4 text-foreground leading-relaxed whitespace-pre-wrap">
          {content}
        </div>

        {/* Example box */}
        {example && (
          <div className="mt-4 rounded-lg bg-accent p-4">
            <div className="flex items-center gap-2 text-accent-foreground font-medium">
              <Lightbulb className="h-4 w-4" />
              <span>Example</span>
            </div>
            <p className="mt-2 text-accent-foreground/80 whitespace-pre-wrap">
              {example}
            </p>
          </div>
        )}

        {/* Key points */}
        {keyPoints && keyPoints.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-foreground mb-2">Key Points:</h3>
            <ul className="space-y-2">
              {keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Checkpoint button */}
        <div className="mt-6 pt-4 border-t border-border">
          {!isCompleted ? (
            <Button onClick={onComplete} className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              I Understand This! (+{xpReward} XP)
            </Button>
          ) : !isLast ? (
            <Button onClick={onNext} className="w-full">
              Next Section
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
              Section completed!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Section navigation tabs
interface SectionTabsProps {
  sections: Array<{ id: string; title: string }>;
  currentIndex: number;
  completedIndices: Set<number>;
  onSelect: (index: number) => void;
}

export function SectionTabs({
  sections,
  currentIndex,
  completedIndices,
  onSelect,
}: SectionTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {sections.map((section, index) => (
        <button
          key={section.id}
          onClick={() => onSelect(index)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
            currentIndex === index
              ? 'bg-primary text-primary-foreground'
              : completedIndices.has(index)
              ? 'bg-primary/20 text-primary'
              : 'bg-card border border-border text-card-foreground'
          )}
        >
          {completedIndices.has(index) && <CheckCircle2 className="h-4 w-4" />}
          <span>
            {index + 1}. {section.title}
          </span>
        </button>
      ))}
    </div>
  );
}
