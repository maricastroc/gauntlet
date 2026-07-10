"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import type { PhasePill } from "@/lib/types";

const BASE =
  "flex items-center gap-1 rounded-full border px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-widest transition-colors duration-150";

const hrefFor = (phase: PhasePill) => (phase.key === "groups" ? "/standings" : "/bracket");

export function PhasePills({ phases }: { phases: PhasePill[] }) {
  const pathname = usePathname();
  // The pills act as tabs: highlight the one matching the current page. On routes
  // that aren't a pill target (e.g. the overview), fall back to the tournament's
  // live phase so a sensible stage stays lit.
  const routeHref = pathname.startsWith("/standings")
    ? "/standings"
    : pathname.startsWith("/bracket")
      ? "/bracket"
      : null;

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
        const active = routeHref ? hrefFor(phase) === routeHref : phase.state === "now";
        return (
          <Link
            key={phase.key}
            href={hrefFor(phase)}
            aria-label={`Go to ${phase.label}`}
            aria-current={active ? "page" : undefined}
            className={`${BASE} ${
              active
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
