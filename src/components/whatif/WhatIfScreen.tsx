"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { Link2, Trophy } from "lucide-react";
import type { ScenarioResult, WhatIfSetup } from "@/lib/types";
import { useScenario } from "@/lib/hooks/useScenario";
import { encodeScenario } from "@/lib/whatif/scenario-url";
import { describeCascade } from "@/lib/whatif/cascade";
import { Flag } from "@/components/ui/Flag";
import { ScenarioBuilder } from "./ScenarioBuilder";
import { CascadeTimeline } from "./CascadeTimeline";
import { ProjectedStandings } from "./ProjectedStandings";
import { ProjectedBracket } from "./ProjectedBracket";

export function WhatIfScreen({
  setup,
  tournamentId,
  initialPins,
}: {
  setup: WhatIfSetup;
  tournamentId: number;
  initialPins: ScenarioResult[];
}) {
  const { pins, projection, loading, pin, unpin, reset } = useScenario(
    tournamentId,
    setup.baseline,
    initialPins,
  );
  const dirty = pins.size > 0;
  const cascade = describeCascade(setup.baseline, projection);
  const champion = projection.bracket?.champion ?? null;
  const baseChampion = setup.baseline.bracket?.champion ?? null;
  const championChanged = dirty && (champion?.id ?? null) !== (baseChampion?.id ?? null);

  useEffect(() => {
    const query = encodeScenario([...pins.values()]);
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("s", query);
    else url.searchParams.delete("s");
    window.history.replaceState(null, "", url.toString());
  }, [pins]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied — the scenario travels with it.");
    } catch {
      toast.error("Couldn't copy. Grab the URL from the address bar.");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-y-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(320px,380px)_1fr] lg:gap-y-0">
      <div className="min-w-0 px-5 pt-2 pb-6 sm:px-6 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-line lg:pb-8">
        <ScenarioBuilder
          fixtures={setup.fixtures}
          pins={pins}
          onPin={pin}
          onUnpin={unpin}
          onReset={reset}
        />

        {dirty && (
          <button
            type="button"
            onClick={copyLink}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-amber-line bg-amber-soft px-4 py-2.5 text-[13px] font-semibold text-amber-ink transition-colors hover:brightness-110"
          >
            <Link2 className="h-4 w-4" />
            Copy shareable link
          </button>
        )}

        <div className="mt-5 flex gap-2.5 rounded-md border border-dashed border-line-2 px-3.5 py-3 text-[12.5px] leading-[1.45] text-ink-mute">
          <span aria-hidden="true">✳</span>
          <p>
            <b className="font-semibold text-ink-dim">Nothing is saved.</b> The API feeds these
            hypothetical results to the same pure engines behind the live tables and returns the
            projection —{" "}
            <code className="font-mono text-[12px] text-amber-ink">state is a projection</code>, so
            a group result reshuffles the bracket for free — and the whole scenario lives in the
            URL.
          </p>
        </div>
      </div>

      <div className="min-w-0 px-5 pt-2 pb-6 sm:px-6 lg:min-h-0 lg:overflow-y-auto">
        <CascadeTimeline steps={cascade} />

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
            ◆ {dirty ? "Projected" : "Live"} tables
          </p>
          {loading && (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-mute">
              projecting…
            </span>
          )}
        </div>

        <ProjectedStandings projection={projection} baseline={setup.baseline} />

        {projection.bracket && projection.bracket.ties.length > 0 && (
          <div className="mt-8">
            <div className="mb-1 flex items-center gap-3 px-5 sm:px-6">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
                ◆ Projected bracket
              </p>
              {champion && (
                <span
                  className={[
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold",
                    championChanged
                      ? "border-amber-line bg-amber-soft text-amber-ink"
                      : "border-line text-ink-dim",
                  ].join(" ")}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <Flag team={champion} className="text-[14px]" />
                  {champion.name}
                </span>
              )}
            </div>
            <ProjectedBracket bracket={projection.bracket} baseline={setup.baseline.bracket!} />
          </div>
        )}
      </div>
    </div>
  );
}
