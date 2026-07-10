import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** The four destinations, in the mock's rail order. */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/standings",
    label: "Standings",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  {
    href: "/bracket",
    label: "Bracket",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M4 5h6v14H4M10 12h5M15 5h5M15 19h5" />
      </svg>
    ),
  },
  {
    href: "/console",
    label: "Console",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <line x1="4" y1="8" x2="20" y2="8" />
        <circle cx="9" cy="8" r="2.4" fill="var(--color-surface)" />
        <line x1="4" y1="16" x2="20" y2="16" />
        <circle cx="15" cy="16" r="2.4" fill="var(--color-surface)" />
      </svg>
    ),
  },
];
