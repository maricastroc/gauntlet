import { ordinal, roundName } from "@/lib/format";
import type { ScenarioProjection, Team } from "@/lib/types";

export interface CascadeStep {
  text: string;
  tone: "up" | "down" | "info";
}

function teamsOf(tie: { home: { team: Team | null }; away: { team: Team | null } }): Team[] {
  return [tie.home.team, tie.away.team].filter((team): team is Team => team !== null);
}

export function describeCascade(
  baseline: ScenarioProjection,
  projection: ScenarioProjection,
): CascadeStep[] {
  const steps: CascadeStep[] = [];

  const baseGroups = new Map(baseline.groups.map((group) => [group.id, group]));
  for (const group of projection.groups) {
    const base = baseGroups.get(group.id);
    if (!base) continue;
    const baseRows = new Map(base.standings.map((row) => [row.team.id, row]));

    const quals: CascadeStep[] = [];
    const moves: CascadeStep[] = [];
    for (const row of group.standings) {
      const before = baseRows.get(row.team.id);
      if (!before) continue;

      if (row.qualified !== before.qualified) {
        quals.push({
          text: `${row.team.name} ${row.qualified ? "climbs into" : "drops out of"} the top ${group.qualifyCount} of Group ${group.name}`,
          tone: row.qualified ? "up" : "down",
        });
      } else if (row.position !== before.position) {
        moves.push({
          text: `${row.team.name} ${row.position < before.position ? "rises" : "slips"} to ${ordinal(row.position)} in Group ${group.name}`,
          tone: row.position < before.position ? "up" : "down",
        });
      }
    }
    steps.push(...quals, ...moves);
  }

  const before = baseline.bracket;
  const after = projection.bracket;
  if (after && before) {
    const baseTies = new Map(before.ties.map((tie) => [tie.id, tie]));
    const maxRound = Math.max(...after.ties.map((tie) => tie.round), 1);
    const sorted = [...after.ties].sort((a, b) => a.round - b.round || a.slot - b.slot);

    for (const tie of sorted) {
      const baseTie = baseTies.get(tie.id);
      if (!baseTie) continue;

      const round = roundName(tie.round, maxRound);
      const wasThere = teamsOf(baseTie);
      const nowThere = teamsOf(tie);
      const entered = nowThere.filter((team) => !wasThere.some((other) => other.id === team.id));
      const left = wasThere.filter((team) => !nowThere.some((other) => other.id === team.id));

      entered.forEach((team, index) => {
        const replaced = left[index];
        steps.push({
          text: replaced
            ? `${team.name} replaces ${replaced.name} in the ${round}`
            : `${team.name} reaches the ${round}`,
          tone: "info",
        });
      });
    }

    if (after.champion && after.champion.id !== (before.champion?.id ?? null)) {
      steps.push({ text: `New champion: ${after.champion.name}`, tone: "up" });
    }
  }

  return steps;
}
