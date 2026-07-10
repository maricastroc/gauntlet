import { PageHeading } from "@/components/ui/PageHeading";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { TiebreakNote } from "@/components/standings/TiebreakNote";
import { LiveCard } from "@/components/overview/LiveCard";
import { NextCard } from "@/components/overview/NextCard";
import { StatTiles } from "@/components/overview/StatTiles";
import { TitleRaceTeaser } from "@/components/overview/TitleRaceTeaser";
import { getOverview } from "@/lib/data";
import { getCurrentTournamentId } from "@/lib/tournament/current";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const tournamentId = await getCurrentTournamentId();
  const { featuredGroup, liveFixture, nextFixture, stats, titleOdds } =
    await getOverview(tournamentId);

  return (
    <div className="pb-8">
      <PageHeading
        eyebrow="Today"
        title="What needs your attention"
        subtitle="The match on the pitch now, the next one to decide, and where the table is tightest — gathered in one place."
      />

      <div className="grid grid-cols-1 gap-y-8 px-5 pt-4 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:gap-x-8 lg:gap-y-0">
        <section className="min-w-0 lg:border-r lg:border-line lg:pr-8">
          {featuredGroup ? (
            <>
              <div className="mb-3.5 flex items-center gap-2.5">
                <span className="eyebrow">Standings</span>
                <span className="rounded-[5px] border border-amber-line px-1.5 py-px font-mono text-[11px] uppercase tracking-[0.08em] text-amber-ink">
                  Group {featuredGroup.name}
                </span>
              </div>
              <StandingsTable group={featuredGroup} />
              {featuredGroup.tiebreakNote && <TiebreakNote note={featuredGroup.tiebreakNote} />}
            </>
          ) : (
            <div className="rounded-[11px] border border-dashed border-line-2 px-5 py-10 text-center text-[14px] text-ink-mute">
              No group stage yet. Build one from the tournaments screen.
            </div>
          )}
        </section>

        <aside className="flex min-w-0 flex-col gap-4">
          {liveFixture && <LiveCard fixture={liveFixture} />}
          {nextFixture && <NextCard fixture={nextFixture} />}
          {titleOdds.length > 1 ? (
            <TitleRaceTeaser odds={titleOdds} />
          ) : (
            <StatTiles stats={stats} />
          )}
        </aside>
      </div>
    </div>
  );
}
