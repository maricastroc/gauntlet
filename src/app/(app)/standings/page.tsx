import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";
import { GroupCard } from "@/components/standings/GroupCard";
import { getGroups } from "@/lib/data";
import { getCurrentTournamentId } from "@/lib/tournament/current";

export const metadata: Metadata = { title: "Standings" };
export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const tournamentId = await getCurrentTournamentId();
  const groups = await getGroups(tournamentId);

  const notStarted =
    groups.length > 0 && groups.every((group) => group.standings.every((row) => row.played === 0));

  return (
    <div className="pb-8">
      <PageHeading
        eyebrow="Group stage"
        title="Standings"
        subtitle="A live projection of the matches — points, goal difference and the qualification cut, always recalculated."
      />

      {notStarted && (
        <div className="px-5 pt-4 sm:px-6">
          <Link
            href="/console"
            className="flex flex-wrap items-center justify-between gap-3 rounded-[11px] border border-amber-line bg-amber-soft px-4 py-3 text-[13.5px] text-amber-ink transition-colors duration-150 hover:brightness-110"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">◆</span>
              Your groups are set — enter the first result to bring the table to life.
            </span>
            <span className="flex items-center gap-1 font-semibold">
              Open the Console
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      )}

      {groups.length > 0 ? (
        <div className="grid gap-5 px-5 pt-3 sm:px-6 lg:grid-cols-2">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="px-5 pt-3 sm:px-6">
          <div className="rounded-[11px] border border-dashed border-line-2 px-6 py-12 text-center text-[14px] text-ink-mute">
            This tournament has no group stage yet.
          </div>
        </div>
      )}
    </div>
  );
}
