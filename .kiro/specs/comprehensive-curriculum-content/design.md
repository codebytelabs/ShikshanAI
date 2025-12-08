# Design Document: Comprehensive Curriculum Content

## Overview

This design adds a `lesson_sections` table to store structured educational content for each topic, along with comprehensive practice questions. The content is NCERT-aligned and follows the CBSE 2025-26 syllabus.

## Architecture

### Database Schema Extension

```
topics (existing)
  └── lesson_sections (new) - Ordered content sections
  └── practice_questions (existing, enhanced)
```

### New Table: lesson_sections

```sql
CREATE TABLE public.lesson_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'introduction', 'concept', 'example', 'formula', 'remember', 'summary'
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown content
  display_order INTEGER NOT NULL DEFAULT 0,
  ncert_ref TEXT, -- e.g., "NCERT Class 10 Math, p. 5"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Section Types

1. **introduction** - Topic overview and learning objectives
2. **concept** - Core concept explanation
3. **example** - Worked example with step-by-step solution
4. **formula** - Key formula with explanation
5. **remember** - Important points to memorize
6. **summary** - Topic summary and key takeaways

## Components and Interfaces

### LessonSection Component

Renders different section types with appropriate styling:
- Introduction: Blue info box
- Concept: Standard text with headings
- Example: Numbered steps with solution
- Formula: Highlighted box with formula
- Remember: Yellow callout box
- Summary: Bullet points

### Content Format

Content is stored as Markdown with:
- Math expressions in LaTeX: `$x^2 + y^2 = z^2$`
- Bold for key terms: `**important term**`
- Numbered lists for steps
- Code blocks for formulas

## Data Models

### LessonSection Interface

```typescript
interface LessonSection {
  id: string;
  topicId: string;
  sectionType: 'introduction' | 'concept' | 'example' | 'formula' | 'remember' | 'summary';
  title: string;
  content: string; // Markdown
  displayOrder: number;
  ncertRef?: string;
}
```

### Enhanced PracticeQuestion

```typescript
interface PracticeQuestion {
  id: string;
  topicId: string;
  question: string;
  questionType: 'mcq' | 'numerical' | 'short';
  options?: string[]; // For MCQ
  correctAnswer: string;
  hint?: string;
  solution: string; // Step-by-step solution
  ncertRef?: string; // e.g., "Ex 1.1, Q3"
  difficulty: 'easy' | 'medium' | 'hard';
}
```

## Content Structure per Topic

Each topic should have:
1. 1 Introduction section
2. 2-4 Concept sections
3. 2-3 Example sections
4. 1-3 Formula sections (if applicable)
5. 1 Remember section
6. 1 Summary section
7. 10-15 Practice questions (mix of difficulties)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Section ordering consistency
*For any* topic, lesson sections should be returned in display_order sequence, and the order should be deterministic across multiple fetches.
**Validates: Requirements 1.1**

### Property 2: Content completeness
*For any* topic with lesson sections, there should be at least one introduction section and one summary section.
**Validates: Requirements 1.2**

### Property 3: NCERT reference display
*For any* lesson section or practice question with an ncert_ref field set, the reference should be included in the rendered output.
**Validates: Requirements 1.4, 2.4**

### Property 4: Question type diversity
*For any* topic with practice questions, there should be questions of at least 2 different question types (mcq, numerical, short).
**Validates: Requirements 3.1**

### Property 5: Solution presence
*For any* practice question, the solution field should be non-empty and contain step-by-step explanation.
**Validates: Requirements 3.2**

### Property 6: Difficulty level presence
*For any* practice question, the difficulty field should be set to one of: 'easy', 'medium', 'hard'.
**Validates: Requirements 3.3**

### Property 7: Minimum topics per chapter
*For any* chapter in Class 10 Mathematics or Science, there should be at least 3 topics with lesson content.
**Validates: Requirements 4.2, 5.2**

### Property 8: Minimum questions per topic
*For any* topic with content, there should be at least 10 practice questions.
**Validates: Requirements 4.3, 5.3**

### Property 9: Remember section rendering
*For any* lesson section with section_type 'remember', the content should be rendered with callout box styling.
**Validates: Requirements 6.2**

## Error Handling

- Missing content: Show placeholder with "Content coming soon"
- Failed fetch: Retry with exponential backoff
- Markdown parse error: Display raw text as fallback

## Testing Strategy

### Unit Tests
- Test section ordering logic
- Test content rendering for each section type
- Test question filtering by difficulty

### Property-Based Tests
- Use fast-check to verify section ordering is deterministic
- Verify content completeness across random topic selections
