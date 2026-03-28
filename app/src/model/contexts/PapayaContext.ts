'use client';

import { Preferences } from "@/model/schema/resource-schemas";
import { createContext } from "react";

export interface PapayaContext {
  preferences: Preferences;
}

export const PapayaContext = createContext<PapayaContext>({
  preferences: null,
});
