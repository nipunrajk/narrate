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

// Helper types for Supabase operations
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

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

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Date range type for weekly summaries
export interface DateRange {
  start: Date;
  end: Date;
}

// Entry with formatted date for display
export interface FormattedJournalEntry extends JournalEntry {
  formatted_date: string;
  relative_date: string;
}
