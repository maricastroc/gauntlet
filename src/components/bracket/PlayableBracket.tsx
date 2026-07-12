"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Bracket as BracketData, BracketTie, Team } from "@/lib/types";
import { roundName, roundTag } from "@/lib/format";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";
import { notifyApiError } from "@/lib/toast";
import { useAuth } from "@/lib/auth/context";
import { useCanManage } from "@/lib/tournament/useCanManage";
import { ReadOnlyBanner } from "@/components/ui/ReadOnlyBanner";
import {
  childOf,
  resolveBracket,
  resolvedSide,
  type TieResult,
  type TieResults,
} from "@/lib/knockout";
import { Flag } from "@/components/ui/Flag";
import { Bracket } from "./Bracket";
import { MatchCard } from "./MatchCard";
import { ChampionCard } from "./ChampionCard";
import { TieEditor, type Consequence } from "./TieEditor";

export function PlayableBracket({
  initial,
  tournamentId,
}: {
  initial: BracketData;
  tournamentId: number;
}) {
  const { status, token } = useAuth();
  const router = useRouter();
  const canManage = useCanManage(tournamentId);
  const readOnly = canManage === false;
  const authed = status === "authed" && token !== null;

  const base = useMemo(() => initial.ties, [initial.ties]);

  const live = useMemo(() => base.some((tie) => tie.fixtureId != null), [base]);

  const [results, setResults] = useState<TieResults>(new Map());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const { ties, champion } = useMemo(
    () => (live ? { ties: base, champion: initial.champion } : resolveBracket(base, results)),
    [live, base, initial.champion, results],
  );
  const maxRound = Math.max(...ties.map((tie) => tie.round), 1);

  const selected = selectedId === null ? null : (ties.find((tie) => tie.id === selectedId) ?? null);
  const playableSelected = selected && selected.home.team && selected.away.team ? selected : null;

  function describe(tie: BracketTie, result: TieResult): Consequence | null {
    const side = resolvedSide(result);
    if (!side || !tie.home.team || !tie.away.team) return null;
    const winner = side === "home" ? tie.home.team : tie.away.team;

    const child = childOf(tie);
    const childTie = ties.find((t) => t.round === child.round && t.slot === child.slot);
    if (!childTie) return { winner, isFinal: true, nextRound: null, opponent: null };

    const opponent = child.side === "home" ? childTie.away.team : childTie.home.team;
    return { winner, isFinal: false, nextRound: roundName(child.round, maxRound), opponent };
  }

  function nextReadyId(list: BracketTie[]): number | null {
    const next = list
      .filter((tie) => tie.status === "ready" && tie.home.team && tie.away.team)
      .sort((a, b) => a.round - b.round || a.slot - b.slot || a.id - b.id)[0];
    return next?.id ?? null;
  }

  function penaltiesFor(result: TieResult): { home: number | null; away: number | null } {
    const drawn = result.home === result.away;
    return {
      home: drawn ? (result.homePenalties ?? null) : null,
      away: drawn ? (result.awayPenalties ?? null) : null,
    };
  }

  async function confirmLive(tie: BracketTie, result: TieResult) {
    if (!authed || !token) {
      toast.error("Sign in as the organizer to save knockout results.");
      return;
    }
    if (tie.fixtureId == null) return;

    setSaving(true);
    const pens = penaltiesFor(result);
    try {
      const updated = await api.submitKnockoutResult(token, tie.fixtureId, {
        home_score: result.home,
        away_score: result.away,
        home_penalties: pens.home,
        away_penalties: pens.away,
        expected_version: tie.version ?? 0,
      });
      router.refresh();
      setSelectedId(nextReadyId(updated.ties));
    } catch (err) {
      notifyApiError(err);
    } finally {
      setSaving(false);
    }
  }

  function confirmDemo(result: TieResult) {
    if (selectedId === null) return;
    const nextResults = new Map(results).set(selectedId, result);
    setResults(nextResults);
    setSelectedId(nextReadyId(resolveBracket(base, nextResults).ties));
  }

  function confirm(result: TieResult) {
    if (!playableSelected) return;
    if (live) void confirmLive(playableSelected, result);
    else confirmDemo(result);
  }

  return (
    <div>
      {readOnly && (
        <div className="px-5 pt-4 sm:px-6">
          <ReadOnlyBanner />
        </div>
      )}
      {champion && (
        <div className="px-5 pt-4 sm:px-6">
          <div className="motion-safe:animate-trophy flex flex-wrap items-center justify-center gap-2 rounded-md border border-gold/45 bg-linear-to-b from-gold/[0.14] to-surface-2 px-4 py-3 text-center">
            <span className="text-[20px]" aria-hidden="true">
              🏆
            </span>
            <span className="flex items-center gap-2 font-serif text-[16px] text-ink">
              <Flag team={champion} className="text-[18px]" />
              {champion.name} win the tournament
            </span>
          </div>
        </div>
      )}

      {playableSelected && (
        <div className="px-5 pt-4 sm:px-6">
          <TieEditor
            key={playableSelected.id}
            tie={playableSelected}
            roundLabel={`${roundName(playableSelected.round, maxRound)} · ${roundTag(
              playableSelected.round,
              maxRound,
              playableSelected.slot,
            )}`}
            initial={results.get(playableSelected.id)}
            busy={saving}
            describe={(result) => describe(playableSelected, result)}
            onConfirm={confirm}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}

      <Bracket
        data={{ ...initial, ties, champion }}
        renderCard={(tie) => (
          <MatchCard
            tie={tie}
            interactive={!readOnly}
            selected={tie.id === selectedId}
            onSelect={readOnly ? undefined : () => setSelectedId(tie.id)}
          />
        )}
        championSlot={<ChampionSlot champion={champion} />}
      />
    </div>
  );
}

function ChampionSlot({ champion }: { champion: Team | null }) {
  return (
    <div className={champion ? "motion-safe:animate-trophy rounded-md" : undefined}>
      <ChampionCard champion={champion} />
    </div>
  );
}
