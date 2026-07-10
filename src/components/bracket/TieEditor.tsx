"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { BracketTie, Team } from "@/lib/types";
import { Stepper } from "@/components/console/Stepper";
import { Flag } from "@/components/ui/Flag";
import { isDraw, type TieResult } from "@/lib/knockout";

export interface Consequence {
  winner: Team;
  isFinal: boolean;
  nextRound: string | null;
  opponent: Team | null;
}

interface TieEditorProps {
  tie: BracketTie;
  roundLabel: string;
  initial?: TieResult;
  busy?: boolean;
  describe: (result: TieResult) => Consequence | null;
  onConfirm: (result: TieResult) => void;
  onClose: () => void;
}

export function TieEditor({
  tie,
  roundLabel,
  initial,
  busy = false,
  describe,
  onConfirm,
  onClose,
}: TieEditorProps) {
  const home = tie.home.team as Team;
  const away = tie.away.team as Team;

  const [homeScore, setHomeScore] = useState(initial?.home ?? tie.home.score ?? 0);
  const [awayScore, setAwayScore] = useState(initial?.away ?? tie.away.score ?? 0);
  const [homePens, setHomePens] = useState(initial?.homePenalties ?? 0);
  const [awayPens, setAwayPens] = useState(initial?.awayPenalties ?? 0);

  const result: TieResult = {
    home: homeScore,
    away: awayScore,
    homePenalties: homePens,
    awayPenalties: awayPens,
  };
  const level = isDraw(result);
  const consequence = describe(result);

  return (
    <div className="rounded-md border border-amber-line bg-surface-2 p-5 motion-safe:animate-rise">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
          ◆ {roundLabel}
        </span>
        <button
          type="button"
          aria-label="Close editor"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-sm text-ink-mute transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-5">
        <SideStepper team={home} value={homeScore} onChange={setHomeScore} />
        <span className="font-mono text-[14px] text-ink-mute">×</span>
        <SideStepper team={away} value={awayScore} onChange={setAwayScore} />
      </div>

      {level && (
        <div className="mt-4 rounded-sm border border-dashed border-line-2 px-4 py-3">
          <p className="mb-2.5 text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-mute">
            Penalty shootout
          </p>
          <div className="flex items-center justify-center gap-5">
            <PenStepper team={home} value={homePens} onChange={setHomePens} />
            <span className="font-mono text-[12px] text-ink-mute">×</span>
            <PenStepper team={away} value={awayPens} onChange={setAwayPens} />
          </div>
        </div>
      )}

      <p
        key={consequence ? `${consequence.winner.id}-${consequence.isFinal}` : "pending"}
        className="mt-4 flex items-center justify-center gap-1.5 text-center text-[13.5px] motion-safe:animate-rise"
      >
        {consequence ? (
          consequence.isFinal ? (
            <span className="font-serif text-[15px] text-gold">
              🏆 {consequence.winner.name} lift the trophy
            </span>
          ) : (
            <span className="text-amber-ink">
              <b className="font-semibold">{consequence.winner.name}</b> advance to the{" "}
              {consequence.nextRound}
              {consequence.opponent ? ` to face ${consequence.opponent.name}` : ""}
            </span>
          )
        ) : (
          <span className="text-ink-mute">Level on the night — set the shootout to decide it</span>
        )}
      </p>

      <button
        type="button"
        onClick={() => onConfirm(result)}
        disabled={!consequence || busy}
        className="mt-4 flex w-full items-center justify-center rounded-md bg-amber px-4 py-3 text-[15px] font-bold text-[#1a1205] shadow-[0_5px_16px_-10px_rgba(242,169,59,0.5)] transition-all duration-150 enabled:hover:-translate-y-0.5 enabled:hover:brightness-[1.07] enabled:active:translate-y-0 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {busy ? "Saving…" : consequence?.isFinal ? "Crown the champion" : "Confirm & advance"}
      </button>
    </div>
  );
}

function SideStepper({
  team,
  value,
  onChange,
}: {
  team: Team;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex w-24 flex-col items-center gap-2">
      <Flag team={team} className="text-[28px]" />
      <span className="text-center text-[13px] font-semibold">{team.name}</span>
      <Stepper value={value} onChange={onChange} label={team.name} />
    </div>
  );
}

function PenStepper({
  team,
  value,
  onChange,
}: {
  team: Team;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Flag team={team} className="text-[15px]" />
      <Stepper value={value} onChange={onChange} label={`${team.name} penalties`} />
    </div>
  );
}
