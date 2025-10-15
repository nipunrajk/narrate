/**
 * Database connectivity and setup check utilities
 */

import { createClient } from '@/lib/supabase/server';

export interface DatabaseStatus {
  connected: boolean;
  tablesExist: boolean;
  error?: string;
  details?: unknown;
}

/**
 * Check if the database is properly set up
 */
export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    const supabase = await createClient();

    // Test our actual tables directly
    const { error: entriesError } = await supabase
      .from('entries')
      .select('id')
      .limit(1);

    if (entriesError) {
      if (
        entriesError.code === 'PGRST116' ||
        entriesError.message?.includes('relation')
      ) {
        return {
          connected: true,
          tablesExist: false,
          error: 'Database tables not created yet',
          details: entriesError,
        };
      }

      return {
        connected: false,
        tablesExist: false,
        error: 'Database connection failed',
        details: entriesError,
      };
    }

    return {
      connected: true,
      tablesExist: true,
    };
  } catch (error) {
    return {
      connected: false,
      tablesExist: false,
      error: 'Unexpected database error',
      details: error,
    };
  }
}

/**
 * Get a user-friendly message based on database status
 */
export function getDatabaseStatusMessage(status: DatabaseStatus): string {
  if (!status.connected) {
    return 'Unable to connect to the database. Please check your configuration.';
  }

  if (!status.tablesExist) {
    return 'Database tables are not set up yet. Please run the database migration.';
  }

  return 'Database is ready!';
}
