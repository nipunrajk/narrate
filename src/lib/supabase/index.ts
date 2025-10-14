// Re-export all Supabase utilities for cleaner imports
export { createClient } from './client';
export { createClient as createServerClient } from './server';
export { updateSession } from './middleware';

// Server-side auth utilities
export { getUser, getSession } from './auth-server';

// Client-side auth utilities
export { signUp, signIn, signOut, resetPassword } from './auth';

// Profile utilities
export { getProfile, createProfile, updateProfile } from './auth';
