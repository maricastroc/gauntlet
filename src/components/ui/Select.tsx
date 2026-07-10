"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export interface SelectItem {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  items: SelectItem[];
  ariaLabel: string;
  placeholder?: string;
  triggerClassName?: string;
}

export function Select({
  value,
  onValueChange,
  items,
  ariaLabel,
  placeholder,
  triggerClassName = "",
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={`flex items-center justify-between gap-2 rounded-[9px] border border-line-2 bg-surface-2 px-3 py-2.5 text-left text-[13.5px] text-ink outline-none transition-colors duration-150 focus:border-amber-line data-[state=open]:border-amber-line ${triggerClassName}`}
      >
        <span className="truncate">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-mute" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-[min(340px,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[11px] border border-line-2 bg-surface-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] motion-safe:animate-rise"
        >
          <SelectPrimitive.ScrollUpButton className="flex justify-center py-1 text-ink-mute">
            <ChevronUp className="h-4 w-4" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-1.5">
            {items.map((item) => (
              <SelectPrimitive.Item
                key={item.value}
                value={item.value}
                className="flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] text-ink-dim outline-none data-[highlighted]:bg-amber-soft data-[highlighted]:text-amber-ink data-[state=checked]:text-ink"
              >
                <span className="grid w-4 shrink-0 place-items-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-3.5 w-3.5 text-amber" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{item.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="flex justify-center py-1 text-ink-mute">
            <ChevronDown className="h-4 w-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
