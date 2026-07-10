/**
 * UI domain model.
 *
 * These are the shapes the screens consume. They are a superset of what the
 * Laravel API currently returns: the API's `StandingResource` / `BracketResource`
 * expose `{ id, name }` teams and no per-side knockout scores, while the mock
 * renders flags, codes and scores. The demo data layer enriches accordingly;
 * `lib/api/client.ts` types the raw (thinner) API responses and maps up to these.
 *
 * Source of truth for the contract: tournament-game-api
 *   GET /api/groups/{group}/standings   → StandingRow[]
 *   GET /api/stages/{stage}/bracket      → Bracket
 *   PUT /api/matches/{fixture}/result    → StandingRow[] | Bracket
 */

export type ResultLetter = "W" | "D" | "L";

export type FixtureStatus = "scheduled" | "live" | "finished";

/** ResolvedTie.status from the domain, plus a UI-only `live` overlay. */
export type TieStatus = "pending" | "ready" | "decided" | "live";

export type TournamentStatus = "draft" | "active" | "finished";

export interface Team {
  id: number;
  name: string;
  /** Three-letter code, e.g. "BRA". Demo-enriched. */
  code?: string;
  /** Emoji flag, e.g. "🇧🇷". Demo-enriched; the mock's texture. */
  flag?: string;
}

/** One row of a group table — mirrors StandingResource (camelCased). */
export interface StandingRow {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ResultLetter[];
  qualified: boolean;
}

export interface Group {
  id: number;
  name: string; // "A", "B", ...
  qualifyCount: number;
  standings: StandingRow[];
  /** Optional human note explaining the current tiebreak situation. */
  tiebreakNote?: TiebreakNote;
}

export interface TiebreakNote {
  teams: string[];
  points: number;
  /** Rich sentence fragments the Overview renders with emphasis. */
  detail: string;
}

/** One side of a knockout tie. `team: null` = still to be defined. */
export interface TieSide {
  team: Team | null;
  /** Shown when the slot is sourced but unresolved, e.g. "Vencedor QF2". */
  placeholder?: string;
  score: number | null;
  penalties?: number | null;
}

/** A resolved knockout tie — mirrors ResolvedTie, enriched for display. */
export interface BracketTie {
  id: number;
  round: number;
  slot: number;
  status: TieStatus;
  home: TieSide;
  away: TieSide;
  winnerId: number | null;
  decidedByPenalties: boolean;
  /** Display kickoff, e.g. "Sáb 21:00". */
  kickoff?: string;
  /** Present only when status === "live". */
  liveMinute?: number;
}

export interface Bracket {
  stageId: number;
  champion: Team | null;
  ties: BracketTie[];
}

/** A single match (used by the Overview and Console). */
export interface Fixture {
  id: number;
  home: Team;
  away: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: FixtureStatus;
  kickoff?: string;
  liveMinute?: number;
  groupName?: string;
  /** e.g. "decide a liderança". */
  note?: string;
  version: number;
}

export interface PhasePill {
  key: string;
  label: string;
  state: "done" | "now" | "todo";
}

export interface TournamentMeta {
  id: number;
  name: string;
  status: TournamentStatus;
  /** e.g. "Fase de grupos · Rodada 2 de 3". */
  phaseLabel: string;
  phases: PhasePill[];
}

export interface OverviewStat {
  value: string;
  label: string;
}

/** Everything the Overview needs in one payload. */
export interface OverviewData {
  featuredGroup: Group;
  liveFixture: Fixture | null;
  nextFixture: Fixture | null;
  stats: OverviewStat[];
}
