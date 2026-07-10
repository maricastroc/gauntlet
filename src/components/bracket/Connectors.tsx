/**
 * Bracket connectors, drawn in CSS.
 *
 * Each round's matches are distributed with equal flex weight, so their
 * vertical centers land at predictable fractions. A connector column carries
 * one cell per pair; each cell draws a right-facing "]" that joins the two
 * feeder centers (at 25% / 75% of the cell) into a single output stub at 50%.
 * Because every column shares the same height, the joins line up exactly.
 */

/** Kept in sync with the round headers so cells start below the header row. */
export const HEADER_SPACER = "h-9";

export function PairConnector({ pairs }: { pairs: number }) {
  return (
    <div className="flex w-9 shrink-0 flex-col">
      <div className={HEADER_SPACER} aria-hidden="true" />
      <div className="flex flex-1 flex-col" aria-hidden="true">
        {Array.from({ length: pairs }).map((_, index) => (
          <div key={index} className="relative flex-1">
            {/* the "]" join: two feeder horizontals + the vertical spine */}
            <div className="absolute inset-y-1/4 left-0 right-1/2 rounded-r-[9px] border border-l-0 border-line-2" />
            {/* the output stub feeding the next round */}
            <div className="absolute left-1/2 right-0 top-1/2 border-t border-line-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** A single straight line — the final match feeding the trophy. */
export function StraightConnector() {
  return (
    <div className="flex w-9 shrink-0 flex-col">
      <div className={HEADER_SPACER} aria-hidden="true" />
      <div className="relative flex-1" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 border-t border-line-2" />
      </div>
    </div>
  );
}
