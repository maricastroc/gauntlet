import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/PageHeading";
import { ConsoleScreen } from "@/components/console/ConsoleScreen";
import { getConsoleGroups } from "@/lib/data";
import { getCurrentTournamentId } from "@/lib/tournament/current";

export const metadata: Metadata = { title: "Console" };
export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const tournamentId = await getCurrentTournamentId();
  const groups = await getConsoleGroups(tournamentId);

  return (
    <div className="pb-8">
      <PageHeading
        eyebrow="Console"
        title="Edit results"
        subtitle="Pick a group, adjust any score in place, and watch the table recalculate. Each result saves on its own, atomically."
      />
      <ConsoleScreen groups={groups} />
    </div>
  );
}
