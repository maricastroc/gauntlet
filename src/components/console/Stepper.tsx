"use client";

/** A single score dial: −/value/+, clamped to 0–99, tabular so it never jumps. */
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`One fewer goal for ${label}`}
        onClick={() => set(value - 1)}
        className="h-7 w-7 rounded-[7px] border border-line-2 bg-surface-3 text-[16px] leading-none text-ink-dim transition-colors duration-150 hover:border-amber-line hover:text-ink active:scale-95"
      >
        −
      </button>
      <span className="w-[34px] text-center font-mono text-[30px] font-bold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label={`One more goal for ${label}`}
        onClick={() => set(value + 1)}
        className="h-7 w-7 rounded-[7px] border border-line-2 bg-surface-3 text-[16px] leading-none text-ink-dim transition-colors duration-150 hover:border-amber-line hover:text-ink active:scale-95"
      >
        +
      </button>
    </div>
  );
}
