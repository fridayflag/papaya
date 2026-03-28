'use client';

import { ActiveJournalGuard } from "@/components/guards/ActiveJournalGuard";
import { JournalContextProvider } from "@/components/providers/JournalContextProvider";
import { JournalEntryEditorContextProvider } from "@/components/providers/JournalEntryEditorContextProvider";
import { PropsWithChildren } from "react";

export default function JournalRouteGroupLayout(props: PropsWithChildren) {
  return (
    <JournalContextProvider>
      <ActiveJournalGuard>
        <JournalEntryEditorContextProvider>
          {props.children}
        </JournalEntryEditorContextProvider>
      </ActiveJournalGuard>
    </JournalContextProvider>
  )
}
