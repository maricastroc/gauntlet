import type { ReactNode } from "react";
import {
  FlaskConical,
  GitFork,
  LayoutDashboard,
  ListOrdered,
  Radio,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: <LayoutDashboard /> },
  { href: "/standings", label: "Standings", icon: <ListOrdered /> },
  { href: "/bracket", label: "Bracket", icon: <GitFork /> },
  { href: "/live", label: "Live", icon: <Radio /> },
  { href: "/console", label: "Console", icon: <SlidersHorizontal /> },
  { href: "/what-if", label: "What if?", icon: <FlaskConical /> },
  { href: "/tournaments", label: "Tournaments", icon: <Trophy /> },
];
