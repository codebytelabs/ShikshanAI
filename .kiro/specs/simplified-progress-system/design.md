# Design Document: Simplified Progress System

## Overview

This feature replaces the confusing dual progress/mastery system with a single, intuitive status-based system. Instead of showing arbitrary percentages like "30% mastery", topics will show clear statuses: Not Started, Learning, Practice, or Completed.

## Architecture

The simplified system uses a single source of truth for topic status, derived from two existing data points:
1. Lesson section completion (from `student_topic_learning`)
2. Practice question attempts (from `question_attempts`)

```
┌─────────────────────────────────────────────────────────────┐
│                    Topic Status Flow                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Not Started ──► Learning ──► Practice ──► Completed        │
│      (0%)        (25-50%)      (50%)        (100%)          │
│                                                             │
│  No activity    Sections     All sections   Lesson +        │
│                 in progress   done          3+ questions    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### TopicStatus Enum

```typescript
type TopicStatus = 'not_started' | 'learning' | 'practice' | 'completed';

interface TopicProgressInfo {
  status: TopicStatus;
  progress: number; // 0-100
  displayText: string;
  actionText: string | null;
  iconType: 'empty' | 'half' | 'check';
}
```

### Status Calculation Service

```typescript
interface StatusInput {
  sectionsCompleted: number;
  totalSections: number;
  questionsAttempted: number;
  minQuestionsRequired: number; // Default: 3
}

function calculateTopicStatus(input: StatusInput): TopicProgressInfo;
```

### Chapter Progress Calculation

```typescript
interface ChapterProgressInfo {
  completedTopics: number;
  totalTopics: number;
  progress: number; // 0-100
  displayText: string; // "3 of 5 topics completed"
}

function calculateChapterProgress(topicStatuses: TopicStatus[]): ChapterProgressInfo;
```

## Data Models

### No New Tables Required

The system uses existing tables:
- `student_topic_learning` - sections completed
- `question_attempts` - practice attempts

### Status Derivation Logic

| Sections Done | Questions Done | Status | Progress |
|--------------|----------------|--------|----------|
| 0 | 0 | not_started | 0% |
| 1-3 of 4 | any | learning | 12.5-37.5% |
| 4 of 4 | 0-2 | practice | 50% |
| 4 of 4 | 3+ | completed | 100% |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Status Determination Consistency
*For any* topic learning state (sections completed, questions attempted), the calculated status SHALL always be one of exactly four values: 'not_started', 'learning', 'practice', or 'completed'.
**Validates: Requirements 1.1**

### Property 2: Learning Status Progress Range
*For any* topic in 'learning' status (1 to totalSections-1 sections completed), the progress percentage SHALL be between 12.5% and 37.5% (proportional to sections completed out of half the total progress).
**Validates: Requirements 1.3**

### Property 3: Practice Status Fixed Progress
*For any* topic in 'practice' status (all sections done, fewer than 3 questions), the progress SHALL be exactly 50%.
**Validates: Requirements 1.4**

### Property 4: Completed Status Full Progress
*For any* topic in 'completed' status (all sections done AND 3+ questions attempted), the progress SHALL be exactly 100%.
**Validates: Requirements 1.5**

### Property 5: Chapter Progress Calculation
*For any* chapter with N topics where M are completed, the chapter progress SHALL equal (M / N) * 100, rounded to nearest integer.
**Validates: Requirements 2.1, 2.2**

### Property 6: Icon Type Mapping
*For any* topic status, the icon type SHALL be: 'empty' for not_started, 'half' for learning or practice, 'check' for completed.
**Validates: Requirements 3.1**

### Property 7: Action Text for Practice Status
*For any* topic in 'practice' status, the actionText SHALL be "Practice now" and NOT a percentage.
**Validates: Requirements 3.2**

### Property 8: Subject Progress Text Format
*For any* subject with M completed topics out of N total, the displayText SHALL match the format "M of N topics completed".
**Validates: Requirements 5.1**

## Error Handling

- If section data is missing, default to 0 sections completed
- If question data is missing, default to 0 questions attempted
- Invalid inputs (negative numbers) should be treated as 0
- Total sections should default to 4 if not specified

## Testing Strategy

### Property-Based Testing

Using `fast-check` library for property-based tests:

1. **Status calculation properties** - Generate random section/question counts and verify status rules
2. **Progress calculation properties** - Verify progress percentages match expected ranges
3. **Chapter aggregation properties** - Generate random topic statuses and verify chapter progress

### Unit Tests

1. Edge cases: 0 sections, 0 questions, all complete
2. Boundary conditions: exactly 3 questions, exactly 4 sections
3. Display text formatting

### Integration Tests

1. UI components render correct status
2. Database queries return correct data for status calculation
