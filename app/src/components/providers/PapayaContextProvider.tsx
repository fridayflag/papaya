'use client'

import { PapayaContext } from "@/model/contexts/PapayaContext";
import { preferencesRepository } from "@/model/orm/repositories";
import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

export function PapayaContextProvider(props: PropsWithChildren) {
  const preferencesQuery = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const preferences = await preferencesRepository.getOrCreatePreferences();
      return preferences;
    },
    initialData: null,
  });

  if (!preferencesQuery.data) {
    return null;
  }
  const preferences = preferencesQuery.data;
  return (
    <PapayaContext.Provider value={{ preferences }}>
      {props.children}
    </PapayaContext.Provider>
  )

}