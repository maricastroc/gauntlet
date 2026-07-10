import type { Team } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";

/**
 * The trophy slot. Gold is reserved for exactly this — when the champion is
 * decided the card fills with a warm wash and the name lands in serif; until
 * then it waits, quietly, as "to be decided".
 */
export function ChampionCard({ champion }: { champion: Team | null }) {
  const decided = champion !== null;

  return (
    <div
      className={[
        "rounded-[11px] border px-4 py-5 text-center",
        decided
          ? "border-gold/45 bg-gradient-to-b from-gold/[0.14] to-surface-2"
          : "border-amber-line bg-gradient-to-b from-gold/[0.09] to-surface-2",
      ].join(" ")}
    >
      <div className="text-[26px]" aria-hidden="true">
        🏆
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
        Champion
      </div>
      {decided ? (
        <div className="mt-1.5 flex items-center justify-center gap-2 font-serif text-[15px] text-ink">
          <Flag team={champion} className="text-[16px]" />
          {champion.name}
        </div>
      ) : (
        <div className="mt-1 font-serif text-[15px] italic text-ink-mute">
          to be decided
        </div>
      )}
    </div>
  );
}
