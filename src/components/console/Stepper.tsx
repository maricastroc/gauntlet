"use client";

import { Minus, Plus } from "lucide-react";

export function Stepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
}) {
  const set = (next: number) => onChange(Math.max(0, Math.min(99, next)));

  return (
    <div
      data-testid="stepper"
      data-label={label}
      data-value={value}
      className="flex items-center gap-2"
    >
      <button
        type="button"
        aria-label={`One fewer goal for ${label}`}
        onClick={() => set(value - 1)}
        className="grid h-7 w-7 place-items-center rounded-sm border border-line-2 bg-surface-3 text-ink-dim transition-colors duration-150 hover:border-amber-line hover:text-ink active:scale-95"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8.5 text-center font-mono text-[30px] font-bold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label={`One more goal for ${label}`}
        onClick={() => set(value + 1)}
        className="grid h-7 w-7 place-items-center rounded-sm border border-line-2 bg-surface-3 text-ink-dim transition-colors duration-150 hover:border-amber-line hover:text-ink active:scale-95"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
