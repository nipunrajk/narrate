'use client';

import { useOptimistic } from 'react';
import type { JournalEntry } from '@/lib/types/database';

export type OptimisticEntry = JournalEntry & {
  isPending?: boolean;
};

export function useOptimisticEntries(initialEntries: JournalEntry[]) {
  const [optimisticEntries, addOptimisticEntry] = useOptimistic(
    initialEntries,
    (state: OptimisticEntry[], newEntry: OptimisticEntry) => {
      // If the entry already exists (by id), update it
      const existingIndex = state.findIndex(
        (entry) => entry.id === newEntry.id
      );
      if (existingIndex !== -1) {
        const updatedState = [...state];
        updatedState[existingIndex] = { ...newEntry, isPending: false };
        return updatedState;
      }

      // Otherwise, add the new entry at the beginning (most recent first)
      return [newEntry, ...state];
    }
  );

  const addEntry = (entry: Partial<JournalEntry> & { content: string }) => {
    const optimisticEntry: OptimisticEntry = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      user_id: entry.user_id || '',
      content: entry.content,
      created_at: new Date().toISOString(),
      isPending: true,
    };

    addOptimisticEntry(optimisticEntry);
  };

  const updateEntry = (updatedEntry: JournalEntry) => {
    addOptimisticEntry({ ...updatedEntry, isPending: false });
  };

  return {
    entries: optimisticEntries,
    addEntry,
    updateEntry,
  };
}
