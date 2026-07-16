import { computeStandings, type RawMatch } from "@/lib/standings";
import type { QualificationOutlook, Team } from "@/lib/types";
import { hashString, mulberry32 } from "./rng";
import { calibrate, ratingsFromMatches, sampleScore, type Calibration } from "./model";

export interface GroupForecast {
  advanceProb: Map<number, number>;
  outlook: Map<number, QualificationOutlook>;
}

export interface GroupSim {
  key: string;
  teams: Team[];
  played: RawMatch[];
  remaining: Array<[number, number]>;
  qualifyCount: number;
  /** Optional scoring calibration; when omitted it is fit from this group's played matches. */
  calibration?: Calibration;
}

const RUNS = 4000;

export function forecastGroup(group: GroupSim): GroupForecast {
  const ratings = ratingsFromMatches(group.teams, group.played);
  const calibration = group.calibration ?? calibrate(group.played);
  const rng = mulberry32(hashString(group.key));
  const counts = new Map<number, number>();
  for (const team of group.teams) counts.set(team.id, 0);

  for (let run = 0; run < RUNS; run++) {
    const sampled = group.remaining.map<RawMatch>(([homeId, awayId]) => {
      const [homeScore, awayScore] = sampleScore(
        rng,
        ratings.get(homeId) ?? 0,
        ratings.get(awayId) ?? 0,
        calibration,
      );
      return { homeId, awayId, homeScore, awayScore };
    });

    const rows = computeStandings(group.teams, [...group.played, ...sampled], group.qualifyCount);
    for (let i = 0; i < group.qualifyCount && i < rows.length; i++) {
      counts.set(rows[i].team.id, (counts.get(rows[i].team.id) ?? 0) + 1);
    }
  }

  const advanceProb = new Map<number, number>();
  const outlook = new Map<number, QualificationOutlook>();
  for (const team of group.teams) {
    const prob = (counts.get(team.id) ?? 0) / RUNS;
    advanceProb.set(team.id, prob);
    outlook.set(team.id, prob >= 0.999 ? "clinched" : prob <= 0.001 ? "eliminated" : "contending");
  }
  return { advanceProb, outlook };
}
