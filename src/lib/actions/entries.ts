'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  validateEntryContent,
  sanitizeEntryContent,
} from '@/lib/utils/validation';
import { getLastWeekRange, formatDate } from '@/lib/utils/date';
import { generateWeeklySummary, GeminiAPIError } from '@/lib/ai';
import type {
  ApiResponse,
  JournalEntry,
  WeeklySummary,
} from '@/lib/types/database';

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
      console.error('Database error saving entry:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Provide more specific error messages based on error type
      let userMessage = 'Failed to save entry. Please try again.';

      if (
        error.code === 'PGRST116' ||
        error.message?.includes('relation') ||
        error.message?.includes('table')
      ) {
        userMessage =
          'Database table not found. Please contact support to set up your account.';
      } else if (error.code === '42P01') {
        userMessage =
          'Database schema not initialized. Please contact support.';
      } else if (
        error.message?.includes('permission') ||
        error.message?.includes('RLS')
      ) {
        userMessage = 'Access denied. Please log in again.';
      }

      return {
        success: false,
        error: userMessage,
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

// Simple getUserEntries without caching to avoid auth conflicts

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
      console.error('Database error fetching entries:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Provide more specific error messages based on error type
      let userMessage = 'Failed to fetch entries. Please try again.';

      if (
        error.code === 'PGRST116' ||
        error.message?.includes('relation') ||
        error.message?.includes('table')
      ) {
        userMessage =
          'Database table not found. Please contact support to set up your account.';
      } else if (error.code === '42P01') {
        userMessage =
          'Database schema not initialized. Please contact support.';
      } else if (
        error.message?.includes('permission') ||
        error.message?.includes('RLS')
      ) {
        userMessage = 'Access denied. Please log in again.';
      }

      return {
        success: false,
        error: userMessage,
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
/**
 * Server action to fetch entries from the last 7 days for weekly summary
 */
export async function getEntriesForWeeklySummary(): Promise<
  ApiResponse<JournalEntry[]>
> {
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

    // Get date range for the last 7 days
    const { start, end } = getLastWeekRange();

    // Fetch entries from the last 7 days
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: true }); // Chronological order for AI processing

    if (error) {
      console.error('Database error fetching entries for summary:', error);
      return {
        success: false,
        error: 'Failed to fetch entries for summary. Please try again.',
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Unexpected error fetching entries for summary:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Server action to generate a weekly summary using AI
 */
export async function generateWeeklySummaryAction(): Promise<
  ApiResponse<WeeklySummary>
> {
  try {
    // Get entries from the last 7 days
    const entriesResult = await getEntriesForWeeklySummary();

    if (!entriesResult.success || !entriesResult.data) {
      return {
        success: false,
        error: entriesResult.error || 'Failed to fetch entries',
      };
    }

    const entries = entriesResult.data;

    // Check minimum entry threshold (5 entries)
    if (entries.length < 5) {
      return {
        success: false,
        error: `You need at least 5 journal entries from the last 7 days to generate a summary. You currently have ${entries.length} entries.`,
      };
    }

    // Get date range for formatting
    const { start, end } = getLastWeekRange();
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    // Convert entries to the format expected by the AI
    const entriesForAI = entries.map((entry) => ({
      content: entry.content,
      created_at: entry.created_at,
    }));

    // Generate summary using Gemini API
    const aiSummary = await generateWeeklySummary(
      entriesForAI,
      startDate,
      endDate
    );

    // Convert AI response to database format
    const weeklySummary: WeeklySummary = {
      summary: aiSummary.summary,
      theme: aiSummary.theme,
      insights: aiSummary.insights,
      period: {
        start: startDate,
        end: endDate,
      },
    };

    return {
      success: true,
      data: weeklySummary,
    };
  } catch (error) {
    console.error('Error generating weekly summary:', error);

    // Handle specific Gemini API errors
    if (error instanceof GeminiAPIError) {
      let userMessage = 'Failed to generate weekly summary. ';

      switch (error.code) {
        case 'MISSING_API_KEY':
          userMessage += 'AI service is not configured properly.';
          break;
        case 'RATE_LIMIT':
          userMessage +=
            'Too many requests. Please try again in a few minutes.';
          break;
        case 'AUTH_ERROR':
          userMessage += 'AI service authentication failed.';
          break;
        case 'NETWORK_ERROR':
          userMessage +=
            'Network connection issue. Please check your internet and try again.';
          break;
        default:
          userMessage += 'Please try again later.';
      }

      return {
        success: false,
        error: userMessage,
      };
    }

    return {
      success: false,
      error:
        'An unexpected error occurred while generating your summary. Please try again.',
    };
  }
}

/**
 * Server action to check if user has enough entries for weekly summary
 */
export async function canGenerateWeeklySummary(): Promise<
  ApiResponse<{ canGenerate: boolean; entryCount: number }>
> {
  try {
    const entriesResult = await getEntriesForWeeklySummary();

    if (!entriesResult.success || !entriesResult.data) {
      return {
        success: false,
        error: entriesResult.error || 'Failed to check entries',
      };
    }

    const entryCount = entriesResult.data.length;
    const canGenerate = entryCount >= 5;

    return {
      success: true,
      data: {
        canGenerate,
        entryCount,
      },
    };
  } catch (error) {
    console.error('Error checking weekly summary eligibility:', error);
    return {
      success: false,
      error: 'Failed to check summary eligibility. Please try again.',
    };
  }
}
