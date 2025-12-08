/**
 * Lesson Section Component
 * Display section content with formatting, examples, and checkpoint
 * Requirements: 1.2, 1.3, 1.4, 6.1, 6.2
 * 
 * Supports different section types with appropriate styling:
 * - Introduction: Blue info box
 * - Concept: Standard text with headings
 * - Example: Numbered steps with solution
 * - Formula: Highlighted box with formula
 * - Remember: Yellow callout box (Property 9)
 * - Summary: Bullet points
 */

import { CheckCircle2, Lightbulb, ChevronRight, BookOpen, Star, Calculator, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SectionType } from '@/services/lessonSectionService';

/**
 * Parse and render markdown-like content into React elements
 * Handles: **bold**, bullet points, numbered lists, line breaks
 */
function renderFormattedContent(content: string): React.ReactNode {
  // Split content into paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  return paragraphs.map((paragraph, pIdx) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;
    
    // Check if it's a bullet list
    const bulletLines = trimmed.split('\n').filter(line => 
      line.trim().startsWith('- ') || line.trim().startsWith('• ')
    );
    
    if (bulletLines.length > 0 && bulletLines.length === trimmed.split('\n').filter(l => l.trim()).length) {
      return (
        <ul key={pIdx} className="my-3 space-y-2 pl-1">
          {bulletLines.map((line, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-primary mt-1.5 text-xs">●</span>
              <span>{renderInlineFormatting(line.replace(/^[-•]\s*/, ''))}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    // Check if it's a numbered list
    const numberedLines = trimmed.split('\n').filter(line => 
      /^\d+[\.\)]\s/.test(line.trim())
    );
    
    if (numberedLines.length > 0 && numberedLines.length === trimmed.split('\n').filter(l => l.trim()).length) {
      return (
        <ol key={pIdx} className="my-3 space-y-2 pl-1">
          {numberedLines.map((line, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                {idx + 1}
              </span>
              <span className="pt-0.5">{renderInlineFormatting(line.replace(/^\d+[\.\)]\s*/, ''))}</span>
            </li>
          ))}
        </ol>
      );
    }
    
    // Check for section headers (lines ending with :)
    const lines = trimmed.split('\n');
    if (lines.length > 1) {
      return (
        <div key={pIdx} className="my-3">
          {lines.map((line, idx) => {
            const trimmedLine = line.trim();
            // Header detection
            if (trimmedLine.endsWith(':') && trimmedLine.length < 50 && !trimmedLine.includes('=')) {
              return (
                <h4 key={idx} className="font-semibold text-foreground mt-4 mb-2">
                  {renderInlineFormatting(trimmedLine)}
                </h4>
              );
            }
            // Regular line
            return (
              <p key={idx} className="mb-1">
                {renderInlineFormatting(trimmedLine)}
              </p>
            );
          })}
        </div>
      );
    }
    
    // Regular paragraph
    return (
      <p key={pIdx} className="my-3 leading-relaxed">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });
}

/**
 * Render inline formatting: **bold**, *italic*, `code`
 */
function renderInlineFormatting(text: string): React.ReactNode {
  // Split by formatting markers and process
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  
  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Code: `text`
    const codeMatch = remaining.match(/`([^`]+)`/);
    
    // Find the earliest match
    const matches = [
      boldMatch ? { type: 'bold', match: boldMatch, index: remaining.indexOf(boldMatch[0]) } : null,
      codeMatch ? { type: 'code', match: codeMatch, index: remaining.indexOf(codeMatch[0]) } : null,
    ].filter(Boolean).sort((a, b) => a!.index - b!.index);
    
    if (matches.length === 0) {
      // No more formatting, add remaining text
      parts.push(remaining);
      break;
    }
    
    const first = matches[0]!;
    
    // Add text before the match
    if (first.index > 0) {
      parts.push(remaining.substring(0, first.index));
    }
    
    // Add formatted element
    if (first.type === 'bold') {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {first.match![1]}
        </strong>
      );
    } else if (first.type === 'code') {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
          {first.match![1]}
        </code>
      );
    }
    
    // Continue with remaining text
    remaining = remaining.substring(first.index + first.match![0].length);
  }
  
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

interface LessonSectionProps {
  title: string;
  content: string;
  sectionType?: SectionType;
  example?: string;
  keyPoints?: string[];
  ncertRef?: string;
  isCompleted: boolean;
  isLast: boolean;
  onComplete: () => void;
  onNext: () => void;
  xpReward?: number;
}

// Get section-specific styling
function getSectionStyles(sectionType?: SectionType) {
  const styles: Record<SectionType, { bg: string; border: string; icon: React.ReactNode }> = {
    introduction: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-l-4 border-blue-500',
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
    },
    concept: {
      bg: 'bg-white dark:bg-gray-900',
      border: 'border border-gray-200 dark:border-gray-700',
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
    },
    example: {
      bg: 'bg-gray-50 dark:bg-gray-800/50',
      border: 'border-l-4 border-gray-400',
      icon: <FileText className="h-5 w-5 text-gray-600" />,
    },
    formula: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-l-4 border-purple-500',
      icon: <Calculator className="h-5 w-5 text-purple-600" />,
    },
    remember: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-l-4 border-yellow-500',
      icon: <Star className="h-5 w-5 text-yellow-600" />,
    },
    summary: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-l-4 border-green-500',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    },
  };

  return styles[sectionType || 'concept'];
}

export function LessonSection({
  title,
  content,
  sectionType = 'concept',
  example,
  keyPoints,
  ncertRef,
  isCompleted,
  isLast,
  onComplete,
  onNext,
  xpReward = 10,
}: LessonSectionProps) {
  const styles = getSectionStyles(sectionType);
  const isRememberSection = sectionType === 'remember';
  const isFormulaSection = sectionType === 'formula';

  return (
    <Card className={cn('overflow-hidden', styles.border)}>
      <CardContent className={cn('pt-6', styles.bg)}>
        {/* Section header with icon */}
        <div className="flex items-center gap-2 mb-4">
          {styles.icon}
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>

        {/* Remember section callout box - Property 9 */}
        {isRememberSection && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg border border-yellow-300 dark:border-yellow-700">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 font-semibold text-sm">
              <Star className="h-4 w-4" />
              <span>Important to Remember</span>
            </div>
          </div>
        )}

        {/* Formula section with monospace styling */}
        {isFormulaSection && (
          <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg border border-purple-300 dark:border-purple-700">
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200 font-semibold text-sm">
              <Calculator className="h-4 w-4" />
              <span>Key Formula</span>
            </div>
          </div>
        )}

        {/* Main content - properly formatted */}
        <div className={cn(
          'mt-4 text-foreground',
          isFormulaSection && 'font-mono text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-lg'
        )}>
          {renderFormattedContent(content)}
        </div>

        {/* Example box */}
        {example && (
          <div className="mt-5 rounded-lg bg-accent/50 border border-accent p-4">
            <div className="flex items-center gap-2 text-accent-foreground font-semibold mb-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>Example</span>
            </div>
            <div className="text-accent-foreground/90">
              {renderFormattedContent(example)}
            </div>
          </div>
        )}

        {/* Key points */}
        {keyPoints && keyPoints.length > 0 && (
          <div className="mt-5 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Key Points
            </h3>
            <ul className="space-y-2">
              {keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80">{renderInlineFormatting(point)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NCERT Reference - Property 3 */}
        {ncertRef && (
          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-muted-foreground">
            📚 <span className="font-medium">Reference:</span> {ncertRef}
          </div>
        )}

        {/* Checkpoint button */}
        <div className="mt-6 pt-4 border-t border-border">
          {!isCompleted ? (
            <Button onClick={onComplete} className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {xpReward && xpReward > 0 ? `I Understand This! (+${xpReward} XP)` : 'I Reviewed This!'}
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
