'use client';

import dynamic from "next/dynamic";
import { PropsWithChildren } from "react";

const JournalRouteGroupLayout = dynamic(() => import("@/components/layouts/JournalRouteGroupLayout"), {
  ssr: false,
})

export default function JournalRouteGroupNextLayout(props: PropsWithChildren) {
  return (
    <JournalRouteGroupLayout>
      {props.children}
    </JournalRouteGroupLayout>
  )
}
