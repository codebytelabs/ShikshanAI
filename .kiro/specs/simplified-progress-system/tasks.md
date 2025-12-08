# Implementation Plan

- [x] 1. Create status calculation service
  - [x] 1.1 Create `src/services/topicStatusService.ts` with TopicStatus types and interfaces
    - Define TopicStatus type: 'not_started' | 'learning' | 'practice' | 'completed'
    - Define TopicProgressInfo interface with status, progress, displayText, actionText, iconType
    - Define StatusInput interface
    - _Requirements: 1.1_

  - [x] 1.2 Implement `calculateTopicStatus` function
    - Return 'not_started' when sectionsCompleted = 0 and questionsAttempted = 0
    - Return 'learning' when sectionsCompleted > 0 but < totalSections
    - Return 'practice' when sectionsCompleted = totalSections but questionsAttempted < 3
    - Return 'completed' when sectionsCompleted = totalSections AND questionsAttempted >= 3
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.3 Write property test for status determination
    - **Property 1: Status Determination Consistency**
    - **Validates: Requirements 1.1**

  - [x] 1.4 Implement progress percentage calculation
    - 0% for not_started
    - 12.5% per section for learning (up to 37.5% at 3/4 sections)
    - 50% for practice status
    - 100% for completed
    - _Requirements: 1.3, 1.4, 1.5_

  - [x] 1.5 Write property tests for progress ranges
    - **Property 2: Learning Status Progress Range**
    - **Property 3: Practice Status Fixed Progress**
    - **Property 4: Completed Status Full Progress**
    - **Validates: Requirements 1.3, 1.4, 1.5**

  - [x] 1.6 Implement display text and icon type helpers
    - getDisplayText(status): "Not Started", "Learning", "Practice", "Completed"
    - getActionText(status): null, "Continue", "Practice now", null
    - getIconType(status): 'empty', 'half', 'half', 'check'
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 1.7 Write property test for icon type mapping
    - **Property 6: Icon Type Mapping**
    - **Property 7: Action Text for Practice Status**
    - **Validates: Requirements 3.1, 3.2**

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create chapter progress calculation
  - [x] 3.1 Implement `calculateChapterProgress` function
    - Count topics with 'completed' status
    - Calculate percentage: (completedCount / totalCount) * 100
    - Return ChapterProgressInfo with completedTopics, totalTopics, progress, displayText
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Write property test for chapter progress
    - **Property 5: Chapter Progress Calculation**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 3.3 Implement subject progress text formatter
    - Format: "X of Y topics completed"
    - Special case: "All topics completed!" when X = Y
    - _Requirements: 5.1, 5.3_

  - [x] 3.4 Write property test for subject progress text
    - **Property 8: Subject Progress Text Format**
    - **Validates: Requirements 5.1**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update database queries
  - [x] 5.1 Create `getTopicStatusData` function to fetch learning and practice data
    - Query student_topic_learning for sections completed
    - Query question_attempts for questions attempted count
    - Return combined data for status calculation
    - _Requirements: 1.1_

  - [x] 5.2 Update progressService to use new status system
    - Replace mastery-based calculations with status-based
    - Update getSubjectProgress to count completed topics
    - Update getChapterProgress to use new calculation
    - _Requirements: 2.1, 5.1, 5.2_

- [x] 6. Update UI components
  - [x] 6.1 Create TopicStatusBadge component
    - Display icon based on iconType (empty circle, half-filled, checkmark)
    - Show status text or action button
    - Use appropriate colors: gray (not started), blue (learning), orange (practice), green (completed)
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 6.2 Update ChapterDetail page topic list
    - Replace mastery percentage with TopicStatusBadge
    - Show "Practice now →" button for practice status
    - Show checkmark for completed topics
    - _Requirements: 1.1, 3.1, 3.2, 3.3_

  - [x] 6.3 Update Home page subject cards
    - Show "X of Y topics completed" instead of percentage
    - Update progress bar to use completed topics count
    - _Requirements: 5.1, 5.2_

  - [x] 6.4 Update TopicLearn page completion flow
    - After completing all sections, show "Now practice to complete this topic!"
    - After 3+ practice questions, show "Topic Completed! 🎉"
    - _Requirements: 4.3_

- [x] 7. Remove old mastery system references
  - [x] 7.1 Update masteryService to work with new status system
    - Keep mastery tracking for internal use (spaced repetition later)
    - Remove mastery percentage from UI-facing functions
    - _Requirements: 1.1_

  - [x] 7.2 Update any remaining UI showing mastery %
    - Search for "mastery" in components
    - Replace with status-based display
    - _Requirements: 1.1_

- [x] 8. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
