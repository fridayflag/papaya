'use client';

import dynamic from "next/dynamic";

const JournalEditorPage = dynamic(() => import("@/components/pages/journal/JournalEditorPage"), {
  ssr: false,
})

export default function JournalPage() {
  return (
    <JournalEditorPage />
  )
}