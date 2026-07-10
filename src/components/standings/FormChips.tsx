import type { ResultLetter } from "@/lib/types";

const STYLES: Record<ResultLetter, string> = {
  W: "bg-win",
  D: "bg-draw",
  L: "bg-loss",
};

const LABELS: Record<ResultLetter, string> = { W: "W", D: "D", L: "L" };

/** The last few results as small colored chips — a glanceable momentum read. */
export function FormChips({ form }: { form: ResultLetter[] }) {
  if (form.length === 0) return null;
  return (
    <span className="inline-flex gap-1">
      {form.map((result, index) => (
        <span
          key={index}
          className={`grid h-[18px] w-[18px] place-items-center rounded-[5px] font-mono text-[10px] font-bold text-ground ${STYLES[result]}`}
        >
          {LABELS[result]}
        </span>
      ))}
    </span>
  );
}
