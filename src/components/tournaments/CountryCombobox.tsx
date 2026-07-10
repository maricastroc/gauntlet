"use client";

import { useId, useState } from "react";
import { Shield, X } from "lucide-react";
import { searchCountries, type Country } from "@/lib/tournament/flags";

interface CountryComboboxProps {
  value: string;
  onChange: (name: string) => void;
  ariaLabel: string;
  flag?: string;
  placeholder?: string;
  clearLabel?: string;
  wrapperClassName?: string;
}

export function CountryCombobox({
  value,
  onChange,
  ariaLabel,
  flag,
  placeholder,
  clearLabel = "Clear",
  wrapperClassName = "",
}: CountryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const listboxId = useId();

  const matches = open && value.trim() ? searchCountries(value) : [];
  const showList = matches.length > 0;

  function pick(country: Country) {
    onChange(country.name);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!showList) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((h) => (h - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(matches[Math.min(highlight, matches.length - 1)]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={`group relative ${wrapperClassName}`}>
      {flag ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] leading-none"
        >
          {flag}
        </span>
      ) : (
        <Shield
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute transition-colors duration-150 group-focus-within:text-amber-ink"
        />
      )}
      <input
        value={value}
        aria-label={ariaLabel}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        autoComplete="off"
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="w-full rounded-[9px] border border-line-2 bg-surface-2 py-2.5 pl-9 pr-9 text-[14px] text-ink outline-none transition-colors duration-150 placeholder:text-ink-mute focus:border-amber-line focus:shadow-[0_0_0_3px_var(--color-amber-soft)]"
      />
      {value.length > 0 && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChange("")}
          aria-label={clearLabel}
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-[6px] text-ink-mute transition-colors duration-150 hover:bg-white/5 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {showList && (
        <ul
          role="listbox"
          id={listboxId}
          className="absolute left-0 right-0 z-30 mt-1.5 max-h-[240px] overflow-auto rounded-[10px] border border-line-2 bg-surface-2 p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] motion-safe:animate-rise"
        >
          {matches.map((country, index) => (
            <li key={country.name}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlight}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => pick(country)}
                className={`flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left text-[13px] transition-colors ${
                  index === highlight ? "bg-amber-soft text-amber-ink" : "text-ink-dim"
                }`}
              >
                <span className="text-[15px] leading-none">{country.flag}</span>
                <span className="truncate">{country.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
