// Core database types for the Narrate application

export interface Profile {
  id: string;
  username?: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface WeeklySummary {
  summary: string;
  theme: string;
  period: {
    start: string;
    end: string;
  };
}

// Supabase database schema types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'> & {
          id: string;
          created_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      entries: {
        Row: JournalEntry;
        Insert: Omit<JournalEntry, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<JournalEntry, 'id' | 'user_id'>>;
      };
    };
  };
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form types
export interface AuthFormData {
  email: string;
  password: string;
}

export interface EntryFormData {
  content: string;
}
