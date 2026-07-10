/** A labeled input used across the sign-in and sign-up forms. */
export function AuthField({
  label,
  type,
  value,
  autoComplete,
  placeholder,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  autoComplete: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[9px] border border-line-2 bg-surface-2 px-3.5 py-3 text-[15px] text-ink outline-none transition-colors duration-150 placeholder:text-ink-mute focus:border-amber-line"
      />
    </label>
  );
}
