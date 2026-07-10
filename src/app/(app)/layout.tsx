import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { getTournamentMeta } from "@/lib/data";

export default function AppLayout({ children }: { children: ReactNode }) {
  const meta = getTournamentMeta();
  return <AppShell meta={meta}>{children}</AppShell>;
}
