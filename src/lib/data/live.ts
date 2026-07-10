/**
 * Live data source — composes the API responses into the UI domain.
 *
 * Covers what the API can serve: group standings and the resolved bracket.
 * Teams are enriched to English + flags; the group name and next-match are
 * derived (the standings endpoint omits the group name; there is no fixtures
 * endpoint, so "next up" is read off the bracket). No live-match state exists
 * server-side, so the Overview's live card is absent in live mode.
 */

import { api } from "@/lib/api/client";
import { roundName } from "@/lib/format";
import type {
  Bracket,
  BracketTie,
  Fixture,
  Group,
  OverviewData,
  OverviewStat,
} from "@/lib/types";
import { KNOCKOUT_STAGE_ID } from "./copa-atlas";
import {
  GROUP_IDS,
  buildTiebreakNote,
  enrichStanding,
  enrichTeam,
  groupName,
} from "./shared";

export async function liveGroup(id: number): Promise<Group> {
  const standings = (await api.standings(id)).map(enrichStanding);
  const qualifyCount = standings.filter((row) => row.qualified).length || 2;
  return {
    id,
    name: groupName(id),
    qualifyCount,
    standings,
    tiebreakNote: buildTiebreakNote(standings),
  };
}

export function liveGroups(): Promise<Group[]> {
  return Promise.all(GROUP_IDS.map(liveGroup));
}

export async function liveBracket(): Promise<Bracket> {
  const bracket = await api.bracket(KNOCKOUT_STAGE_ID);

  const ties: BracketTie[] = bracket.ties
    .map((tie) => ({
      ...tie,
      home: { ...tie.home, team: tie.home.team ? enrichTeam(tie.home.team) : null },
      away: { ...tie.away, team: tie.away.team ? enrichTeam(tie.away.team) : null },
    }))
    .sort((a, b) => a.round - b.round || a.id - b.id);

  // the resource has no slot; number ties within each round by id order
  const slotByRound = new Map<number, number>();
  for (const tie of ties) {
    const slot = (slotByRound.get(tie.round) ?? 0) + 1;
    slotByRound.set(tie.round, slot);
    tie.slot = slot;
  }

  return {
    stageId: bracket.stageId,
    champion: bracket.champion ? enrichTeam(bracket.champion) : null,
    ties,
  };
}

/** The next tie with both teams confirmed — the closest thing to "next up". */
function deriveNextFixture(bracket: Bracket): Fixture | null {
  const maxRound = Math.max(...bracket.ties.map((tie) => tie.round), 1);
  const tie = bracket.ties.find(
    (candidate) =>
      candidate.status === "ready" && candidate.home.team && candidate.away.team,
  );
  if (!tie || !tie.home.team || !tie.away.team) return null;

  return {
    id: tie.id,
    home: tie.home.team,
    away: tie.away.team,
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    groupName: `${roundName(tie.round, maxRound)} · next up`,
    note: "both teams confirmed — awaiting kickoff",
    version: 0,
  };
}

function computeStats(groups: Group[]): OverviewStat[] {
  const rows = groups.flatMap((group) => group.standings);
  const matches = rows.reduce((sum, row) => sum + row.played, 0) / 2;
  const goals = rows.reduce((sum, row) => sum + row.goalsFor, 0);
  const qualified = rows.filter((row) => row.qualified).length;

  return [
    { value: matches ? String(Math.round(matches)) : "—", label: "Matches played" },
    {
      value: matches ? (goals / matches).toFixed(1) : "—",
      label: "Goals per match",
    },
    { value: String(qualified), label: "Teams through" },
  ];
}

export async function liveOverview(): Promise<OverviewData> {
  const [groups, bracket] = await Promise.all([liveGroups(), liveBracket()]);
  return {
    featuredGroup: groups[0],
    liveFixture: null, // no live-match state server-side
    nextFixture: deriveNextFixture(bracket),
    stats: computeStats(groups),
  };
}
