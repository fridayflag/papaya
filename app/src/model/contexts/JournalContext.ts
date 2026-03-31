'use client';

import { JournalRid } from '@/model/schema/namespace-schemas';
import { Journal } from '@/model/schema/resource-schemas';
import { createContext } from 'react';

export interface JournalContext {
  activeJournal: Journal | undefined;
  setActiveJournalRid: (journalRid: JournalRid) => void;
}

export const JournalContext = createContext<JournalContext>({
  activeJournal: null,
  setActiveJournalRid: () => { },
});
