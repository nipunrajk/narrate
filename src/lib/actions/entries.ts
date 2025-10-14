'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  validateEntryContent,
  sanitizeEntryContent,
} from '@/lib/utils/validation';
import type { ApiResponse, JournalEntry } from '@/lib/types/database';

/**
 * Server action to save a journal entry
 */
export async function saveEntry(
  content: string
): Promise<ApiResponse<JournalEntry>> {
  try {
    // Validate input
    const validation = validateEntryContent(content);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors[0] || 'Invalid entry content',
      };
    }

    // Sanitize content
    const sanitizedContent = sanitizeEntryContent(content);

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Save entry to database
    const { data, error } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        content: sanitizedContent,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error saving entry:', error);
      return {
        success: false,
        error: 'Failed to save entry. Please try again.',
      };
    }

    // Revalidate the dashboard page to show the new entry
    revalidatePath('/dashboard');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Unexpected error saving entry:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Server action to fetch user's journal entries
 */
export async function getUserEntries(): Promise<ApiResponse<JournalEntry[]>> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Fetch entries from database (RLS will ensure user only gets their own entries)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }); // Most recent first

    if (error) {
      console.error('Database error fetching entries:', error);
      return {
        success: false,
        error: 'Failed to fetch entries. Please try again.',
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Unexpected error fetching entries:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Server action to update an existing journal entry
 */
export async function updateEntry(
  entryId: string,
  content: string
): Promise<ApiResponse<JournalEntry>> {
  try {
    // Validate input
    const validation = validateEntryContent(content);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors[0] || 'Invalid entry content',
      };
    }

    // Sanitize content
    const sanitizedContent = sanitizeEntryContent(content);

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Update entry in database (RLS will ensure user can only update their own entries)
    const { data, error } = await supabase
      .from('entries')
      .update({
        content: sanitizedContent,
      })
      .eq('id', entryId)
      .eq('user_id', user.id) // Extra security check
      .select()
      .single();

    if (error) {
      console.error('Database error updating entry:', error);
      return {
        success: false,
        error: 'Failed to update entry. Please try again.',
      };
    }

    // Revalidate the dashboard page
    revalidatePath('/dashboard');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Unexpected error updating entry:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
