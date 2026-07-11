import type { LucideIcon } from "lucide-react";
import { IconInput } from "@/components/ui/IconInput";

export function AuthField({
  label,
  type,
  value,
  autoComplete,
  placeholder,
  icon,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  autoComplete: string;
  placeholder?: string;
  icon: LucideIcon;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
        {label}
      </span>
      <IconInput
        icon={icon}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={onChange}
        clearLabel={`Clear ${label.toLowerCase()}`}
        className="rounded-[9px] border border-line-2 bg-surface-2 py-3 text-[15px] text-ink outline-none transition-all duration-200 placeholder:text-ink-mute focus:border-amber-line"
      />
    </label>
  );
}
