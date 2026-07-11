import { computeStandings, type RawMatch } from "@/lib/standings";
import { resolveBracket, type TieResults } from "@/lib/knockout";
import { roundName } from "@/lib/format";
import type {
  Bracket,
  BracketTie,
  ScenarioProjection,
  ScenarioResult,
  Team,
  WhatIfFixture,
  WhatIfSetup,
} from "@/lib/types";
import { GROUPS, KNOCKOUT_STAGE_ID, MAX_ROUND, TIES, team } from "./copa-atlas";

const groupMatchId = (groupId: number, index: number): number => groupId * 100 + index;
const isGroupFixtureId = (fixtureId: number): boolean => fixtureId >= 100;

function projectGroups(overrides: Map<number, ScenarioResult>): ScenarioProjection["groups"] {
  return GROUPS.map((group) => {
    const matches: RawMatch[] = group.matches.map((match, index) => {
      const override = overrides.get(groupMatchId(group.id, index));
      return override
        ? {
            homeId: match.homeId,
            awayId: match.awayId,
            homeScore: override.homeScore,
            awayScore: override.awayScore,
          }
        : match;
    });

    return {
      id: group.id,
      name: group.name,
      qualifyCount: group.qualifyCount,
      standings: computeStandings(group.teamIds.map(team), matches, group.qualifyCount),
    };
  });
}

function seedMap(groups: ScenarioProjection["groups"]): Map<string, Team> {
  const seeds = new Map<string, Team>();
  for (const group of groups) {
    group.standings.forEach((row, index) => seeds.set(`${group.name}${index + 1}`, row.team));
  }
  return seeds;
}

function projectBracket(
  groups: ScenarioProjection["groups"],
  overrides: Map<number, ScenarioResult>,
): Bracket {
  const seeds = seedMap(groups);

  const base: BracketTie[] = TIES.map((tie) => ({
    id: tie.id,
    round: tie.round,
    slot: tie.slot,
    status: "pending",
    home: {
      team: tie.round === 1 && tie.homeSeed ? (seeds.get(tie.homeSeed) ?? null) : null,
      placeholder: tie.homeSourceLabel,
      score: null,
      penalties: null,
    },
    away: {
      team: tie.round === 1 && tie.awaySeed ? (seeds.get(tie.awaySeed) ?? null) : null,
      placeholder: tie.awaySourceLabel,
      score: null,
      penalties: null,
    },
    winnerId: null,
    decidedByPenalties: false,
  }));

  const results: TieResults = new Map();
  for (const tie of TIES) {
    const override = overrides.get(tie.id);
    if (override) {
      results.set(tie.id, {
        home: override.homeScore,
        away: override.awayScore,
        homePenalties: override.homePenalties ?? null,
        awayPenalties: override.awayPenalties ?? null,
      });
    } else if (tie.homeScore !== null && tie.awayScore !== null) {
      results.set(tie.id, {
        home: tie.homeScore,
        away: tie.awayScore,
        homePenalties: tie.homePenalties ?? null,
        awayPenalties: tie.awayPenalties ?? null,
      });
    }
  }

  const resolved = resolveBracket(base, results);
  return { stageId: KNOCKOUT_STAGE_ID, champion: resolved.champion, ties: resolved.ties };
}

export function demoProjectScenario(results: ScenarioResult[]): ScenarioProjection {
  const groupOverrides = new Map<number, ScenarioResult>();
  const knockoutOverrides = new Map<number, ScenarioResult>();
  for (const result of results) {
    (isGroupFixtureId(result.fixtureId) ? groupOverrides : knockoutOverrides).set(
      result.fixtureId,
      result,
    );
  }

  const groups = projectGroups(groupOverrides);
  return { groups, bracket: projectBracket(groups, knockoutOverrides) };
}

export function demoWhatIfSetup(): WhatIfSetup {
  const fixtures: WhatIfFixture[] = [];

  for (const group of GROUPS) {
    group.matches.forEach((match, index) => {
      const home = team(match.homeId);
      const away = team(match.awayId);
      fixtures.push({
        id: groupMatchId(group.id, index),
        phase: "group",
        label: `Group ${group.name} · ${home.name} vs ${away.name}`,
        home,
        away,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: "finished",
        isKnockout: false,
      });
    });
  }

  for (const tie of TIES) {
    if (tie.homeId === null || tie.awayId === null) continue;
    const home = team(tie.homeId);
    const away = team(tie.awayId);
    fixtures.push({
      id: tie.id,
      phase: "knockout",
      label: `${roundName(tie.round, MAX_ROUND)} · ${home.name} vs ${away.name}`,
      home,
      away,
      homeScore: tie.homeScore,
      awayScore: tie.awayScore,
      status: tie.status === "live" ? "live" : tie.homeScore !== null ? "finished" : "scheduled",
      isKnockout: true,
    });
  }

  return { fixtures, baseline: demoProjectScenario([]) };
}
