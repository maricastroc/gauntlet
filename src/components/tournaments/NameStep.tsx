import { Trophy } from "lucide-react";
import { IconInput } from "@/components/ui/IconInput";
import { StepCard, WizardButton } from "./wizard";

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
  busy: boolean;
  onSubmit: () => void;
}

export function NameStep({ name, onNameChange, busy, onSubmit }: NameStepProps) {
  return (
    <StepCard title="Name your tournament">
      <IconInput
        icon={Trophy}
        value={name}
        onChange={onNameChange}
        placeholder="e.g. Copa Atlas 2026"
        clearLabel="Clear tournament name"
        className="rounded-[9px] border border-line-2 bg-surface-2 py-3 text-[15px] text-ink outline-none transition-colors duration-150 placeholder:text-ink-mute focus:border-amber-line"
      />
      <WizardButton disabled={busy || name.trim().length < 2} onClick={onSubmit}>
        {busy ? "Creating…" : "Create & continue"}
      </WizardButton>
    </StepCard>
  );
}
