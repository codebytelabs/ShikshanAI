# Requirements Document

## Introduction

This specification addresses critical issues to make ShikshanAI beta-ready. The app currently has four major problems:
1. Progress shows random percentages instead of real calculated progress, and reset doesn't work properly
2. AI Tutor chat is not connected to any AI backend - it shows mock responses
3. Practice questions repeat the same set without proper question bank management
4. User data is device-bound with no authentication or cloud sync capability

This spec will fix these issues to deliver a functional beta product with real AI tutoring, accurate progress tracking, proper practice question management, and optional user authentication for data sync.

## Glossary

- **ShikshanAI**: The educational PWA application for NCERT curriculum
- **OpenRouter**: AI API gateway providing access to multiple LLM models
- **Progress**: Calculated percentage of completed topics/chapters per subject
- **AI Coach**: The tutoring chatbot that answers student doubts using AI
- **Practice Session**: A set of questions from the question bank for a topic/chapter
- **Device ID**: Unique identifier for anonymous users stored locally
- **User Profile**: Authenticated user account that can sync across devices
- **Question Bank**: Pool of practice questions organized by topic and difficulty

## Requirements

### Requirement 1: Accurate Progress Tracking

**User Story:** As a student, I want to see my actual learning progress, so that I can track my real advancement through the curriculum.

#### Acceptance Criteria

1. WHEN a student completes a topic THEN the System SHALL record the completion in the student_progress table with timestamp
2. WHEN displaying subject progress THEN the System SHALL calculate percentage as (completed_topics / total_topics) × 100
3. WHEN a student resets their profile THEN the System SHALL delete all progress records for that student and reset progress to 0%
4. WHEN a student views the home page after fresh onboarding THEN the System SHALL display 0% progress for all subjects
5. WHEN progress data is retrieved THEN the System SHALL query actual completion records rather than generating random values

### Requirement 2: AI-Powered Tutor Chat

**User Story:** As a student, I want to ask doubts to an AI tutor that understands my subject context, so that I can get relevant help with my studies.

#### Acceptance Criteria

1. WHEN a student sends a message THEN the System SHALL call the OpenRouter API with the configured model
2. WHEN generating AI responses THEN the System SHALL include context about the student's current grade, subject, and chapter
3. WHEN the AI responds THEN the System SHALL provide hint-first pedagogy before showing full solutions
4. WHEN a student asks off-topic questions THEN the System SHALL redirect the conversation back to educational content within scope
5. WHEN the AI generates a response THEN the System SHALL ground answers in NCERT curriculum content
6. WHEN the OpenRouter API fails THEN the System SHALL display an error message and allow retry
7. WHEN serializing chat messages for the API THEN the System SHALL format them according to OpenRouter's expected schema
8. WHEN deserializing API responses THEN the System SHALL parse the response and extract the assistant message content

### Requirement 3: Dynamic Practice Questions

**User Story:** As a student, I want to practice with varied questions that don't repeat, so that I can effectively test my understanding.

#### Acceptance Criteria

1. WHEN loading practice questions THEN the System SHALL fetch questions from the database filtered by topic
2. WHEN a student completes a question THEN the System SHALL record the attempt with correctness status
3. WHEN loading a new practice session THEN the System SHALL prioritize questions the student has not attempted or answered incorrectly
4. WHEN all questions for a topic are exhausted THEN the System SHALL allow re-practice with previously completed questions
5. WHEN displaying practice progress THEN the System SHALL show questions attempted vs total available

### Requirement 4: User Authentication and Data Sync

**User Story:** As a student, I want to optionally sign up and sync my data across devices, so that I can continue learning from any device.

#### Acceptance Criteria

1. WHEN a user is not authenticated THEN the System SHALL store all data locally using device_id
2. WHEN a user signs up or logs in THEN the System SHALL link their device data to their authenticated account
3. WHEN an authenticated user logs in on a new device THEN the System SHALL sync their progress and preferences from the cloud
4. WHEN a user has been using the app anonymously for 3+ sessions THEN the System SHALL prompt them to sign up to sync data
5. WHEN displaying the profile page THEN the System SHALL show login/signup option for anonymous users
6. WHEN a user logs out THEN the System SHALL retain local data but disconnect from cloud sync
7. WHEN merging anonymous data with authenticated account THEN the System SHALL preserve the most recent progress for each topic

### Requirement 5: Real Data Integration

**User Story:** As a developer, I want all features to work with real database data, so that the app functions correctly in production.

#### Acceptance Criteria

1. WHEN the app loads THEN the System SHALL fetch curriculum data from Supabase
2. WHEN displaying any statistics THEN the System SHALL calculate from actual database records
3. WHEN the database has no seed data THEN the System SHALL display appropriate empty states with guidance
4. WHEN API calls fail THEN the System SHALL display user-friendly error messages with retry options
