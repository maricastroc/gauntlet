import { describe, expect, it } from "vitest";
import {
  childOf,
  isDraw,
  resolveBracket,
  resolvedSide,
  roadToFinal,
  type TieResult,
  type TieResults,
} from "@/lib/knockout";
import type { BracketTie, Team, TieSide } from "@/lib/types";

const team = (id: number, name: string): Team => ({ id, name });

const side = (t: Team | null): TieSide => ({ team: t, score: null, penalties: null });

function baseBracket(): BracketTie[] {
  const [a, b, c, d] = [team(1, "A"), team(2, "B"), team(3, "C"), team(4, "D")];
  return [
    {
      id: 10,
      round: 1,
      slot: 1,
      status: "ready",
      home: side(a),
      away: side(b),
      winnerId: null,
      decidedByPenalties: false,
    },
    {
      id: 11,
      round: 1,
      slot: 2,
      status: "ready",
      home: side(c),
      away: side(d),
      winnerId: null,
      decidedByPenalties: false,
    },
    {
      id: 20,
      round: 2,
      slot: 1,
      status: "pending",
      home: side(null),
      away: side(null),
      winnerId: null,
      decidedByPenalties: false,
    },
  ];
}

describe("isDraw", () => {
  it("is true only when the scores are level", () => {
    expect(isDraw({ home: 1, away: 1 })).toBe(true);
    expect(isDraw({ home: 2, away: 1 })).toBe(false);
  });
});

describe("resolvedSide", () => {
  it("returns the higher-scoring side", () => {
    expect(resolvedSide({ home: 2, away: 1 })).toBe("home");
    expect(resolvedSide({ home: 0, away: 3 })).toBe("away");
  });

  it("falls back to penalties on a draw", () => {
    expect(resolvedSide({ home: 1, away: 1, homePenalties: 4, awayPenalties: 3 })).toBe("home");
    expect(resolvedSide({ home: 1, away: 1, homePenalties: 2, awayPenalties: 5 })).toBe("away");
  });

  it("is null when a draw has no penalty decider", () => {
    expect(resolvedSide({ home: 1, away: 1 })).toBeNull();
    expect(resolvedSide({ home: 1, away: 1, homePenalties: 3, awayPenalties: 3 })).toBeNull();
  });
});

describe("childOf", () => {
  it("maps odd slots into the home side of the parent", () => {
    expect(childOf({ round: 1, slot: 1 })).toEqual({ round: 2, slot: 1, side: "home" });
    expect(childOf({ round: 1, slot: 3 })).toEqual({ round: 2, slot: 2, side: "home" });
  });

  it("maps even slots into the away side of the parent", () => {
    expect(childOf({ round: 1, slot: 2 })).toEqual({ round: 2, slot: 1, side: "away" });
    expect(childOf({ round: 1, slot: 4 })).toEqual({ round: 2, slot: 2, side: "away" });
  });
});

describe("resolveBracket", () => {
  it("marks round-one ties ready and later ties pending with no results", () => {
    const { ties, champion } = resolveBracket(baseBracket(), new Map());
    expect(ties.find((t) => t.id === 10)!.status).toBe("ready");
    expect(ties.find((t) => t.id === 20)!.status).toBe("pending");
    expect(champion).toBeNull();
  });

  it("fills feeder placeholders on downstream slots", () => {
    const { ties } = resolveBracket(baseBracket(), new Map());
    const final = ties.find((t) => t.id === 20)!;
    expect(final.home.placeholder).toBe("Winner SF1");
    expect(final.away.placeholder).toBe("Winner SF2");
  });

  it("advances winners into the next round", () => {
    const results: TieResults = new Map<number, TieResult>([
      [10, { home: 2, away: 0 }],
      [11, { home: 0, away: 1 }],
    ]);
    const { ties } = resolveBracket(baseBracket(), results);
    const final = ties.find((t) => t.id === 20)!;
    expect(final.home.team?.id).toBe(1);
    expect(final.away.team?.id).toBe(4);
    expect(final.status).toBe("ready");
  });

  it("cascades all the way to a champion", () => {
    const results: TieResults = new Map<number, TieResult>([
      [10, { home: 2, away: 0 }],
      [11, { home: 0, away: 1 }],
      [20, { home: 1, away: 3 }],
    ]);
    const { ties, champion } = resolveBracket(baseBracket(), results);
    expect(champion?.id).toBe(4);
    expect(ties.find((t) => t.id === 20)!.status).toBe("decided");
  });

  it("records penalty deciders on drawn ties", () => {
    const results: TieResults = new Map<number, TieResult>([
      [10, { home: 1, away: 1, homePenalties: 4, awayPenalties: 2 }],
    ]);
    const { ties } = resolveBracket(baseBracket(), results);
    const tie = ties.find((t) => t.id === 10)!;
    expect(tie.decidedByPenalties).toBe(true);
    expect(tie.winnerId).toBe(1);
    expect(ties.find((t) => t.id === 20)!.home.team?.id).toBe(1);
  });

  it("leaves a drawn tie without penalties unresolved", () => {
    const results: TieResults = new Map<number, TieResult>([[10, { home: 1, away: 1 }]]);
    const { ties } = resolveBracket(baseBracket(), results);
    const tie = ties.find((t) => t.id === 10)!;
    expect(tie.status).toBe("ready");
    expect(tie.winnerId).toBeNull();
  });

  it("re-derives downstream slots when an upstream result changes", () => {
    const first = resolveBracket(
      baseBracket(),
      new Map<number, TieResult>([[10, { home: 2, away: 0 }]]),
    );
    expect(first.ties.find((t) => t.id === 20)!.home.team?.id).toBe(1);

    const flipped = resolveBracket(
      baseBracket(),
      new Map<number, TieResult>([[10, { home: 0, away: 2 }]]),
    );
    expect(flipped.ties.find((t) => t.id === 20)!.home.team?.id).toBe(2);
  });
});

describe("roadToFinal", () => {
  it("traces a team's ties plus the forward slots to the final", () => {
    expect(roadToFinal(baseBracket(), 1)).toEqual(new Set([10, 20]));
    expect(roadToFinal(baseBracket(), 3)).toEqual(new Set([11, 20]));
  });

  it("stops at the tie where the team was knocked out", () => {
    const ties = baseBracket();
    const semi = ties.find((t) => t.id === 10)!;
    semi.status = "decided";
    semi.winnerId = 1;
    expect(roadToFinal(ties, 2)).toEqual(new Set([10]));
    expect(roadToFinal(ties, 1)).toEqual(new Set([10, 20]));
  });

  it("returns an empty set for a team not in the bracket", () => {
    expect(roadToFinal(baseBracket(), 99)).toEqual(new Set());
  });
});
