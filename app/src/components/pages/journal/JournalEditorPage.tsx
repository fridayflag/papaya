import JournalEntryEditor from "@/components/features/journal-editor/JournalEntryEditor";
import { getDatabaseClient } from "@/model/database/database-client";
import { useEffect } from "react";


export default function JournalEditorPage() {

  useEffect(() => {
    getDatabaseClient().then((db) => {
      db.query('papaya/journal_entries_by_rid', { include_docs: true }).then((result) => {
        console.log(result);
      })
    })

  }, []);


  return (
    <JournalEntryEditor />
  )
}
