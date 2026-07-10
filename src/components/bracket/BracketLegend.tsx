/** A quiet key for the bracket's visual language. Clarity over decoration. */
export function BracketLegend() {
  const items = [
    { label: "Advances", swatch: "bg-amber" },
    { label: "Live", swatch: "bg-loss motion-safe:animate-pulse-live" },
    { label: "To be decided", swatch: "bg-ink-mute/50" },
  ];

  return (
    <div className="flex items-center gap-4">
      {items.map((item) => (
        <span
          key={item.label}
          className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-mute"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${item.swatch}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
