# Requirements Document

## Introduction

This document specifies requirements for a comprehensive overhaul of ShikshanAI's learning experience to match and exceed market leaders like BYJU'S, Khan Academy, Vedantu, and Duolingo. The current app goes directly from topic selection to practice/quiz mode, skipping the critical "concept teaching" phase that all successful EdTech platforms implement.

**Key Problem:** When a student selects a topic, they should first LEARN the concept through engaging, interactive content before being asked to practice or test. Currently, ShikshanAI skips teaching entirely.

**Market Research Summary:**
- BYJU'S: Animated videos with real-world examples, visual storytelling, gamified paths
- Khan Academy: Micro-lessons, mastery system, Khanmigo AI tutor, energy points, badges
- Vedantu: Live interaction, in-class quizzes, leaderboards
- Duolingo: Streaks, XP, levels, daily goals, loss aversion mechanics

## Glossary

- **ShikshanAI**: The AI-powered CBSE learning application
- **Topic**: A specific learning unit within a chapter (e.g., "Quadratic Equations")
- **Concept Lesson**: AI-generated interactive teaching content for a topic
- **XP (Experience Points)**: Points earned for learning activities
- **Streak**: Consecutive days of learning activity
- **Mastery Level**: Proficiency indicator (0-100%) for a topic
- **Checkpoint**: Interactive "I understand" verification during lessons
- **Practice Mode**: Quiz with hints and explanations
- **Test Mode**: Assessment without hints

## Requirements

### Requirement 1: Topic Learning Experience (Concept-First)

**User Story:** As a student, I want to learn and understand a topic through engaging explanations before practicing, so that I can build a strong foundation before testing my knowledge.

#### Acceptance Criteria

1. WHEN a student selects a topic from the chapter detail page THEN ShikshanAI SHALL display a Topic Learning page with concept explanation content
2. WHEN displaying concept content THEN ShikshanAI SHALL present information in bite-sized sections with visual elements and real-world examples
3. WHEN explaining a concept THEN ShikshanAI SHALL use step-by-step walkthroughs with clear progression from simple to complex
4. WHEN a student completes a concept section THEN ShikshanAI SHALL display an interactive checkpoint asking "Did you understand this?"
5. WHEN a student indicates they understood THEN ShikshanAI SHALL award XP points and progress to the next section
6. WHEN a student indicates they did not understand THEN ShikshanAI SHALL offer alternative explanations or simpler examples
7. WHEN all concept sections are completed THEN ShikshanAI SHALL display options to "Practice" or "Take Test"
8. WHEN generating concept content THEN ShikshanAI SHALL use AI to create CBSE/NCERT-aligned explanations appropriate for the student's grade level

### Requirement 2: AI-Powered Concept Generation

**User Story:** As a student, I want AI-generated explanations that are engaging and easy to understand, so that I can learn effectively even for topics without pre-made content.

#### Acceptance Criteria

1. WHEN a topic has no pre-existing content THEN ShikshanAI SHALL generate concept explanations using AI based on CBSE/NCERT curriculum
2. WHEN generating explanations THEN ShikshanAI SHALL include at least one real-world example relevant to Indian students
3. WHEN generating explanations THEN ShikshanAI SHALL include visual descriptions or diagrams where applicable
4. WHEN generating explanations THEN ShikshanAI SHALL break content into 3-5 digestible sections
5. WHEN generating explanations THEN ShikshanAI SHALL use age-appropriate language for the student's grade level

### Requirement 3: Gamification - XP Points System

**User Story:** As a student, I want to earn points for my learning activities, so that I feel motivated and can track my progress.

#### Acceptance Criteria

1. WHEN a student completes a concept section THEN ShikshanAI SHALL award 10 XP points
2. WHEN a student answers a practice question correctly THEN ShikshanAI SHALL award 5 XP points
3. WHEN a student answers a practice question correctly on first attempt THEN ShikshanAI SHALL award 10 XP points (bonus)
4. WHEN a student completes a topic (all sections + practice) THEN ShikshanAI SHALL award 50 XP bonus points
5. WHEN a student completes a chapter THEN ShikshanAI SHALL award 200 XP bonus points
6. WHEN XP is awarded THEN ShikshanAI SHALL display an animated notification showing points earned
7. WHEN displaying the profile page THEN ShikshanAI SHALL show total XP and current level

### Requirement 4: Gamification - Daily Streaks

**User Story:** As a student, I want to maintain a daily learning streak, so that I build consistent study habits.

#### Acceptance Criteria

1. WHEN a student completes at least one learning activity in a day THEN ShikshanAI SHALL increment their streak counter
2. WHEN a student misses a day of learning THEN ShikshanAI SHALL reset their streak to zero
3. WHEN displaying the home page THEN ShikshanAI SHALL prominently show the current streak with a flame icon
4. WHEN a student is about to lose their streak (no activity today) THEN ShikshanAI SHALL display a reminder notification
5. WHEN a student reaches streak milestones (7, 30, 100 days) THEN ShikshanAI SHALL award bonus XP and a special badge

### Requirement 5: Gamification - Badges and Achievements

**User Story:** As a student, I want to earn badges for my achievements, so that I feel recognized for my progress.

#### Acceptance Criteria

1. WHEN a student completes their first topic THEN ShikshanAI SHALL award the "First Steps" badge
2. WHEN a student maintains a 7-day streak THEN ShikshanAI SHALL award the "Week Warrior" badge
3. WHEN a student achieves 80% mastery on a chapter THEN ShikshanAI SHALL award the "Chapter Champion" badge
4. WHEN a student earns 1000 XP THEN ShikshanAI SHALL award the "Rising Star" badge
5. WHEN a badge is earned THEN ShikshanAI SHALL display a celebratory animation and notification
6. WHEN displaying the profile page THEN ShikshanAI SHALL show all earned badges in a collection

### Requirement 6: Progress and Mastery System

**User Story:** As a student, I want to see my mastery level for each topic, so that I know which areas need more practice.

#### Acceptance Criteria

1. WHEN a student completes concept learning THEN ShikshanAI SHALL set initial mastery to 30%
2. WHEN a student answers practice questions THEN ShikshanAI SHALL update mastery based on accuracy (correct answers increase, incorrect decrease)
3. WHEN displaying topic cards THEN ShikshanAI SHALL show mastery percentage with a visual progress ring
4. WHEN mastery reaches 80% THEN ShikshanAI SHALL mark the topic as "Mastered" with a checkmark
5. WHEN displaying chapter progress THEN ShikshanAI SHALL calculate average mastery across all topics

### Requirement 7: Enhanced Practice Flow

**User Story:** As a student, I want practice sessions that adapt to my level and reinforce my learning, so that I can improve efficiently.

#### Acceptance Criteria

1. WHEN starting practice THEN ShikshanAI SHALL prioritize questions from topics with lower mastery
2. WHEN a student struggles with a question THEN ShikshanAI SHALL offer a "Review Concept" button linking back to the relevant lesson section
3. WHEN practice is complete THEN ShikshanAI SHALL display a summary with XP earned, accuracy, and areas to review
4. WHEN a student gets 3 questions wrong in a row THEN ShikshanAI SHALL suggest reviewing the concept before continuing

### Requirement 8: Daily Goals

**User Story:** As a student, I want to set daily learning goals, so that I can manage my study time effectively.

#### Acceptance Criteria

1. WHEN a student first uses the app THEN ShikshanAI SHALL prompt them to set a daily goal (15, 30, or 60 minutes)
2. WHEN displaying the home page THEN ShikshanAI SHALL show progress toward the daily goal
3. WHEN a student completes their daily goal THEN ShikshanAI SHALL display a celebration and award bonus XP
4. WHEN a student is close to completing their goal THEN ShikshanAI SHALL encourage them to finish

### Requirement 9: Improved Navigation Flow

**User Story:** As a student, I want a clear learning path that guides me from learning to practice to testing, so that I follow an effective study sequence.

#### Acceptance Criteria

1. WHEN clicking a topic THEN ShikshanAI SHALL navigate to the Topic Learning page (not directly to Practice)
2. WHEN on the Topic Learning page THEN ShikshanAI SHALL display a progress indicator showing: Learn → Practice → Test
3. WHEN concept learning is incomplete THEN ShikshanAI SHALL show Practice and Test as locked with a message "Complete learning first"
4. WHEN all phases are complete THEN ShikshanAI SHALL show a "Completed" status on the topic card

### Requirement 10: Content for Empty Topics

**User Story:** As a student, I want all topics to have learning content, so that I can study any topic in the curriculum.

#### Acceptance Criteria

1. WHEN a topic has no questions THEN ShikshanAI SHALL still display concept learning content generated by AI
2. WHEN a topic has no questions THEN ShikshanAI SHALL display "Practice questions coming soon" instead of an empty state
3. WHEN generating content for empty topics THEN ShikshanAI SHALL use the topic name and chapter context to create relevant explanations
