# Requirements Document

## Introduction

Narrate is a modern digital journaling application that helps users reflect on their daily lives and discover their personal story through the "Hero's Journal" concept. The MVP focuses on private journal entries with AI-generated weekly summaries to help users understand their personal journey. The application will be built as a full-stack, single-page application using Next.js 15, Tailwind CSS 4, Supabase, and Google Gemini API.

## Requirements

### Requirement 1: User Authentication System

**User Story:** As a user, I want to securely create an account and log in to access my private journal, so that my personal entries remain protected and accessible only to me.

#### Acceptance Criteria

1. WHEN a new user visits the application THEN the system SHALL display a clean, minimalist sign-up page
2. WHEN a user provides valid email and password credentials THEN the system SHALL create a new account using Supabase Auth
3. WHEN an existing user provides valid credentials THEN the system SHALL authenticate them and redirect to the dashboard
4. WHEN a user forgets their password THEN the system SHALL provide a password reset functionality
5. WHEN an unauthenticated user tries to access protected routes THEN the system SHALL redirect them to the login page
6. WHEN a user successfully authenticates THEN the system SHALL create or update their profile in the profiles table

### Requirement 2: Journal Entry Management

**User Story:** As a user, I want to write and save daily journal entries, so that I can document my thoughts and experiences over time.

#### Acceptance Criteria

1. WHEN an authenticated user accesses the dashboard THEN the system SHALL display a clean text area for writing journal entries
2. WHEN a user writes content in the journal entry form THEN the system SHALL provide a "Save Entry" button
3. WHEN a user clicks "Save Entry" THEN the system SHALL store the entry in the Supabase entries table linked to the current user
4. WHEN an entry is saved THEN the system SHALL display a confirmation message to the user
5. WHEN the entries table is accessed THEN the system SHALL enforce Row-Level Security to ensure users can only access their own entries

### Requirement 3: Past Entries Display

**User Story:** As a user, I want to view my previous journal entries, so that I can reflect on my past thoughts and track my personal growth.

#### Acceptance Criteria

1. WHEN an authenticated user accesses the dashboard THEN the system SHALL display a list of their past entries
2. WHEN displaying past entries THEN the system SHALL sort them with the most recent first
3. WHEN showing each entry THEN the system SHALL display the date and a content snippet
4. WHEN a user has no previous entries THEN the system SHALL display an appropriate empty state message
5. WHEN entries are fetched THEN the system SHALL only retrieve entries belonging to the authenticated user

### Requirement 4: AI-Powered Weekly Summary Generation

**User Story:** As a user, I want to receive AI-generated summaries of my weekly journal entries, so that I can gain insights into my personal journey and identify themes in my experiences.

#### Acceptance Criteria

1. WHEN an authenticated user is on the dashboard THEN the system SHALL display a "Generate My Weekly Summary" button
2. WHEN a user clicks the summary button THEN the system SHALL trigger a Next.js Server Action
3. WHEN the Server Action executes THEN the system SHALL fetch all entries for the current user from the last 7 days
4. WHEN entries are retrieved THEN the system SHALL make a secure server-side API call to Google Gemini API
5. WHEN calling the Gemini API THEN the system SHALL use the specified prompt format with user entries inserted
6. WHEN the AI response is received THEN the system SHALL display the summary in a clean modal or pop-up window
7. WHEN no entries exist for the past week THEN the system SHALL display an appropriate message to the user
8. WHEN fewer than 5 entries exist for the past week THEN the system SHALL display a message encouraging more journaling before generating a summary

### Requirement 5: Database Schema and Security

**User Story:** As a system administrator, I want a secure and well-structured database schema, so that user data is properly organized and protected.

#### Acceptance Criteria

1. WHEN the database is set up THEN the system SHALL create a profiles table with id, username, and created_at fields
2. WHEN the database is set up THEN the system SHALL create an entries table with id, user_id, content, and created_at fields
3. WHEN the entries table is created THEN the system SHALL enable Row-Level Security (RLS)
4. WHEN RLS is configured THEN the system SHALL ensure users can only read and write their own journal entries
5. WHEN a user profile is created THEN the system SHALL link it to the auth.users.id from Supabase Auth

### Requirement 6: Responsive User Interface

**User Story:** As a user, I want a clean, modern, and responsive interface, so that I can comfortably write journal entries on any device.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL display a clean, minimal, and modern design using Tailwind CSS 4
2. WHEN accessed on different screen sizes THEN the system SHALL be fully responsive for both desktop and mobile browsers
3. WHEN displaying the writing interface THEN the system SHALL focus on typography and whitespace for a calm writing environment
4. WHEN users interact with forms THEN the system SHALL provide clear visual feedback and validation states
5. WHEN displaying content THEN the system SHALL ensure optimal readability and accessibility

### Requirement 7: Environment Configuration and Deployment

**User Story:** As a developer, I want proper environment configuration and deployment setup, so that the application can be securely deployed and maintained.

#### Acceptance Criteria

1. WHEN the application is configured THEN the system SHALL use environment variables for all sensitive keys
2. WHEN environment variables are set THEN the system SHALL include Supabase URL, Supabase Anon Key, and Gemini API Key
3. WHEN the application is structured THEN the system SHALL follow Next.js App Router paradigm with logical code organization
4. WHEN the application is deployed THEN the system SHALL be optimized for Vercel deployment
5. WHEN API calls are made THEN the system SHALL handle errors gracefully and provide user-friendly error messages
