"use client";

import { Check } from "lucide-react";
import type { BracketTie } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";
import { MiniStepper } from "./MiniStepper";
import { tieIsEditable, type TieRowState } from "./useTieEditor";

function Status({ row, authed }: { row: TieRowState; authed: boolean }) {
  const changed =
    row.home !== row.savedHome ||
    row.away !== row.savedAway ||
    row.homePen !== row.savedHomePen ||
    row.awayPen !== row.savedAwayPen;

  if (row.status === "needs-penalties") {
    return <span className="text-amber-ink">penalties</span>;
  }
  if (!authed) {
    return changed ? <span className="text-amber-ink">unsaved</span> : null;
  }
  if (row.status === "saving" || row.status === "dirty") {
    return <span className="text-ink-mute">saving…</span>;
  }
  if (row.status === "error") {
    return <span className="text-loss">failed</span>;
  }
  if (row.status === "saved") {
    return <Check className="h-3.5 w-3.5 text-win" aria-label="saved" />;
  }
  return <Check className="h-3.5 w-3.5 text-ink-dim/40" aria-hidden="true" />;
}

function PlaceholderRow({ tie }: { tie: BracketTie }) {
  const label = (side: BracketTie["home"]) => side.team?.name ?? side.placeholder ?? "TBD";
  return (
    <div className="flex items-center gap-2.5 rounded-[10px] border border-transparent px-2.5 py-2 text-ink-mute">
      <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-[13.5px]">
        <span className="truncate italic">{label(tie.home)}</span>
        {tie.home.team && <Flag team={tie.home.team} className="text-[16px]" />}
      </span>
      <span className="font-mono text-[12px]">–</span>
      <span className="flex min-w-0 flex-1 items-center gap-2 text-[13.5px]">
        {tie.away.team && <Flag team={tie.away.team} className="text-[16px]" />}
        <span className="truncate italic">{label(tie.away)}</span>
      </span>
      <span className="w-14 shrink-0" />
    </div>
  );
}

export function TieRow({
  tie,
  row,
  authed,
  onScore,
  onPenalty,
  readOnly = false,
}: {
  tie: BracketTie;
  row: TieRowState | undefined;
  authed: boolean;
  onScore: (side: "home" | "away", value: number) => void;
  onPenalty: (side: "home" | "away", value: number) => void;
  readOnly?: boolean;
}) {
  if (!tieIsEditable(tie) || !row) {
    return <PlaceholderRow tie={tie} />;
  }

  const draw = row.home === row.away;
  const changed =
    row.home !== row.savedHome ||
    row.away !== row.savedAway ||
    row.homePen !== row.savedHomePen ||
    row.awayPen !== row.savedAwayPen;

  return (
    <div
      className={[
        "rounded-[10px] border px-2.5 py-2 transition-colors",
        changed ? "border-amber-line bg-amber-soft/40" : "border-transparent hover:bg-white/1.5",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-[13.5px]">
          <span className="truncate">{tie.home.team?.name}</span>
          {tie.home.team && <Flag team={tie.home.team} className="text-[16px]" />}
        </span>

        <MiniStepper
          value={row.home}
          onChange={(v) => onScore("home", v)}
          label={tie.home.team?.name ?? "home"}
          disabled={readOnly}
        />
        <span className="font-mono text-[12px] text-ink-mute">–</span>
        <MiniStepper
          value={row.away}
          onChange={(v) => onScore("away", v)}
          label={tie.away.team?.name ?? "away"}
          disabled={readOnly}
        />

        <span className="flex min-w-0 flex-1 items-center gap-2 text-[13.5px]">
          {tie.away.team && <Flag team={tie.away.team} className="text-[16px]" />}
          <span className="truncate">{tie.away.team?.name}</span>
        </span>

        <span className="flex w-14 shrink-0 items-center justify-end font-mono text-[10px] uppercase tracking-[0.04em]">
          <Status row={row} authed={authed} />
        </span>
      </div>

      {draw && (
        <div className="mt-2 flex items-center justify-center gap-2.5 border-t border-dashed border-line-2 pt-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber-ink">
            Penalties
          </span>
          <MiniStepper
            value={row.homePen}
            onChange={(v) => onPenalty("home", v)}
            label={`${tie.home.team?.name ?? "home"} penalties`}
            disabled={readOnly}
          />
          <span className="font-mono text-[12px] text-ink-mute">–</span>
          <MiniStepper
            value={row.awayPen}
            onChange={(v) => onPenalty("away", v)}
            label={`${tie.away.team?.name ?? "away"} penalties`}
            disabled={readOnly}
          />
        </div>
      )}
    </div>
  );
}
