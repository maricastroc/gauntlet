import type { TiebreakNote as TiebreakNoteData } from "@/lib/types";

export function TiebreakNote({ note }: { note: TiebreakNoteData }) {
  return (
    <div className="mt-4 flex gap-3 rounded-md border border-amber-line bg-amber-soft px-4 py-3 text-[13.5px] leading-[1.45] text-ink-dim">
      <span className="flex-none text-amber" aria-hidden="true">
        ◆
      </span>
      <p>{note.detail}</p>
    </div>
  );
}
