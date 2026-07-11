import type { Team } from "@/lib/types";

export interface DraftTeam {
  name: string;
  flag: string;
}

export const GROUP_LETTERS = "ABCDEFGH";

export const SUGGESTED: DraftTeam[] = [
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Croatia", flag: "🇭🇷" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "France", flag: "🇫🇷" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Ecuador", flag: "🇪🇨" },
  { name: "Iran", flag: "🇮🇷" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Serbia", flag: "🇷🇸" },
  { name: "Cameroon", flag: "🇨🇲" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Tunisia", flag: "🇹🇳" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "Egypt", flag: "🇪🇬" },
];

export function distribute(teams: Team[], numGroups: number): number[][] {
  const groups: number[][] = Array.from({ length: numGroups }, () => []);
  teams.forEach((team, index) => groups[index % numGroups].push(team.id));
  return groups;
}

export function groupOptions(teamCount: number): number[] {
  return [2, 4, 8].filter((g) => teamCount >= g * 2);
}

export function isBracketValid(numGroups: number, qualifyCount: number): boolean {
  const total = numGroups * qualifyCount;
  if (![4, 8, 16].includes(total)) return false;
  if (qualifyCount === 2 && numGroups % 2 !== 0) return false;
  return true;
}
