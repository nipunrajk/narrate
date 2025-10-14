import { createClient } from './client';

// Client-side auth helpers
export async function signUp(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // Profile creation is handled by middleware after email confirmation
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  return { error };
}

export async function resetPassword(email: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  return { data, error };
}

// Profile management functions
export async function getProfile(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateProfile(
  userId: string,
  updates: { username?: string }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

export async function createProfile(userId: string, email: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: email.split('@')[0],
    })
    .select()
    .single();

  return { data, error };
}
