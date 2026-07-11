"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { FixtureDetail, GroupDetail } from "@/lib/types";
import { matchDecidesQualification } from "@/lib/console";
import { useGroupEditor } from "./useGroupEditor";
import { useGroupOutlook } from "./useGroupOutlook";
import { FixtureRow } from "./FixtureRow";
import { ConsequenceTable } from "./ConsequenceTable";

export function GroupEditor({ group, onSaved }: { group: GroupDetail; onSaved?: () => void }) {
  const editor = useGroupEditor(group);

  useEffect(() => {
    if (editor.savedNonce === 0) return;
    onSaved?.();
  }, [editor.savedNonce, onSaved]);

  const outlookKey = `${group.id}:${editor.remainingPairs.length}:${editor.livePlayed
    .map((m) => `${m.homeId}.${m.homeScore}:${m.awayScore}.${m.awayId}`)
    .join("_")}`;
  const forecast = useGroupOutlook({
    key: outlookKey,
    teams: group.teams,
    played: editor.livePlayed,
    remaining: editor.remainingPairs,
    qualifyCount: group.qualifyCount,
  });
  const preview = forecast
    ? editor.preview.map((row) => ({
        ...row,
        outlook: forecast.outlook.get(row.team.id),
        advanceProb: forecast.advanceProb.get(row.team.id),
      }))
    : editor.preview;

  const decisiveFor = (fixture: FixtureDetail): boolean => {
    const row = editor.rows[fixture.id];
    const changed = row && (row.home !== row.savedHome || row.away !== row.savedAway);
    if (row?.finished || changed) return false;
    return matchDecidesQualification(
      forecast?.outlook ?? null,
      fixture.home?.id,
      fixture.away?.id,
    );
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-0">
      <div className="min-w-0 lg:border-r lg:border-line lg:pr-8">
        {!editor.authed && (
          <Link
            href="/login?from=/console"
            className="mb-3.5 flex items-center justify-between rounded-md border border-amber-line bg-amber-soft px-3.5 py-2.5 text-[13px] font-semibold text-amber-ink transition-colors hover:brightness-110"
          >
            <span>Sign in to save results</span>
            <span aria-hidden="true">→</span>
          </Link>
        )}

        <div className="mb-2.5 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
          <span>Group {group.name}</span>
          <span className="text-ink-dim">·</span>
          <span className="text-ink-dim">{editor.fixtures.length} matches</span>
        </div>

        <div className="flex flex-col gap-1">
          {editor.fixtures.map((fixture) => (
            <FixtureRow
              key={fixture.id}
              fixture={fixture}
              row={editor.rows[fixture.id]}
              authed={editor.authed}
              decisive={decisiveFor(fixture)}
              onChange={(side, value) => editor.setScore(fixture.id, side, value)}
            />
          ))}
        </div>

        {editor.authed && (
          <p className="mt-4 flex items-start gap-2 rounded-md border border-dashed border-line-2 px-3.5 py-2.5 text-[12px] leading-[1.45] text-ink-mute">
            <span aria-hidden="true">⛓</span>
            <span>
              Each result saves on its own the moment you stop adjusting — standings, tiebreaks and
              knockout slots recalculate <b className="font-semibold text-ink-dim">atomically</b>.
            </span>
          </p>
        )}
      </div>

      <ConsequenceTable
        groupName={group.name}
        dirty={editor.dirty}
        base={editor.base}
        preview={preview}
        previewKey={editor.previewKey}
      />
    </div>
  );
}
