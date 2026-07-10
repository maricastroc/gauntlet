/**
 * Live API client for tournament-game-api.
 *
 * The screens currently render from the demo data layer (`lib/data`), so this
 * client is the seam for going live: the raw response types below match the
 * Laravel resources exactly, and the mappers lift them into the UI domain.
 *
 * Endpoints (see the API README):
 *   POST /api/register · /api/login          → { user, token }
 *   GET  /api/groups/{group}/standings        → ApiStanding[]
 *   GET  /api/stages/{stage}/bracket          → ApiBracket
 *   PUT  /api/matches/{fixture}/result        → ApiStanding[] | ApiBracket
 *
 * Reads are public; the result mutation is owner-only (Sanctum bearer token),
 * uses optimistic locking via `expected_version`, and returns 409 on conflict.
 */

import type { Bracket, BracketTie, StandingRow, Team, TieStatus } from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

/* ------------------------------------------------------------------ */
/* Raw response shapes — 1:1 with the Laravel resources                */
/* ------------------------------------------------------------------ */

interface ApiTeam {
  id: number;
  name: string;
}

interface ApiStanding {
  position: number;
  team: ApiTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: Array<"W" | "D" | "L">;
  qualified: boolean;
}

interface ApiResolvedTie {
  id: number;
  round: number;
  status: "pending" | "ready" | "decided";
  home: ApiTeam | null;
  away: ApiTeam | null;
  winner: ApiTeam | null;
  decided_by_penalties: boolean;
}

interface ApiBracket {
  champion: ApiTeam | null;
  ties: ApiResolvedTie[];
}

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** 409 — someone else edited this result first (StaleResultException). */
  get isVersionConflict(): boolean {
    return this.status === 409;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, `${res.status} ${res.statusText}`, body);
  }

  return res.json() as Promise<T>;
}

/* ------------------------------------------------------------------ */
/* Mappers: raw → UI domain                                            */
/* ------------------------------------------------------------------ */

function toTeam(team: ApiTeam | null): Team | null {
  return team ? { id: team.id, name: team.name } : null;
}

function toStandingRow(row: ApiStanding): StandingRow {
  return {
    position: row.position,
    team: { id: row.team.id, name: row.team.name },
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goal_difference,
    points: row.points,
    form: row.form,
    qualified: row.qualified,
  };
}

function toBracketTie(tie: ApiResolvedTie): BracketTie {
  const status: TieStatus = tie.status;
  return {
    id: tie.id,
    round: tie.round,
    slot: 0,
    status,
    // The bracket resource does not carry per-side scores; the UI shows them
    // when present, otherwise renders the "to be decided" treatment.
    home: { team: toTeam(tie.home), score: null },
    away: { team: toTeam(tie.away), score: null },
    winnerId: tie.winner?.id ?? null,
    decidedByPenalties: tie.decided_by_penalties,
  };
}

/* ------------------------------------------------------------------ */
/* Public surface                                                      */
/* ------------------------------------------------------------------ */

export interface AuthResult {
  user: { id: number; name: string; email: string };
  token: string;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResult>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  standings: async (groupId: number): Promise<StandingRow[]> => {
    const rows = await request<ApiStanding[]>(`/groups/${groupId}/standings`);
    return rows.map(toStandingRow);
  },

  bracket: async (stageId: number): Promise<Bracket> => {
    const data = await request<ApiBracket>(`/stages/${stageId}/bracket`);
    return {
      stageId,
      champion: toTeam(data.champion),
      ties: data.ties.map(toBracketTie),
    };
  },

  /** Submit a result; owner-only. Returns standings (group) or bracket (KO). */
  submitResult: (
    token: string,
    fixtureId: number,
    payload: {
      home_score: number;
      away_score: number;
      expected_version: number;
      home_penalties?: number | null;
      away_penalties?: number | null;
    },
  ) =>
    request<ApiStanding[] | ApiBracket>(`/matches/${fixtureId}/result`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
};
