"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { BracketTie, Team } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";
import { TieRow } from "./TieRow";
import { useTieEditor, tieIsEditable, type TieRowState } from "./useTieEditor";

function advancing(tie: BracketTie, row: TieRowState | undefined): Team | null {
  if (!tieIsEditable(tie) || !row) return null;
  if (row.home > row.away) return tie.home.team;
  if (row.away > row.home) return tie.away.team;
  if (row.homePen > row.awayPen) return tie.home.team;
  if (row.awayPen > row.homePen) return tie.away.team;
  return null;
}

export function RoundEditor({
  label,
  ties,
  onSaved,
  readOnly = false,
}: {
  label: string;
  ties: BracketTie[];
  onSaved?: () => void;
  readOnly?: boolean;
}) {
  const editor = useTieEditor(ties);

  useEffect(() => {
    if (editor.savedNonce === 0) return;
    onSaved?.();
  }, [editor.savedNonce, onSaved]);

  const ready = ties.filter(tieIsEditable).length;
  const pending = ties.length - ready;

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
          <span>{label}</span>
          <span className="text-ink-dim">·</span>
          <span className="text-ink-dim">{ties.length} matches</span>
        </div>

        <div className="flex flex-col gap-1">
          {ties.map((tie) => (
            <TieRow
              key={tie.id}
              tie={tie}
              row={editor.rows[tie.id]}
              authed={editor.authed}
              readOnly={readOnly}
              onScore={(side, value) => editor.setScore(tie.id, side, value)}
              onPenalty={(side, value) => editor.setPenalty(tie.id, side, value)}
            />
          ))}
        </div>

        {pending > 0 && (
          <p className="mt-4 flex items-start gap-2 rounded-md border border-dashed border-line-2 px-3.5 py-2.5 text-[12px] leading-[1.45] text-ink-mute">
            <span aria-hidden="true">◷</span>
            <span>
              {pending} match{pending > 1 ? "es" : ""} still waiting on the previous round — decide
              those first and the teams drop in here.
            </span>
          </p>
        )}

        {editor.authed && ready > 0 && (
          <p className="mt-3 flex items-start gap-2 rounded-md border border-dashed border-line-2 px-3.5 py-2.5 text-[12px] leading-[1.45] text-ink-mute">
            <span aria-hidden="true">⛓</span>
            <span>
              A level tie is settled on <b className="font-semibold text-ink-dim">penalties</b>. Each
              result saves on its own and the winner advances{" "}
              <b className="font-semibold text-ink-dim">automatically</b>.
            </span>
          </p>
        )}
      </div>

      <div className="min-w-0 px-5 pt-2 pb-6 sm:px-6">
        <p className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
          ◆ Consequence · {label}
        </p>
        <p className="mb-4 text-[12.5px] text-ink-mute">Who advances from the results so far.</p>

        <div className="overflow-hidden rounded-md border border-line bg-surface">
          {ties.map((tie) => {
            const winner = advancing(tie, editor.rows[tie.id]);
            return (
              <div
                key={tie.id}
                className={[
                  "flex items-center gap-3 border-t border-t-line border-l-2 px-4 py-3 first:border-t-0",
                  winner ? "border-l-amber" : "border-l-transparent",
                ].join(" ")}
              >
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink-dim">
                  {tie.home.team?.name ?? tie.home.placeholder ?? "TBD"}
                  <span className="px-1.5 text-ink-mute">v</span>
                  {tie.away.team?.name ?? tie.away.placeholder ?? "TBD"}
                </span>
                {winner ? (
                  <span className="flex shrink-0 items-center gap-2 text-[14px] font-semibold text-ink">
                    <Flag team={winner} className="text-[16px]" />
                    <span className="truncate">{winner.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-win">
                      advances
                    </span>
                  </span>
                ) : (
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                    to be decided
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
