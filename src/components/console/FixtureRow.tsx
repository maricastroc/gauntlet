"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { FixtureDetail } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";
import type { RowState } from "./useGroupEditor";

function MiniStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-line-2 bg-surface-3">
      <button
        type="button"
        aria-label={`One fewer goal for ${label}`}
        onClick={() => onChange(value - 1)}
        className="grid h-7 w-6 place-items-center text-ink-dim transition-colors hover:text-ink active:scale-95"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center font-mono text-[15px] font-bold tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        aria-label={`One more goal for ${label}`}
        onClick={() => onChange(value + 1)}
        className="grid h-7 w-6 place-items-center text-ink-dim transition-colors hover:text-ink active:scale-95"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Status({
  row,
  authed,
  changed,
}: {
  row: RowState;
  authed: boolean;
  changed: boolean;
}) {
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

export function FixtureRow({
  fixture,
  row,
  authed,
  onChange,
}: {
  fixture: FixtureDetail;
  row: RowState;
  authed: boolean;
  onChange: (side: "home" | "away", value: number) => void;
}) {
  const changed = row.home !== row.savedHome || row.away !== row.savedAway;

  return (
    <div
      className={[
        "flex items-center gap-2.5 rounded-[10px] border px-2.5 py-2 transition-colors",
        changed ? "border-amber-line bg-amber-soft/40" : "border-transparent hover:bg-white/[0.015]",
      ].join(" ")}
    >
      <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-[13.5px]">
        <span className="truncate">{fixture.home?.name}</span>
        {fixture.home && <Flag team={fixture.home} className="text-[16px]" />}
      </span>

      <MiniStepper
        value={row.home}
        onChange={(v) => onChange("home", v)}
        label={fixture.home?.name ?? "home"}
      />
      <span className="font-mono text-[12px] text-ink-mute">–</span>
      <MiniStepper
        value={row.away}
        onChange={(v) => onChange("away", v)}
        label={fixture.away?.name ?? "away"}
      />

      <span className="flex min-w-0 flex-1 items-center gap-2 text-[13.5px]">
        {fixture.away && <Flag team={fixture.away} className="text-[16px]" />}
        <span className="truncate">{fixture.away?.name}</span>
      </span>

      <span className="flex w-14 shrink-0 items-center justify-end font-mono text-[10px] uppercase tracking-[0.04em]">
        <Status row={row} authed={authed} changed={changed} />
      </span>
    </div>
  );
}
