import { PageHeading } from "@/components/ui/PageHeading";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { TiebreakNote } from "@/components/standings/TiebreakNote";
import { LiveCard } from "@/components/overview/LiveCard";
import { NextCard } from "@/components/overview/NextCard";
import { StatTiles } from "@/components/overview/StatTiles";
import { getOverview } from "@/lib/data";

export default function OverviewPage() {
  const { featuredGroup, liveFixture, nextFixture, stats } = getOverview();

  return (
    <div className="pb-8">
      <PageHeading
        eyebrow="Today"
        title="What needs your attention"
        subtitle="The match on the pitch now, the next one to decide, and where the table is tightest — gathered in one place."
      />

      <div className="grid grid-cols-1 gap-y-8 px-5 pt-4 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:gap-x-8 lg:gap-y-0">
        {/* left — the featured group, still contested */}
        <section className="min-w-0 lg:border-r lg:border-line lg:pr-8">
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="eyebrow">Standings</span>
            <span className="rounded-[5px] border border-amber-line px-1.5 py-px font-mono text-[11px] uppercase tracking-[0.08em] text-amber-ink">
              Group {featuredGroup.name}
            </span>
          </div>
          <StandingsTable group={featuredGroup} />
          {featuredGroup.tiebreakNote && (
            <TiebreakNote note={featuredGroup.tiebreakNote} />
          )}
        </section>

        {/* right — what's happening and what's next */}
        <aside className="flex min-w-0 flex-col gap-4">
          {liveFixture && <LiveCard fixture={liveFixture} />}
          {nextFixture && <NextCard fixture={nextFixture} />}
          <StatTiles stats={stats} />
        </aside>
      </div>
    </div>
  );
}
