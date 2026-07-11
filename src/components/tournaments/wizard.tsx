export function Steps({ step }: { step: number }) {
  const labels = ["Name", "Teams", "Groups"];
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      {labels.map((label, index) => {
        const n = index + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2.5">
            <span
              className={[
                "grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[12px] font-bold transition-all duration-200",
                active
                  ? "bg-amber text-[#1a1205] shadow-[0_2px_12px_-2px_rgba(242,169,59,0.7)]"
                  : done
                    ? "border border-amber-line text-amber-ink"
                    : "border border-line-2 text-ink-mute",
              ].join(" ")}
            >
              {n}
            </span>
            <span
              className={`font-mono text-[11px] uppercase tracking-widest transition-colors duration-200 ${active ? "text-ink" : done ? "text-ink-dim" : "text-ink-mute"}`}
            >
              {label}
            </span>
            {index < labels.length - 1 && (
              <span
                className={`h-px flex-1 transition-colors duration-200 ${done ? "bg-amber-line" : "bg-line"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-up rounded-[14px] border border-line-2 bg-surface-2/70 p-6 shadow-[0_12px_34px_-18px_rgba(0,0,0,0.7)]">
      <h2 className="mb-5 font-serif text-[20px] font-semibold tracking-[-0.01em]">{title}</h2>
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
        {label}
      </div>
      {children}
    </div>
  );
}

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: number[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "flex-1 rounded-sm border py-2.5 text-[13px] transition-all duration-150 active:scale-[0.98]",
            option === value
              ? "border-amber-line bg-amber-soft text-amber-ink"
              : "border-line bg-surface-2 text-ink-mute hover:border-line-2 hover:text-ink-dim",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function WizardButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 flex w-full items-center justify-center rounded-xl bg-amber px-4 py-3.5 text-[15px] font-bold text-[#1a1205] shadow-[0_5px_16px_-10px_rgba(242,169,59,0.5)] transition-all duration-150 enabled:hover:-translate-y-0.5 enabled:hover:brightness-[1.07] enabled:hover:shadow-[0_9px_22px_-10px_rgba(242,169,59,0.6)] enabled:active:translate-y-0 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
    >
      {children}
    </button>
  );
}
