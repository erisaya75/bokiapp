'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { JournalEntry } from '@/types/gl';
import { initialJournalEntries } from '@/data/journals';

interface GLContextValue {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  updateEntryStatus: (id: string, status: JournalEntry['status']) => void;
}

const GLContext = createContext<GLContextValue | null>(null);

export function GLProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialJournalEntries);

  function addEntry(entry: JournalEntry) {
    setEntries(prev => [entry, ...prev]);
  }

  function updateEntryStatus(id: string, status: JournalEntry['status']) {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, status } : e))
    );
  }

  return (
    <GLContext.Provider value={{ entries, addEntry, updateEntryStatus }}>
      {children}
    </GLContext.Provider>
  );
}

export function useGL() {
  const ctx = useContext(GLContext);
  if (!ctx) throw new Error('useGL must be used within GLProvider');
  return ctx;
}
