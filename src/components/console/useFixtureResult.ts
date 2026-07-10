"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FixtureDetail, GroupDetail } from "@/lib/types";
import { computeStandings } from "@/lib/standings";
import { groupRawMatches } from "@/lib/console";
import { api, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";

export function useFixtureResult(fixture: FixtureDetail, group: GroupDetail) {
  const { status, token } = useAuth();
  const router = useRouter();
  const authed = status === "authed" && token !== null;

  const [home, setHome] = useState(fixture.homeScore ?? 0);
  const [away, setAway] = useState(fixture.awayScore ?? 0);
  const [version, setVersion] = useState(fixture.version);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = home !== (fixture.homeScore ?? 0) || away !== (fixture.awayScore ?? 0);
  const dirty = fixture.status !== "finished" || changed;

  const base = computeStandings(group.teams, groupRawMatches(group), group.qualifyCount);
  const preview = computeStandings(
    group.teams,
    groupRawMatches(group, { id: fixture.id, home, away }),
    group.qualifyCount,
  );

  async function confirm() {
    if (!authed || !token) return;
    setSaving(true);
    setError(null);
    try {
      await api.submitGroupResult(token, fixture.id, {
        home_score: home,
        away_score: away,
        expected_version: version,
      });
      setVersion((v) => v + 1);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.displayMessage : "Could not reach the API.");
    } finally {
      setSaving(false);
    }
  }

  return {
    authed,
    home,
    away,
    setHome,
    setAway,
    version,
    saving,
    saved,
    error,
    dirty,
    base,
    preview,
    confirm,
  };
}
