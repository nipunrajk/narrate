import { createClient } from './server';
import { Profile, JournalEntry } from '../types/database';

// Helper functions for common database operations
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function createProfile(profile: {
  id: string;
  username?: string | null;
}): Promise<Profile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }

  return data;
}

export async function updateProfile(
  userId: string,
  updates: { username?: string | null }
): Promise<Profile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
}

export async function getUserEntries(
  userId: string,
  limit?: number
): Promise<JournalEntry[]> {
  const supabase = await createClient();

  let query = supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }

  return data || [];
}

export async function createEntry(entry: {
  user_id: string;
  content: string;
}): Promise<JournalEntry> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('entries')
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error('Error creating entry:', error);
    throw error;
  }

  return data;
}

export async function getEntriesInDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<JournalEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries in date range:', error);
    throw error;
  }

  return data || [];
}
