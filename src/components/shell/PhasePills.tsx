import type { PhasePill } from "@/lib/types";

/**
 * The tournament's journey as a row of pills — done phases recede, the live
 * phase is filled amber, upcoming phases wait in outline. The one place the
 * accent earns a solid fill in the chrome.
 */
export function PhasePills({ phases }: { phases: PhasePill[] }) {
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {phases.map((phase) => (
        <span
          key={phase.key}
          className={[
            "rounded-full border px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em]",
            phase.state === "now"
              ? "border-amber bg-amber font-bold text-[#1a1205]"
              : phase.state === "done"
                ? "border-line-2 text-ink-dim"
                : "border-line-2 text-ink-mute",
          ].join(" ")}
        >
          {phase.label}
        </span>
      ))}
    </div>
  );
}
