import type { BracketTie, TieSide } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";

type SideRole = "win" | "out" | "neutral" | "tbd";

function sideRole(side: TieSide, tie: BracketTie): SideRole {
  if (side.team === null) return "tbd";
  if (tie.status === "decided" && tie.winnerId !== null) {
    return side.team.id === tie.winnerId ? "win" : "out";
  }
  return "neutral";
}

function Side({ side, tie }: { side: TieSide; tie: BracketTie }) {
  const role = sideRole(side, tie);
  const name = side.team?.name ?? side.placeholder ?? "To be decided";
  const score = side.score === null ? "–" : String(side.score);

  return (
    <div
      className={[
        "flex items-center gap-2.5 rounded-[7px] px-2.5 py-2.5 transition-colors duration-200",
        role === "win" && "bg-amber/[0.06] motion-safe:animate-advance",
        role === "out" && "opacity-[0.72]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {side.team ? (
        <Flag team={side.team} className="w-5 text-[17px]" />
      ) : (
        <span className="w-5 text-center text-[14px] text-ink-mute" aria-hidden="true">
          ⚑
        </span>
      )}

      <span
        className={[
          "flex-1 truncate text-[13.5px]",
          role === "tbd"
            ? "font-normal italic text-ink-mute"
            : role === "win"
              ? "font-medium text-ink"
              : role === "out"
                ? "text-ink-mute"
                : "font-medium text-ink-dim",
        ].join(" ")}
      >
        {name}
      </span>

      <span
        className={[
          "font-mono text-[14px] font-bold tabular-nums",
          role === "win" ? "text-amber-ink" : "text-ink-mute",
        ].join(" ")}
      >
        {score}
      </span>

      {side.penalties != null && (
        <span className="ml-0.5 font-mono text-[10px] text-ink-mute">
          ({side.penalties})
        </span>
      )}
    </div>
  );
}

function Tag({ tie }: { tie: BracketTie }) {
  if (tie.status === "live") {
    return (
      <span className="absolute -top-2 left-3 rounded-[4px] border border-loss/40 bg-loss/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-loss">
        ● live {tie.liveMinute}&apos;
      </span>
    );
  }
  if (tie.status === "ready" && tie.kickoff) {
    return (
      <span className="absolute -top-2 left-3 rounded-[4px] border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute">
        {tie.kickoff}
      </span>
    );
  }
  return null;
}

/**
 * One knockout tie: two stacked sides on a bordered card, with an optional
 * status tag pinned to the top edge. Live ties get a soft pulsing ring.
 */
export function MatchCard({ tie }: { tie: BracketTie }) {
  const live = tie.status === "live";
  return (
    <div
      className={[
        "relative rounded-[11px] border bg-surface-2 p-1 transition-shadow duration-200",
        live
          ? "border-loss/40 shadow-[0_0_0_1px_rgba(224,107,98,0.18)]"
          : "border-line",
      ].join(" ")}
    >
      <Tag tie={tie} />
      <Side side={tie.home} tie={tie} />
      <div className="mt-0.5">
        <Side side={tie.away} tie={tie} />
      </div>
    </div>
  );
}
