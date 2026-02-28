import { DEFAULT_CURRENCY } from '@/constants/settings';
import { useActiveJournal } from '@/hooks/queries';
import { useUserPreferences } from '@/hooks/state/useUserPreferences';
import { DisplayableJournalEntry } from '@/schema/aggregate-schemas';
import { JournalFormCodec } from '@/schema/codec-schemas';
import { JournalEntryForm, JournalEntryFormSchema } from '@/schema/form-schemas';
import { Entry } from '@/schema/journal/resource/documents';
import { makeJournalEntry, makePapayaUrn } from '@/schema/support/factory';
import { makeDisplayableJournalEntry } from '@/utils/aggregate-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';

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

export function JournalEntryEditorContextProvider(props: PropsWithChildren) {
  const { children } = props;

  const activeJournalQuery = useActiveJournal();
  const activeJournalId = activeJournalQuery.data?.journalId;
  const settings = useUserPreferences();
  const currency = settings?.journal.currency.entry ?? DEFAULT_CURRENCY;

  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  const initialFormValues: JournalEntryForm = useMemo(() => {
    const entry = editingEntry ?? makeJournalEntry(
      activeJournalId ?? makePapayaUrn('papaya:document:journal'),
      currency
    );
    return JournalFormCodec.decode(entry);
  }, []);

  const form = useForm<JournalEntryForm>({
    resolver: zodResolver(JournalEntryFormSchema),
    defaultValues: initialFormValues,
  });

  const watchedValues = form.watch();

  const displayableEditingEntry: DisplayableJournalEntry | null = useMemo(() => {
    if (!editingEntry) return null;
    const marshalled = JournalFormCodec.encode(watchedValues);
    return makeDisplayableJournalEntry(marshalled) ?? null;
  }, [editingEntry, watchedValues]);

  const beginEditing = useCallback((entry: Entry) => {
    setEditingEntry(entry);
    setIsEditorOpen(true);
    form.reset(JournalFormCodec.decode(entry))
  }, []);

  const beginCreating = useCallback(() => {
    if (!activeJournalId) {
      return;
    }
    const entry = makeJournalEntry(activeJournalId, currency);
    setEditingEntry(entry);
    setIsEditorOpen(true);
    form.reset(JournalFormCodec.decode(entry))
  }, []);

  const openEditor = useCallback(() => {
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const value: JournalEntryEditorContext = {
    editingEntry,
    isEditorOpen,
    beginEditing,
    beginCreating,
    openEditor,
    closeEditor,
    form,
    displayableEditingEntry,
  };

  return (
    <JournalEntryEditorContext.Provider value={value}>
      {children}
    </JournalEntryEditorContext.Provider>
  );
}
