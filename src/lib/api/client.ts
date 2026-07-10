/**
 * Live API client for tournament-game-api.
 *
 * Reads are public; the result mutation is owner-only (Sanctum bearer token),
 * uses optimistic locking via `expected_version`, and returns 409 on conflict.
 *
 * Wire notes learned from the running API:
 *   - Resource responses are wrapped: `{ "data": ... }` (standings, bracket,
 *     and the result mutation). Auth responses (`/login`, `/user`) are not.
 *   - Team objects are `{ id, name }` with names in Portuguese; the data layer
 *     enriches them to English + flags via a team catalog keyed by id.
 *   - The bracket carries no per-side scores, kickoff or live state.
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

/** Laravel wraps resource payloads in a top-level `data` key. */
interface Wrapped<T> {
  data: T;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
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

  /** 401/403 — token missing/expired, or not the tournament owner. */
  get isAuth(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** 422 — validation. `fieldErrors` surfaces Laravel's messages. */
  get fieldErrors(): Record<string, string[]> | undefined {
    if (this.status !== 422 || typeof this.body !== "object" || this.body === null) {
      return undefined;
    }
    return (this.body as { errors?: Record<string, string[]> }).errors;
  }

  /** A single human message, best-effort. */
  get displayMessage(): string {
    if (this.isVersionConflict) {
      return "This result was changed elsewhere. Reload before editing again.";
    }
    if (this.status === 401) return "Your session has expired. Sign in again.";
    if (this.status === 403) return "Only the tournament organizer can save results.";
    const errors = this.fieldErrors;
    if (errors) return Object.values(errors).flat()[0] ?? "Invalid data.";
    if (typeof this.body === "object" && this.body !== null) {
      const message = (this.body as { message?: string }).message;
      if (message) return message;
    }
    return "Something went wrong. Try again.";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (cause) {
    // network failure / API not running
    throw new ApiError(0, "Could not reach the API.", cause);
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => undefined);
  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText}`, body);
  }
  return body as T;
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

/* ------------------------------------------------------------------ */
/* Mappers: raw → UI domain (team names stay as the API sends them;    */
/* the data layer enriches to English + flags)                          */
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
    slot: 0, // the resource has no slot; the data layer orders within a round
    status,
    home: { team: toTeam(tie.home), score: null },
    away: { team: toTeam(tie.away), score: null },
    winnerId: tie.winner?.id ?? null,
    decidedByPenalties: tie.decided_by_penalties,
  };
}

/* ------------------------------------------------------------------ */
/* Public surface                                                      */
/* ------------------------------------------------------------------ */

export const api = {
  /* --- auth --- */
  login: (email: string, password: string) =>
    request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  me: (token: string) => request<AuthUser>("/user", { headers: authHeader(token) }),

  logout: (token: string) =>
    request<void>("/logout", { method: "POST", headers: authHeader(token) }),

  /* --- public reads --- */
  standings: async (groupId: number): Promise<StandingRow[]> => {
    const { data } = await request<Wrapped<ApiStanding[]>>(`/groups/${groupId}/standings`);
    return data.map(toStandingRow);
  },

  bracket: async (stageId: number): Promise<Bracket> => {
    const { data } = await request<Wrapped<ApiBracket>>(`/stages/${stageId}/bracket`);
    return {
      stageId,
      champion: toTeam(data.champion),
      ties: data.ties.map(toBracketTie),
    };
  },

  /* --- owner write --- */
  /** Submit a group-stage result; returns the recomputed standings. */
  submitGroupResult: async (
    token: string,
    fixtureId: number,
    payload: { home_score: number; away_score: number; expected_version: number },
  ): Promise<StandingRow[]> => {
    const { data } = await request<Wrapped<ApiStanding[]>>(`/matches/${fixtureId}/result`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
    return data.map(toStandingRow);
  },
};
