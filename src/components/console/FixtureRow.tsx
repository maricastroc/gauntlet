"use client";

import { Check } from "lucide-react";
import type { FixtureDetail } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";
import { MiniStepper } from "./MiniStepper";
import type { RowState } from "./useGroupEditor";

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
  decisive = false,
  readOnly = false,
}: {
  fixture: FixtureDetail;
  row: RowState;
  authed: boolean;
  onChange: (side: "home" | "away", value: number) => void;
  decisive?: boolean;
  readOnly?: boolean;
}) {
  const changed = row.home !== row.savedHome || row.away !== row.savedAway;

  return (
    <div
      title={decisive ? "This match still decides who advances" : undefined}
      className={[
        "flex items-center gap-2.5 rounded-[10px] border px-2.5 py-2 transition-colors",
        changed
          ? "border-amber-line bg-amber-soft/40"
          : decisive
            ? "border-amber-line/50 hover:bg-white/1.5"
            : "border-transparent hover:bg-white/1.5",
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
        disabled={readOnly}
      />
      <span className="font-mono text-[12px] text-ink-mute">–</span>
      <MiniStepper
        value={row.away}
        onChange={(v) => onChange("away", v)}
        label={fixture.away?.name ?? "away"}
        disabled={readOnly}
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
