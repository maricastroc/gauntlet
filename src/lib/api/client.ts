import { cache } from "react";
import type {
  Bracket,
  BracketTie,
  FixtureDetail,
  GroupDetail,
  GroupStageInput,
  StageDetail,
  ScenarioProjection,
  StandingRow,
  Team,
  TieStatus,
  TieTopology,
  TournamentDetail,
  TournamentStatus,
  TournamentSummary,
} from "@/lib/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

interface ApiTeam {
  id: number;
  name: string;
}

export interface ApiStanding {
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

interface ApiScenarioGroup {
  id: number;
  name: string;
  qualify_count: number;
  standings: ApiStanding[];
}

interface ApiScenario {
  groups: ApiScenarioGroup[];
  bracket: ApiBracket | null;
}

export interface ScenarioInput {
  fixture_id: number;
  home_score: number;
  away_score: number;
  home_penalties?: number | null;
  away_penalties?: number | null;
}

interface Wrapped<T> {
  data: T;
}

interface ApiTeamFull {
  id: number;
  name: string;
  code: string | null;
  flag: string | null;
}

interface ApiFixtureDetail {
  id: number;
  tie_id: number | null;
  home: { id: number; name: string; flag: string | null } | null;
  away: { id: number; name: string; flag: string | null } | null;
  home_score: number | null;
  away_score: number | null;
  home_penalties: number | null;
  away_penalties: number | null;
  status: "scheduled" | "live" | "finished";
  version: number;
}

interface ApiGroupDetail {
  id: number;
  name: string;
  qualify_count: number;
  teams: ApiTeamFull[];
  fixtures: ApiFixtureDetail[];
}

interface ApiTieTopology {
  id: number;
  round: number;
  slot: number;
  home_source: string;
  away_source: string;
}

interface ApiStageDetail {
  id: number;
  type: "group" | "knockout";
  name: string;
  position: number;
  groups?: ApiGroupDetail[];
  ties?: ApiTieTopology[];
  fixtures?: ApiFixtureDetail[];
}

interface ApiTournamentDetail {
  id: number;
  name: string;
  status: TournamentStatus;
  can_manage?: boolean;
  teams: ApiTeamFull[];
  stages: ApiStageDetail[];
}

interface ApiTournamentSummary {
  id: number;
  name: string;
  status: TournamentStatus;
  teams_count?: number;
  stages_count?: number;
  created_at?: string;
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

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isVersionConflict(): boolean {
    return this.status === 409;
  }

  get isAuth(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get fieldErrors(): Record<string, string[]> | undefined {
    if (this.status !== 422 || typeof this.body !== "object" || this.body === null) {
      return undefined;
    }
    return (this.body as { errors?: Record<string, string[]> }).errors;
  }

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

function toTeam(team: ApiTeam | null): Team | null {
  return team ? { id: team.id, name: team.name } : null;
}

export function toStandingRow(row: ApiStanding): StandingRow {
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
    home: { team: toTeam(tie.home), score: null },
    away: { team: toTeam(tie.away), score: null },
    winnerId: tie.winner?.id ?? null,
    decidedByPenalties: tie.decided_by_penalties,
  };
}

function toTeamFull(team: ApiTeamFull): Team {
  return {
    id: team.id,
    name: team.name,
    code: team.code ?? undefined,
    flag: team.flag ?? undefined,
  };
}

function toFixtureDetail(fixture: ApiFixtureDetail): FixtureDetail {
  const side = (team: ApiFixtureDetail["home"]): Team | null =>
    team ? { id: team.id, name: team.name, flag: team.flag ?? undefined } : null;

  return {
    id: fixture.id,
    tieId: fixture.tie_id,
    home: side(fixture.home),
    away: side(fixture.away),
    homeScore: fixture.home_score,
    awayScore: fixture.away_score,
    homePenalties: fixture.home_penalties,
    awayPenalties: fixture.away_penalties,
    status: fixture.status,
    version: fixture.version,
  };
}

function toGroupDetail(group: ApiGroupDetail): GroupDetail {
  return {
    id: group.id,
    name: group.name,
    qualifyCount: group.qualify_count,
    teams: group.teams.map(toTeamFull),
    fixtures: group.fixtures.map(toFixtureDetail),
  };
}

function toTieTopology(tie: ApiTieTopology): TieTopology {
  return {
    id: tie.id,
    round: tie.round,
    slot: tie.slot,
    homeSource: tie.home_source,
    awaySource: tie.away_source,
  };
}

function toStageDetail(stage: ApiStageDetail): StageDetail {
  return {
    id: stage.id,
    type: stage.type,
    name: stage.name,
    position: stage.position,
    groups: (stage.groups ?? []).map(toGroupDetail),
    ties: (stage.ties ?? []).map(toTieTopology),
    fixtures: (stage.fixtures ?? []).map(toFixtureDetail),
  };
}

function toTournamentDetail(detail: ApiTournamentDetail): TournamentDetail {
  return {
    id: detail.id,
    name: detail.name,
    status: detail.status,
    canManage: detail.can_manage ?? false,
    teams: detail.teams.map(toTeamFull),
    stages: detail.stages.map(toStageDetail),
  };
}

function toTournamentSummary(summary: ApiTournamentSummary): TournamentSummary {
  return {
    id: summary.id,
    name: summary.name,
    status: summary.status,
    teamsCount: summary.teams_count,
    stagesCount: summary.stages_count,
    createdAt: summary.created_at,
  };
}

export const api = {
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

  projectScenario: async (
    tournamentId: number,
    results: ScenarioInput[],
  ): Promise<ScenarioProjection> => {
    const { data } = await request<Wrapped<ApiScenario>>(`/tournaments/${tournamentId}/scenario`, {
      method: "POST",
      body: JSON.stringify({ results }),
    });
    return {
      groups: data.groups.map((group) => ({
        id: group.id,
        name: group.name,
        qualifyCount: group.qualify_count,
        standings: group.standings.map(toStandingRow),
      })),
      bracket: data.bracket
        ? {
            stageId: 0,
            champion: toTeam(data.bracket.champion),
            ties: data.bracket.ties.map(toBracketTie),
          }
        : null,
    };
  },

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

  submitKnockoutResult: async (
    token: string,
    fixtureId: number,
    payload: {
      home_score: number;
      away_score: number;
      home_penalties?: number | null;
      away_penalties?: number | null;
      expected_version: number;
    },
  ): Promise<Bracket> => {
    const { data } = await request<Wrapped<ApiBracket>>(`/matches/${fixtureId}/result`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
    return { stageId: 0, champion: toTeam(data.champion), ties: data.ties.map(toBracketTie) };
  },

  listTournaments: async (token: string): Promise<TournamentSummary[]> => {
    const { data } = await request<Wrapped<ApiTournamentSummary[]>>("/tournaments", {
      headers: authHeader(token),
    });
    return data.map(toTournamentSummary);
  },

  getTournament: cache(async (id: number, token?: string): Promise<TournamentDetail> => {
    const { data } = await request<Wrapped<ApiTournamentDetail>>(
      `/tournaments/${id}`,
      token ? { headers: authHeader(token) } : undefined,
    );
    return toTournamentDetail(data);
  }),

  createTournament: async (token: string, name: string): Promise<TournamentSummary> => {
    const { data } = await request<Wrapped<ApiTournamentSummary>>("/tournaments", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ name }),
    });
    return toTournamentSummary(data);
  },

  deleteTournament: (token: string, id: number): Promise<void> =>
    request<void>(`/tournaments/${id}`, { method: "DELETE", headers: authHeader(token) }),

  updateTournament: async (token: string, id: number, name: string): Promise<TournamentSummary> => {
    const { data } = await request<Wrapped<ApiTournamentSummary>>(`/tournaments/${id}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ name }),
    });
    return toTournamentSummary(data);
  },

  updateTeam: async (
    token: string,
    tournamentId: number,
    teamId: number,
    changes: { name?: string; code?: string | null; flag?: string | null },
  ): Promise<Team> => {
    const { data } = await request<Wrapped<ApiTeamFull>>(
      `/tournaments/${tournamentId}/teams/${teamId}`,
      { method: "PATCH", headers: authHeader(token), body: JSON.stringify(changes) },
    );
    return toTeamFull(data);
  },

  addTeams: async (
    token: string,
    id: number,
    teams: Array<{ name: string; code?: string; flag?: string }>,
  ): Promise<Team[]> => {
    const { data } = await request<Wrapped<ApiTeamFull[]>>(`/tournaments/${id}/teams`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ teams }),
    });
    return data.map(toTeamFull);
  },

  buildGroupStage: async (
    token: string,
    id: number,
    input: GroupStageInput,
  ): Promise<TournamentDetail> => {
    const { data } = await request<Wrapped<ApiTournamentDetail>>(`/tournaments/${id}/group-stage`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        qualify_count: input.qualifyCount,
        groups: input.groups.map((g) => ({ name: g.name, team_ids: g.teamIds })),
      }),
    });
    return toTournamentDetail(data);
  },

  buildKnockout: async (token: string, id: number): Promise<TournamentDetail> => {
    const { data } = await request<Wrapped<ApiTournamentDetail>>(`/tournaments/${id}/knockout`, {
      method: "POST",
      headers: authHeader(token),
    });
    return toTournamentDetail(data);
  },
};
