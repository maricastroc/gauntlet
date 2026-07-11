export type ResultLetter = "W" | "D" | "L";

export type QualificationOutlook = "clinched" | "eliminated" | "contending";

export type FixtureStatus = "scheduled" | "live" | "finished";

export type TieStatus = "pending" | "ready" | "decided" | "live";

export type TournamentStatus = "draft" | "active" | "finished";

export interface Team {
  id: number;
  name: string;
  code?: string;
  flag?: string;
}

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
  advanceProb?: number;
  outlook?: QualificationOutlook;
}

export interface Group {
  id: number;
  name: string;
  qualifyCount: number;
  standings: StandingRow[];
  tiebreakNote?: TiebreakNote;
}

export interface TiebreakNote {
  teams: string[];
  points: number;
  detail: string;
}

export interface TieSide {
  team: Team | null;
  placeholder?: string;
  score: number | null;
  penalties?: number | null;
}

export interface BracketTie {
  id: number;
  round: number;
  slot: number;
  status: TieStatus;
  home: TieSide;
  away: TieSide;
  winnerId: number | null;
  decidedByPenalties: boolean;
  kickoff?: string;
  liveMinute?: number;
  fixtureId?: number;
  version?: number;
}

export interface Bracket {
  stageId: number;
  champion: Team | null;
  ties: BracketTie[];
}

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
  phaseLabel: string;
  phases: PhasePill[];
}

export interface OverviewStat {
  value: string;
  label: string;
}

export interface TitleOdd {
  team: Team;
  prob: number;
}

export interface FinalRecap {
  roundLabel: string;
  home: TieSide;
  away: TieSide;
  decidedByPenalties: boolean;
}

export interface RoadStep {
  roundLabel: string;
  opponent: Team;
  score: string;
}

export interface Superlative {
  label: string;
  team: Team;
  detail: string;
}

export interface OverviewRecap {
  final: FinalRecap | null;
  championRoad: RoadStep[];
  superlatives: Superlative[];
}

export interface OverviewData {
  featuredGroup: Group | null;
  liveFixture: Fixture | null;
  nextFixture: Fixture | null;
  stats: OverviewStat[];
  titleOdds: TitleOdd[];
  champion: Team | null;
  recap: OverviewRecap | null;
}

export interface TournamentSummary {
  id: number;
  name: string;
  status: TournamentStatus;
  teamsCount?: number;
  stagesCount?: number;
  createdAt?: string;
}

export interface FixtureDetail {
  id: number;
  tieId: number | null;
  home: Team | null;
  away: Team | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  status: FixtureStatus;
  version: number;
}

export interface GroupDetail {
  id: number;
  name: string;
  qualifyCount: number;
  teams: Team[];
  fixtures: FixtureDetail[];
}

export interface TieTopology {
  id: number;
  round: number;
  slot: number;
  homeSource: string;
  awaySource: string;
}

export interface StageDetail {
  id: number;
  type: "group" | "knockout";
  name: string;
  position: number;
  groups: GroupDetail[];
  ties: TieTopology[];
  fixtures: FixtureDetail[];
}

export interface TournamentDetail {
  id: number;
  name: string;
  status: TournamentStatus;
  canManage?: boolean;
  teams: Team[];
  stages: StageDetail[];
}

export interface GroupStageInput {
  qualifyCount: number;
  groups: Array<{ name: string; teamIds: number[] }>;
}

export interface ScenarioResult {
  fixtureId: number;
  homeScore: number;
  awayScore: number;
  homePenalties?: number | null;
  awayPenalties?: number | null;
}

export interface ScenarioProjection {
  groups: Array<{ id: number; name: string; qualifyCount: number; standings: StandingRow[] }>;
  bracket: Bracket | null;
}

export interface WhatIfFixture {
  id: number;
  phase: "group" | "knockout";
  // Short pill label for the match picker — the group letter, or the knockout round (e.g. "QF").
  phaseLabel: string;
  label: string;
  home: Team;
  away: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: FixtureStatus;
  isKnockout: boolean;
}

export interface WhatIfSetup {
  fixtures: WhatIfFixture[];
  baseline: ScenarioProjection;
}
