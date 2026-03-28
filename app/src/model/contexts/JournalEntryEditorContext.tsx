'use client';

import { JournalEntryForm } from '@/model/schema/form-schemas';
import { JournalEntry } from '@/model/schema/resource-schemas';
import { createContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

export interface JournalEntryEditorContext {
  editingEntry: JournalEntry | null;
  isEditorOpen: boolean;
  form: UseFormReturn<JournalEntryForm>;
  beginEditing: (entry: JournalEntry) => void;
  beginCreating: () => void;
  openEditor: () => void;
  closeEditor: () => void;
}

export const JournalEntryEditorContext = createContext<JournalEntryEditorContext>({
  editingEntry: null,
  isEditorOpen: false,
  form: null as unknown as UseFormReturn<JournalEntryForm>,
  beginEditing: () => { },
  beginCreating: () => { },
  openEditor: () => { },
  closeEditor: () => { },
});
