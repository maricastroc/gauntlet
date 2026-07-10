import type { Dispatch, SetStateAction } from "react";
import { Plus, X } from "lucide-react";
import type { DraftTeam } from "@/lib/tournament/draft";
import { flagForCountry } from "@/lib/tournament/flags";
import { CountryCombobox } from "./CountryCombobox";
import { StepCard, WizardButton } from "./wizard";

interface TeamsStepProps {
  drafts: DraftTeam[];
  setDrafts: Dispatch<SetStateAction<DraftTeam[]>>;
  validCount: number;
  busy: boolean;
  onSubmit: () => void;
}

function editName(setDrafts: Dispatch<SetStateAction<DraftTeam[]>>, index: number, name: string) {
  setDrafts((drafts) =>
    drafts.map((d, i) => (i === index ? { ...d, name, flag: flagForCountry(name) ?? "" } : d)),
  );
}

export function TeamsStep({ drafts, setDrafts, validCount, busy, onSubmit }: TeamsStepProps) {
  const missingCount = drafts.filter((d) => d.name.trim() !== "" && d.flag === "").length;

  return (
    <StepCard title="Add the teams">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-x-4 md:gap-y-2.5">
        {drafts.map((draft, index) => (
          <div key={index} className="flex items-center gap-2">
            <CountryCombobox
              value={draft.name}
              flag={draft.flag}
              onChange={(next) => editName(setDrafts, index, next)}
              ariaLabel={`Team ${index + 1} name`}
              placeholder={`Team ${index + 1}`}
              clearLabel={`Clear team ${index + 1} name`}
              wrapperClassName="flex-1 min-w-0"
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
        ))}
      </div>

      <button
        type="button"
        onClick={() => setDrafts((d) => [...d, { name: "", flag: "" }])}
        className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-[9px] border border-dashed border-line-2 py-2.5 text-[13px] text-ink-dim transition-colors hover:border-amber-line hover:text-amber-ink"
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
