export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-loss/35 bg-loss/8 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.14em] text-loss">
      <span className="h-1.75 w-1.75 rounded-full bg-loss motion-safe:animate-pulse-live" />
      LIVE
    </span>
  );
}
