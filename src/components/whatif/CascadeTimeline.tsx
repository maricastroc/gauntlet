import { Check } from "lucide-react";
import type { CascadeStep } from "@/lib/whatif/cascade";

const TONE: Record<CascadeStep["tone"], string> = {
  up: "text-win",
  down: "text-loss",
  info: "text-amber-ink",
};

export function CascadeTimeline({ steps }: { steps: CascadeStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
        ◆ How it propagates
      </p>
      <ol className="overflow-hidden rounded-md border border-line bg-surface motion-safe:animate-rise">
        {steps.map((step, index) => (
          <li
            key={index}
            className="flex items-center gap-2.5 border-t border-line px-3.5 py-2 text-[13px] first:border-t-0"
          >
            <Check className={`h-3.5 w-3.5 shrink-0 ${TONE[step.tone]}`} />
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
