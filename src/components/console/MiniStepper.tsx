"use client";

import { Minus, Plus } from "lucide-react";

export function MiniStepper({
  value,
  onChange,
  label,
  disabled = false,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center overflow-hidden rounded-md border border-line-2 bg-surface-3 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        aria-label={`One fewer for ${label}`}
        onClick={() => onChange(value - 1)}
        disabled={disabled}
        className="grid h-7 w-6 place-items-center text-ink-dim transition-colors hover:text-ink active:scale-95 disabled:pointer-events-none"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center font-mono text-[15px] font-bold tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        aria-label={`One more for ${label}`}
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        className="grid h-7 w-6 place-items-center text-ink-dim transition-colors hover:text-ink active:scale-95 disabled:pointer-events-none"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
