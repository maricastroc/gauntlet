import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/PageHeading";
import { WhatIfScreen } from "@/components/whatif/WhatIfScreen";
import { getWhatIfSetup, type WhatIfSetup } from "@/lib/data/scenario";
import { getCurrentTournamentId } from "@/lib/tournament/current";
import { decodeScenario } from "@/lib/whatif/scenario-url";

export const metadata: Metadata = { title: "What if?" };
export const dynamic = "force-dynamic";

export default async function WhatIfPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string | string[] }>;
}) {
  const tournamentId = await getCurrentTournamentId();
  const { s } = await searchParams;

  let setup: WhatIfSetup | null = null;
  try {
    setup = await getWhatIfSetup(tournamentId);
  } catch {
    setup = null;
  }

  const known = new Set(setup?.fixtures.map((fixture) => fixture.id) ?? []);
  const initialPins = decodeScenario(typeof s === "string" ? s : undefined).filter((pin) =>
    known.has(pin.fixtureId),
  );

  return (
    <div className="flex flex-col pb-8 lg:h-full lg:pb-0">
      <PageHeading
        eyebrow="What if?"
        title="Play out a scenario"
        subtitle="Pin hypothetical results and watch the standings — and the whole bracket — re-project. Nothing is saved: it is a pure projection off the live engines."
      />

      {setup && setup.fixtures.length > 0 ? (
        <WhatIfScreen setup={setup} tournamentId={tournamentId} initialPins={initialPins} />
      ) : (
        <div className="px-5 pt-2 sm:px-6">
          <div className="rounded-md border border-dashed border-line-2 px-6 py-12 text-center text-[14px] text-ink-mute">
            No group fixtures to project yet — build a group stage first, then come back to run
            what-ifs.
          </div>
        </div>
      )}
    </div>
  );
}
