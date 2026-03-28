'use client';

import NotificationsProvider from "@/components/providers/NotificationsProvider";
import { PapayaContextProvider } from "@/components/providers/PapayaContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient()

export default function AppDataLayout(props: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <PapayaContextProvider>
        <NotificationsProvider>
          {props.children}
        </NotificationsProvider>
      </PapayaContextProvider>
    </QueryClientProvider>
  )
}
