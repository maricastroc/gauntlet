"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { Team } from "@/lib/types";
import { computeStandings, type RawMatch } from "@/lib/standings";
import { formatGoalDifference } from "@/lib/format";
import { Flag } from "@/components/ui/Flag";
import { useReorderFlip } from "@/components/ui/useReorderFlip";

const TICK = 900;

const iconButton =
  "grid h-7 w-7 place-items-center rounded-md border border-line-2 text-ink-dim transition-colors hover:text-ink disabled:opacity-40";

export function GroupReplay({
  teams,
  qualifyCount,
  matches,
}: {
  teams: Team[];
  qualifyCount: number;
  matches: RawMatch[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(matches.length);
  const [playing, setPlaying] = useState(false);

  const rows = useMemo(
    () => computeStandings(teams, matches.slice(0, step), qualifyCount),
    [teams, matches, step, qualifyCount],
  );
  const flip = useReorderFlip(rows.map((row) => row.team.id).join("-"));

  useEffect(() => {
    if (!playing || step >= matches.length) return;
    const timer = setTimeout(() => {
      const next = step + 1;
      setStep(next);
      if (next >= matches.length) setPlaying(false);
    }, TICK);
    return () => clearTimeout(timer);
  }, [playing, step, matches.length]);

  if (matches.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-mute transition-colors hover:text-amber-ink"
      >
        ▸ Replay how this group unfolded
      </button>
    );
  }

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (step >= matches.length) setStep(0);
    setPlaying(true);
  };

  return (
    <div className="mt-4 rounded-md border border-line bg-surface/60 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-amber">
          ◆ Replay · match {step} / {matches.length}
        </span>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={togglePlay} className={iconButton}>
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            aria-label="Restart"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className={iconButton}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={matches.length}
        value={step}
        aria-label="Replay position"
        onChange={(event) => {
          setPlaying(false);
          setStep(Number(event.target.value));
        }}
        className="w-full accent-amber"
      />

      <div className="mt-3 overflow-hidden rounded-md border border-line bg-surface">
        {rows.map((row) => (
          <div
            key={row.team.id}
            ref={flip(row.team.id)}
            className={[
              "grid grid-cols-[24px_1fr_auto_auto] items-center gap-3 border-t border-t-line border-l-2 px-3 py-2 text-[13px] tabular-nums first:border-t-0",
              row.qualified ? "border-l-amber" : "border-l-transparent",
            ].join(" ")}
          >
            <span className="font-mono text-[12px] text-ink-mute">{row.position}</span>
            <span className="flex min-w-0 items-center gap-2 font-medium">
              <Flag team={row.team} className="text-[15px]" />
              <span className="truncate">{row.team.name}</span>
            </span>
            <span className="font-mono text-[12px] text-ink-dim">
              {formatGoalDifference(row.goalDifference)}
            </span>
            <span className="font-mono text-[13px] font-bold text-ink">{row.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
