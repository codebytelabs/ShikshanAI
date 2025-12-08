# Requirements Document

## Introduction

The current progress/mastery system in ShikshanAI is confusing for users. There are two separate metrics (progress % and mastery %) that overlap and create confusion. A topic showing "30% mastery" after completing the lesson doesn't make intuitive sense. This feature simplifies the system to a single, clear metric that users can understand at a glance.

## Glossary

- **Topic Status**: The current learning state of a topic (Not Started, Learning, Completed, Mastered)
- **Progress Percentage**: A single percentage showing how much of a topic/chapter/subject is complete
- **Learning Flow**: The sequence: Learn Concept → Practice Questions → Mastery
- **Completion**: A topic is complete when the student has learned the concept AND practiced questions

## Requirements

### Requirement 1

**User Story:** As a student, I want to see a simple status for each topic, so that I know exactly what I need to do next.

#### Acceptance Criteria

1. WHEN a student views a topic THEN the system SHALL display one of four clear statuses: "Not Started", "Learning", "Practice", or "Completed"
2. WHEN a topic has no activity THEN the system SHALL show "Not Started" with 0% progress
3. WHEN a student has started but not finished the lesson THEN the system SHALL show "Learning" with progress based on sections completed
4. WHEN a student has completed the lesson but not practiced THEN the system SHALL show "Practice" with 50% progress
5. WHEN a student has completed both lesson and practice THEN the system SHALL show "Completed" with 100% progress

### Requirement 2

**User Story:** As a student, I want to see chapter progress as a simple percentage, so that I know how much of the chapter I've finished.

#### Acceptance Criteria

1. WHEN viewing a chapter THEN the system SHALL display progress as percentage of topics completed
2. WHEN calculating chapter progress THEN the system SHALL count only fully completed topics (lesson + practice done)
3. WHEN no topics are completed THEN the system SHALL show 0% chapter progress
4. WHEN all topics are completed THEN the system SHALL show 100% chapter progress

### Requirement 3

**User Story:** As a student, I want clear visual indicators for topic status, so that I can quickly scan and see what needs attention.

#### Acceptance Criteria

1. WHEN displaying topic status THEN the system SHALL use distinct icons: empty circle (Not Started), half-filled circle (Learning/Practice), checkmark (Completed)
2. WHEN a topic needs practice THEN the system SHALL show "Practice now" as the action text instead of a percentage
3. WHEN a topic is completed THEN the system SHALL show a green checkmark with "Completed" text

### Requirement 4

**User Story:** As a student, I want to understand what "completed" means, so that I have a clear goal.

#### Acceptance Criteria

1. WHEN a student asks what completion means THEN the system SHALL define it as: finished all lesson sections AND answered at least 3 practice questions
2. WHEN displaying topic details THEN the system SHALL show completion criteria: "Learn (4 sections) + Practice (3+ questions)"
3. WHEN a student completes a topic THEN the system SHALL show a celebration message explaining they've mastered the basics

### Requirement 5

**User Story:** As a student, I want the home screen to show my overall progress simply, so that I feel motivated to continue.

#### Acceptance Criteria

1. WHEN viewing the home screen THEN the system SHALL show subject progress as "X of Y topics completed"
2. WHEN viewing subject cards THEN the system SHALL show a progress bar based on completed topics count
3. WHEN all topics in a subject are completed THEN the system SHALL show "All topics completed!" with a celebration indicator
