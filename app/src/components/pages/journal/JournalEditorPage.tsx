import JournalEntryEditor from "@/components/features/journal-editor/JournalEntryEditor";


type DisplayableJournalStatus = 'loading' | 'idle' | 'no-journal';

export default function JournalEditorPage() {
  return (
    <JournalEntryEditor />
  )
}
