// Re-export all Supabase utilities for cleaner imports
export { createClient } from './client';
export { createClient as createServerClient } from './server';
export { updateSession } from './middleware';

// Auth utilities
export {
  getUser,
  getSession,
  signUp,
  signIn,
  signOut,
  resetPassword,
} from './auth';

// Database utilities
export {
  getProfile,
  createProfile,
  updateProfile,
  getUserEntries,
  createEntry,
  getEntriesInDateRange,
} from './database';
