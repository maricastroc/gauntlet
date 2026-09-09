import { describe, expect, it } from "vitest";
import { buildRecap, pickFeaturedGroup, pickNextFixture } from "@/lib/overview";
import type {
  Bracket,
  BracketTie,
  FixtureDetail,
  Group,
  StandingRow,
  Team,
  TieSide,
} from "@/lib/types";

const team = (id: number): Team => ({ id, name: `T${id}` });

function row(t: Team, points: number, gd: number, advanceProb?: number): StandingRow {
  return {
    position: 0,
    team: t,
    played: 3,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: Math.max(gd, 0),
    goalsAgainst: 0,
    goalDifference: gd,
    points,
    form: [],
    qualified: false,
    advanceProb,
  };
}

function group(id: number, name: string, rows: StandingRow[], qualifyCount = 2): Group {
  return {
    id,
    name,
    qualifyCount,
    standings: rows.map((r, i) => ({ ...r, position: i + 1, qualified: i < qualifyCount })),
  };
}

function fixture(
  id: number,
  home: number | null,
  away: number | null,
  status: FixtureDetail["status"],
): FixtureDetail {
  return {
    id,
    tieId: null,
    home: home ? team(home) : null,
    away: away ? team(away) : null,
    homeScore: null,
    awayScore: null,
    homePenalties: null,
    awayPenalties: null,
    status,
    version: 0,
  };
}

describe("pickFeaturedGroup", () => {
  it("returns null with no groups", () => {
    expect(pickFeaturedGroup([])).toBeNull();
  });

  it("prefers the least-settled group by advance odds", () => {
    const settled = group(1, "A", [
      row(team(1), 9, 5, 1),
      row(team(2), 6, 2, 1),
      row(team(3), 0, -7, 0),
    ]);
    const contested = group(2, "B", [
      row(team(4), 4, 1, 0.6),
      row(team(5), 4, 0, 0.55),
      row(team(6), 3, -1, 0.45),
    ]);
    expect(pickFeaturedGroup([settled, contested])?.name).toBe("B");
  });

  it("falls back to the tightest cut line once every group is settled", () => {
    const wide = group(1, "A", [row(team(1), 9, 5), row(team(2), 7, 3), row(team(3), 1, -8)]);
    const tight = group(2, "B", [row(team(4), 5, 2), row(team(5), 4, 1), row(team(6), 4, 0)]);
    expect(pickFeaturedGroup([wide, tight])?.name).toBe("B");
  });
});

describe("pickNextFixture", () => {
  const noBracket: Bracket = { stageId: 0, champion: null, ties: [] };

  it("returns the next scheduled game in the featured group first", () => {
    const groups = [
      { id: 1, name: "A", qualifyCount: 2, teams: [], fixtures: [fixture(10, 1, 2, "scheduled")] },
      { id: 2, name: "B", qualifyCount: 2, teams: [], fixtures: [fixture(20, 3, 4, "scheduled")] },
    ];
    const featured = group(2, "B", [row(team(3), 0, 0), row(team(4), 0, 0)]);
    const next = pickNextFixture(groups, featured, noBracket);
    expect(next?.id).toBe(20);
    expect(next?.groupName).toBe("Group B · next up");
  });

  it("skips finished games", () => {
    const groups = [
      {
        id: 1,
        name: "A",
        qualifyCount: 2,
        teams: [],
        fixtures: [fixture(10, 1, 2, "finished"), fixture(11, 1, 3, "scheduled")],
      },
    ];
    expect(pickNextFixture(groups, null, noBracket)?.id).toBe(11);
  });

  it("falls back to the next ready knockout tie once the groups are done", () => {
    const tie: BracketTie = {
      id: 5,
      round: 1,
      slot: 1,
      status: "ready",
      home: { team: team(1), score: null, penalties: null } as TieSide,
      away: { team: team(2), score: null, penalties: null } as TieSide,
      winnerId: null,
      decidedByPenalties: false,
    };
    const bracket: Bracket = { stageId: 1, champion: null, ties: [tie] };
    const next = pickNextFixture([], null, bracket);
    expect(next?.id).toBe(5);
    expect(next?.home.id).toBe(1);
  });

  it("returns null when nothing is scheduled and no tie is ready", () => {
    expect(pickNextFixture([], null, noBracket)).toBeNull();
  });
});

describe("buildRecap", () => {
  const tie = (
    round: number,
    home: Team,
    away: Team,
    hs: number,
    as: number,
    opts: { pens?: [number, number]; winnerId?: number } = {},
  ): BracketTie => ({
    id: round * 10,
    round,
    slot: 1,
    status: "decided",
    home: { team: home, score: hs, penalties: opts.pens?.[0] ?? null } as TieSide,
    away: { team: away, score: as, penalties: opts.pens?.[1] ?? null } as TieSide,
    winnerId: opts.winnerId ?? (hs >= as ? home.id : away.id),
    decidedByPenalties: opts.pens != null,
  });

  const standing = (t: Team, gf: number, ga: number): StandingRow => ({
    position: 1,
    team: t,
    played: 3,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: gf,
    goalsAgainst: ga,
    goalDifference: gf - ga,
    points: 0,
    form: [],
    qualified: false,
  });

  const playedFixture = (
    id: number,
    home: Team,
    away: Team,
    hs: number,
    as: number,
  ): FixtureDetail => ({
    id,
    tieId: null,
    home,
    away,
    homeScore: hs,
    awayScore: as,
    homePenalties: null,
    awayPenalties: null,
    status: "finished",
    version: 0,
  });

  const groups: Group[] = [
    group(1, "A", [standing(team(1), 8, 3), standing(team(2), 4, 0)]),
    group(2, "B", [standing(team(3), 5, 2), standing(team(4), 1, 6)]),
  ];

  const bracket: Bracket = {
    stageId: 1,
    champion: team(1),
    ties: [
      tie(1, team(1), team(2), 2, 0),
      tie(2, team(1), team(3), 1, 1, { pens: [4, 2], winnerId: 1 }),
      tie(3, team(1), team(4), 3, 1),
    ],
  };

  it("returns null when there is no champion", () => {
    expect(buildRecap({ stageId: 1, champion: null, ties: [] }, groups, [])).toBeNull();
  });

  it("traces the champion's road in round order, formatting penalty wins", () => {
    const recap = buildRecap(bracket, groups, [])!;
    expect(recap.championRoad).toHaveLength(3);
    expect(recap.championRoad.map((step) => step.opponent.id)).toEqual([2, 3, 4]);
    expect(recap.championRoad[0].score).toBe("2–0");
    expect(recap.championRoad[1].score).toBe("1–1 (4–2 pens)");
  });

  it("identifies the final as the top-round tie", () => {
    const recap = buildRecap(bracket, groups, [])!;
    expect(recap.final?.home.team?.id).toBe(1);
    expect(recap.final?.away.team?.id).toBe(4);
  });

  it("derives best attack, meanest defense and biggest win", () => {
    const recap = buildRecap(bracket, groups, [playedFixture(99, team(3), team(4), 5, 0)])!;
    const byLabel = Object.fromEntries(recap.superlatives.map((s) => [s.label, s]));
    expect(byLabel["Best attack"].team.id).toBe(1);
    expect(byLabel["Meanest defense"].team.id).toBe(2);
    expect(byLabel["Biggest win"].team.id).toBe(3);
    expect(byLabel["Biggest win"].detail).toBe("5–0 vs T4");
  });
});
