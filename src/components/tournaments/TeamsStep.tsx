import type { Dispatch, SetStateAction } from "react";
import { Plus, Shield, X } from "lucide-react";
import type { DraftTeam } from "@/lib/tournament/draft";
import { flagForCountry } from "@/lib/tournament/flags";
import { IconInput } from "@/components/ui/IconInput";
import { StepCard, WizardButton } from "./wizard";

interface TeamsStepProps {
  drafts: DraftTeam[];
  setDrafts: Dispatch<SetStateAction<DraftTeam[]>>;
  validCount: number;
  busy: boolean;
  onSubmit: () => void;
}

function editDraft(
  setDrafts: Dispatch<SetStateAction<DraftTeam[]>>,
  index: number,
  patch: Partial<DraftTeam>,
) {
  setDrafts((drafts) => drafts.map((d, i) => (i === index ? { ...d, ...patch } : d)));
}

function editName(setDrafts: Dispatch<SetStateAction<DraftTeam[]>>, index: number, name: string) {
  setDrafts((drafts) =>
    drafts.map((d, i) => {
      if (i !== index) return d;
      // A flag is "auto" while empty or still matching the current name; a
      // manually pasted emoji is never overwritten.
      const wasAuto = d.flag === "" || d.flag === flagForCountry(d.name);
      return { ...d, name, flag: wasAuto ? (flagForCountry(name) ?? "") : d.flag };
    }),
  );
}

export function TeamsStep({ drafts, setDrafts, validCount, busy, onSubmit }: TeamsStepProps) {
  const missingCount = drafts.filter((d) => d.name.trim() !== "" && d.flag === "").length;

  return (
    <StepCard title="Add the teams">
      <div className="flex flex-col gap-2">
        {drafts.map((draft, index) => {
          const missingFlag = draft.name.trim() !== "" && draft.flag === "";
          return (
            <div key={index} className="flex items-center gap-2">
              <input
                value={draft.flag}
                onChange={(e) => editDraft(setDrafts, index, { flag: e.target.value })}
                placeholder="🏳️"
                aria-label={`Flag for team ${index + 1}`}
                title={
                  missingFlag
                    ? "No flag matched this name — paste an emoji here, or leave it to use a letter badge"
                    : undefined
                }
                className={[
                  "w-14 rounded-[9px] bg-surface-2 px-2 py-2.5 text-center text-[18px] outline-none focus:border-amber-line",
                  missingFlag ? "border border-dashed border-amber-line" : "border border-line-2",
                ].join(" ")}
              />
              <IconInput
                icon={Shield}
                value={draft.name}
                onChange={(next) => editName(setDrafts, index, next)}
                placeholder={`Team ${index + 1}`}
                clearLabel={`Clear team ${index + 1} name`}
                wrapperClassName="flex-1 min-w-0"
                className="rounded-[9px] border border-line-2 bg-surface-2 py-2.5 text-[14px] text-ink outline-none transition-colors duration-150 placeholder:text-ink-mute focus:border-amber-line"
              />
              <button
                type="button"
                onClick={() => setDrafts((d) => d.filter((_, i) => i !== index))}
                aria-label={`Remove team ${index + 1}`}
                className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[9px] border border-line text-ink-mute transition-colors hover:border-loss/40 hover:text-loss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setDrafts((d) => [...d, { name: "", flag: "" }])}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[9px] border border-dashed border-line-2 py-2.5 text-[13px] text-ink-dim transition-colors hover:border-amber-line hover:text-amber-ink"
      >
        <Plus className="h-3.5 w-3.5" />
        Add team
      </button>

      <p className="mt-3 font-mono text-[11px] text-ink-mute">
        {validCount} teams · at least 4 needed
        {missingCount > 0 && (
          <span className="text-amber-ink">
            {" "}
            · {missingCount} without a flag — they&apos;ll show a letter badge
          </span>
        )}
      </p>

      <WizardButton disabled={busy || validCount < 4} onClick={onSubmit}>
        {busy ? "Saving…" : "Continue"}
      </WizardButton>
    </StepCard>
  );
}
