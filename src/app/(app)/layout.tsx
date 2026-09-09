import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { LiveTournamentProvider } from "@/components/live/LiveTournamentProvider";
import { getTournamentMeta } from "@/lib/data";
import { liveHealth } from "@/lib/data/health";
import { getCurrentTournamentId } from "@/lib/tournament/current";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const tournamentId = await getCurrentTournamentId();
  const meta = await getTournamentMeta(tournamentId);
  const { sources } = liveHealth();

  return (
    <LiveTournamentProvider tournamentId={tournamentId}>
      <AppShell meta={meta} degradedSources={sources}>
        {children}
      </AppShell>
    </LiveTournamentProvider>
  );
}
