// Core database types for the Narrate application

export interface Profile {
  id: string;
  username: string | null;
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
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string | null;
        };
      };
      entries: {
        Row: JournalEntry;
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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
