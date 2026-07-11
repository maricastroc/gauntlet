"use client";

import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";

export function AppTooltip() {
  return (
    <Tooltip
      id="app-tooltip"
      noArrow
      offset={7}
      delayShow={80}
      className="z-50! rounded-sm! border! border-line-2! bg-surface-2! px-2! py-1! font-mono! text-[9.5px]! uppercase! tracking-[0.08em]! text-ink-dim! shadow-[0_10px_26px_-12px_rgba(0,0,0,0.75)]!"
    />
  );
}
