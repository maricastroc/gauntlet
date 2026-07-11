export function roundName(round: number, maxRound: number): string {
  const distanceToFinal = maxRound - round;
  switch (distanceToFinal) {
    case 0:
      return "Final";
    case 1:
      return "Semifinals";
    case 2:
      return "Quarterfinals";
    case 3:
      return "Round of 16";
    case 4:
      return "Round of 32";
    default:
      return `Round ${round}`;
  }
}

export function shortRound(round: number, maxRound: number): string {
  const distance = maxRound - round;
  if (distance === 0) return "Final";
  if (distance === 1) return "Semis";
  if (distance === 2) return "Quarters";
  if (distance === 3) return "R16";
  return `R${round}`;
}

export function roundTag(round: number, maxRound: number, slot: number): string {
  const distanceToFinal = maxRound - round;
  const prefix =
    distanceToFinal === 0
      ? "F"
      : distanceToFinal === 1
        ? "SF"
        : distanceToFinal === 2
          ? "QF"
          : `R${round}·`;
  return distanceToFinal === 0 ? prefix : `${prefix}${slot}`;
}

export function formatProbability(prob: number): string {
  if (prob >= 0.995) return "100%";
  if (prob > 0 && prob < 0.01) return "<1%";
  return `${Math.round(prob * 100)}%`;
}

export function titleBarWidth(prob: number): string {
  return `${Math.max(4, prob * 100)}%`;
}

export function formatGoalDifference(diff: number): string {
  if (diff > 0) return `+${diff}`;
  if (diff < 0) return `−${Math.abs(diff)}`;
  return "0";
}

export function ordinal(position: number): string {
  const mod100 = position % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${position}th`;
  switch (position % 10) {
    case 1:
      return `${position}st`;
    case 2:
      return `${position}nd`;
    case 3:
      return `${position}rd`;
    default:
      return `${position}th`;
  }
}

export function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "a month ago" : `${months} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "a year ago" : `${years} years ago`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
