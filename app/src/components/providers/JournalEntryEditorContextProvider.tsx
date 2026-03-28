'use client';

import { JournalContext } from '@/model/contexts/JournalContext';
import { JournalEntryEditorContext } from '@/model/contexts/JournalEntryEditorContext';
import { journalEntryRepository } from '@/model/orm/repositories';
import { JournalEntryToFormCodec } from '@/model/schema/codec-schemas';
import { JournalEntryForm, JournalEntryFormSchema } from '@/model/schema/form-schemas';
import { JournalEntry } from '@/model/schema/resource-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useContext,
  useState,
  type PropsWithChildren
} from 'react';
import { useForm } from 'react-hook-form';

export function JournalEntryEditorContextProvider(props: PropsWithChildren) {
  const { activeJournal } = useContext(JournalContext);

  const [editingEntry, setEditingEntry] = useState<JournalEntry>(() => {
    return journalEntryRepository.Model.make({
      journalRid: activeJournal.rid,
    });
  });

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [initialFormValues, setInitialFormValues] = useState<JournalEntryForm | null>(() => {
    return JournalEntryToFormCodec.decode(editingEntry);
  });

  const form = useForm<JournalEntryForm>({
    resolver: zodResolver(JournalEntryFormSchema.nullable()),
    defaultValues: initialFormValues,
  });

  const beginEditing = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsEditorOpen(true);
    const formValues: JournalEntryForm = JournalEntryToFormCodec.decode(entry);
    setInitialFormValues(formValues);
    form.reset(formValues);
  }

  const beginCreating = () => {
    const newEntry = journalEntryRepository.Model.make({
      journalRid: activeJournal.rid,
    });
    beginEditing(newEntry);
  }

  const openEditor = () => {
    setIsEditorOpen(true);
  }

  const closeEditor = () => {
    setIsEditorOpen(false);
  }

  const value: JournalEntryEditorContext = {
    editingEntry,
    isEditorOpen,
    beginEditing,
    beginCreating,
    openEditor,
    closeEditor,
    form,
  };

  return (
    <JournalEntryEditorContext.Provider value={value}>
      {props.children}
    </JournalEntryEditorContext.Provider>
  );
}
