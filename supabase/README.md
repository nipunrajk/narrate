# Supabase Database Setup

This directory contains the database schema and configuration for the Narrate application.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to Settings > API to get your project URL and anon key

### 2. Configure Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `schema.sql`
3. Run the SQL to create the tables and policies

### 4. Verify Setup

The schema creates:

- **profiles table**: Stores user profile information
- **entries table**: Stores journal entries
- **Row Level Security (RLS)**: Ensures users can only access their own data
- **Automatic profile creation**: Trigger that creates a profile when a user signs up

### Database Schema

#### Profiles Table

- `id` (UUID, Primary Key): References auth.users.id
- `username` (TEXT, Optional): User's display name
- `created_at` (TIMESTAMP): When the profile was created

#### Entries Table

- `id` (UUID, Primary Key): Unique entry identifier
- `user_id` (UUID, Foreign Key): References profiles.id
- `content` (TEXT, Required): The journal entry content
- `created_at` (TIMESTAMP): When the entry was created

### Security Features

- **Row Level Security (RLS)** is enabled on both tables
- Users can only read/write their own data
- Foreign key constraints ensure data integrity
- Automatic profile creation on user signup

### Performance Optimizations

- Indexes on frequently queried columns
- Optimized queries for date-based filtering
- Efficient user-specific data retrieval
