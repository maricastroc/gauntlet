"use client";

import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

interface IconInputProps extends Omit<ComponentPropsWithoutRef<"input">, "onChange"> {
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  clearLabel?: string;
  wrapperClassName?: string;
}

export function IconInput({
  icon: Icon,
  value,
  onChange,
  clearLabel = "Clear field",
  wrapperClassName = "",
  className = "",
  ...rest
}: IconInputProps) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <Icon
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full pl-9 pr-9 ${className}`}
        {...rest}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={clearLabel}
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-[6px] text-ink-mute transition-colors duration-150 hover:bg-white/5 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
