import JournalEntryEditor from "@/components/features/journal-editor/JournalEntryEditor";


type DisplayableJournalStatus = 'loading' | 'idle' | 'no-journal';

export function JournalEditorPage() {
  return (
    <JournalEntryEditor />
  )
}
