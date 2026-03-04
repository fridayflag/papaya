import { DisplayableJournalEntry } from '@/schema/aggregate-schemas';
import { JournalEntryForm } from '@/schema/form-schemas';
import { Entry } from '@/schema/journal/resource/documents';
import {
  createContext
} from 'react';
import { UseFormReturn } from 'react-hook-form';

export interface JournalEntryEditorContext {
  editingEntry: Entry | null;
  isEditorOpen: boolean;
  form: UseFormReturn<JournalEntryForm>;
  beginEditing: (entry: Entry) => void;
  beginCreating: () => void;
  openEditor: () => void;
  closeEditor: () => void;
  displayableEditingEntry: DisplayableJournalEntry | null;
}

export const JournalEntryEditorContext = createContext<JournalEntryEditorContext>({
  editingEntry: null,
  isEditorOpen: false,
  form: null as unknown as UseFormReturn<JournalEntryForm>,
  beginEditing: () => { },
  beginCreating: () => { },
  openEditor: () => { },
  closeEditor: () => { },
  displayableEditingEntry: null,
});
