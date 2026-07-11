import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/PageHeading";
import { ConsoleScreen } from "@/components/console/ConsoleScreen";
import { getBracket, getConsoleGroups } from "@/lib/data";
import { getCurrentTournamentId } from "@/lib/tournament/current";

export const metadata: Metadata = { title: "Console" };
export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const tournamentId = await getCurrentTournamentId();
  const [groups, bracket] = await Promise.all([
    getConsoleGroups(tournamentId),
    getBracket(tournamentId),
  ]);

  return (
    <div className="pb-8">
      <PageHeading
        eyebrow="Console"
        title="Edit results"
        subtitle="Pick a group or knockout round, adjust any score in place, and watch the table recalculate. Each result saves on its own, atomically."
      />
      <ConsoleScreen groups={groups} bracket={bracket} tournamentId={tournamentId} />
    </div>
  );
}
