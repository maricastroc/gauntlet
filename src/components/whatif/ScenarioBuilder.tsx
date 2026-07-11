"use client";

import { useMemo, useState } from "react";
import type { ScenarioResult, WhatIfFixture } from "@/lib/types";
import { Stepper } from "@/components/console/Stepper";
import { Flag } from "@/components/ui/Flag";
import { useScenarioEditor } from "./useScenarioEditor";
import { ScenarioPins } from "./ScenarioPins";

interface ScenarioBuilderProps {
  fixtures: WhatIfFixture[];
  pins: Map<number, ScenarioResult>;
  onPin: (result: ScenarioResult) => void;
  onUnpin: (fixtureId: number) => void;
  onReset: () => void;
}

const phaseKeyOf = (fixture: WhatIfFixture) => `${fixture.phase}:${fixture.phaseLabel}`;

export function ScenarioBuilder({ fixtures, pins, onPin, onUnpin, onReset }: ScenarioBuilderProps) {
  const editor = useScenarioEditor(fixtures, pins);
  const { selected, home, away, homePens, awayPens, shootout } = editor;

  const phases = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ key: string; label: string }> = [];
    for (const fixture of fixtures) {
      const key = phaseKeyOf(fixture);
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ key, label: fixture.phaseLabel });
      }
    }
    return list;
  }, [fixtures]);

  const [phaseKey, setPhaseKey] = useState(selected ? phaseKeyOf(selected) : (phases[0]?.key ?? ""));

  if (!selected) {
    return (
      <div className="rounded-md border border-dashed border-line-2 px-6 py-12 text-center text-[14px] text-ink-mute">
        This tournament has no matches to play with yet.
      </div>
    );
  }

  const phaseFixtures = fixtures.filter((fixture) => phaseKeyOf(fixture) === phaseKey);

  const selectPhase = (key: string) => {
    setPhaseKey(key);
    const first = fixtures.find((fixture) => phaseKeyOf(fixture) === key);
    if (first) editor.reselect(first.id);
  };

  return (
    <div>
      <span className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
        Pick a match
      </span>

      <div className="flex flex-wrap gap-1.5">
        {phases.map((phase) => {
          const active = phase.key === phaseKey;
          return (
            <button
              key={phase.key}
              type="button"
              onClick={() => selectPhase(phase.key)}
              className={[
                "rounded-md border px-2.5 py-1 font-mono text-[11px] tracking-[0.05em] transition-colors",
                active
                  ? "border-amber bg-amber font-bold text-[#1a1205]"
                  : "border-line-2 text-ink-dim hover:border-amber-line hover:text-ink",
              ].join(" ")}
            >
              {phase.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex flex-col gap-1 rounded-md border border-line bg-surface p-1.5">
        {phaseFixtures.map((fixture) => {
          const isSelected = fixture.id === selected.id;
          const pinned = pins.has(fixture.id);
          return (
            <button
              key={fixture.id}
              type="button"
              onClick={() => editor.reselect(fixture.id)}
              className={[
                "flex items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-[13px] transition-colors",
                isSelected ? "bg-amber-soft text-ink" : "text-ink-dim hover:bg-white/[0.03]",
              ].join(" ")}
            >
              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                <Flag team={fixture.home} className="text-[14px]" />
                <span className="truncate">{fixture.home.name}</span>
                <span className="text-ink-mute">vs</span>
                <Flag team={fixture.away} className="text-[14px]" />
                <span className="truncate">{fixture.away.name}</span>
              </span>
              {pinned ? (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" aria-label="pinned" />
              ) : (
                fixture.status === "finished" && (
                  <span className="shrink-0 font-mono text-[11px] text-ink-mute">
                    {fixture.homeScore}–{fixture.awayScore}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 rounded-md border border-line bg-surface-2 p-5">
        <Side team={selected.home} value={home} onChange={editor.setHome} />
        <span className="font-mono text-[14px] text-ink-mute">×</span>
        <Side team={selected.away} value={away} onChange={editor.setAway} />
      </div>

      {shootout && (
        <div className="mt-2 rounded-md border border-dashed border-line-2 px-4 py-3">
          <div className="mb-2 text-center font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-mute">
            Penalties
          </div>
          <div className="flex items-center justify-center gap-4">
            <Stepper
              value={homePens}
              onChange={editor.setHomePens}
              label={`${selected.home.name} penalties`}
            />
            <span className="font-mono text-[13px] text-ink-mute">×</span>
            <Stepper
              value={awayPens}
              onChange={editor.setAwayPens}
              label={`${selected.away.name} penalties`}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onPin(editor.toResult())}
        className="mt-4 flex w-full items-center justify-center rounded-md bg-amber px-4 py-3 text-[15px] font-bold text-[#1a1205] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-[1.07] active:translate-y-0 active:scale-[0.99]"
      >
        {pins.has(selected.id) ? "Update this result" : "Pin this result"}
      </button>

      <ScenarioPins fixtures={fixtures} pins={pins} onUnpin={onUnpin} onReset={onReset} />
    </div>
  );
}

function Side({
  team,
  value,
  onChange,
}: {
  team: { name: string; flag?: string };
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex w-23 flex-col items-center gap-2">
      <span className="text-[28px] leading-none" aria-hidden="true">
        {team.flag}
      </span>
      <span className="text-center text-[13px] font-semibold">{team.name}</span>
      <Stepper value={value} onChange={onChange} label={team.name} />
    </div>
  );
}
