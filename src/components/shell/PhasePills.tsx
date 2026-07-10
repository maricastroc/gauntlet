import Link from "next/link";
import { Lock } from "lucide-react";
import type { PhasePill } from "@/lib/types";

const BASE =
  "flex items-center gap-1 rounded-full border px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-widest transition-colors duration-150";

export function PhasePills({ phases }: { phases: PhasePill[] }) {
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {phases.map((phase, index) => {
        if (phase.state === "todo") {
          const prev = phases[index - 1];
          const hint = prev ? `Finish the ${prev.label} to unlock` : "Not reached yet";
          return (
            <span
              key={phase.key}
              aria-disabled="true"
              data-tooltip-id="app-tooltip"
              data-tooltip-content={hint}
              className={`${BASE} cursor-not-allowed border-line text-ink-mute/60`}
            >
              <Lock className="h-2.5 w-2.5" aria-hidden="true" />
              {phase.label}
            </span>
          );
        }
        return (
          <Link
            key={phase.key}
            href={phase.key === "groups" ? "/standings" : "/bracket"}
            aria-label={`Go to ${phase.label}`}
            className={`${BASE} ${
              phase.state === "now"
                ? "border-amber bg-amber font-bold text-[#1a1205] hover:brightness-105"
                : "border-line-2 text-ink-dim hover:border-amber-line hover:text-amber-ink"
            }`}
          >
            {phase.label}
          </Link>
        );
      })}
    </div>
  );
}
