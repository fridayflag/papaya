'use client';

import { JournalContext } from "@/model/contexts/JournalContext";
import { PropsWithChildren, useContext } from "react";

export function ActiveJournalGuard(props: PropsWithChildren) {
  const { activeJournal } = useContext(JournalContext);

  if (!activeJournal) {
    return null;
  }

  return props.children;
}
