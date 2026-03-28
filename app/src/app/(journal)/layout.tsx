import { JournalContextProvider } from "@/components/providers/JournalContextProvider";
import { PropsWithChildren } from "react";


export default function JournalRouteGroupLayout(props: PropsWithChildren) {
  return (
    <JournalContextProvider>
      {props.children}
    </JournalContextProvider>
  )
}
