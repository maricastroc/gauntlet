import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/PageHeading";
import { GroupCard } from "@/components/standings/GroupCard";
import { PlayableBracket } from "@/components/bracket/PlayableBracket";
import { TitleOdds } from "@/components/forecast/TitleOdds";
import { getBracket, getConsoleGroups, getGroups, getStandingsView } from "@/lib/data";
import { titleOddsFrom } from "@/lib/forecast/bracket";
import type { RawMatch } from "@/lib/standings";
import { getCurrentTournamentId } from "@/lib/tournament/current";

export const metadata: Metadata = { title: "Live" };
export const dynamic = "force-dynamic";

export default async function LivePage() {
  const tournamentId = await getCurrentTournamentId();
  const [standings, consoleGroups, bracket, groups] = await Promise.all([
    getStandingsView(tournamentId),
    getConsoleGroups(tournamentId),
    getBracket(tournamentId),
    getGroups(tournamentId),
  ]);

  const detailById = new Map(consoleGroups.map((detail) => [detail.id, detail]));

  const resultsOf = (groupId: number): RawMatch[] =>
    (detailById.get(groupId)?.fixtures ?? []).flatMap((fixture) =>
      fixture.status !== "finished" ||
      !fixture.home ||
      !fixture.away ||
      fixture.homeScore == null ||
      fixture.awayScore == null
        ? []
        : [
            {
              homeId: fixture.home.id,
              awayId: fixture.away.id,
              homeScore: fixture.homeScore,
              awayScore: fixture.awayScore,
            },
          ],
    );

  const titleOdds = titleOddsFrom(bracket, groups);
  const hasBracket = bracket.ties.length > 0;
  const empty = standings.length === 0 && !hasBracket;

  return (
    <div className="pb-8">
      <PageHeading
        eyebrow="Spectator"
        title="Live"
        subtitle="Standings, bracket and title odds — updating on their own as results come in. No refresh needed."
      />

      {standings.length > 0 && (
        <section className="px-5 pt-3 sm:px-6">
          <p className="eyebrow mb-3">Group stage</p>
          <div className="grid gap-5 lg:grid-cols-2">
            {standings.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                teams={detailById.get(group.id)?.teams ?? group.standings.map((row) => row.team)}
                matches={resultsOf(group.id)}
              />
            ))}
          </div>
        </section>
      )}

      {hasBracket && (
        <section className="pt-6">
          <p className="eyebrow mb-1 px-5 sm:px-6">Knockout</p>
          <TitleOdds odds={titleOdds} />
          <PlayableBracket initial={bracket} tournamentId={tournamentId} spectator />
        </section>
      )}

      {empty && (
        <div className="px-5 pt-3 sm:px-6">
          <div className="rounded-md border border-dashed border-line-2 px-6 py-12 text-center text-[14px] text-ink-mute">
            This tournament hasn&apos;t started yet — results will appear here live.
          </div>
        </div>
      )}
    </div>
  );
}
