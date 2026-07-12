import { Eye } from "lucide-react";

/** Shown when the signed-in user is viewing a tournament they don't own. */
export function ReadOnlyBanner() {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-[11px] border border-line-2 bg-surface-2/60 px-4 py-3 text-[13px] text-ink-dim">
      <Eye className="mt-0.5 h-4 w-4 shrink-0 text-ink-mute" aria-hidden="true" />
      <span>
        <b className="font-semibold text-ink">Read-only.</b> You&apos;re not the organizer of this
        tournament, so results can&apos;t be edited here — open one of your own from{" "}
        <span className="text-amber-ink">Tournaments</span> to make changes.
      </span>
    </div>
  );
}
