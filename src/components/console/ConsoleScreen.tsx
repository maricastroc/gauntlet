"use client";

import { useMemo, useState } from "react";
import type { ConsoleScenario } from "@/lib/data";
import type { StandingRow } from "@/lib/types";
import { computeStandings, type RawMatch } from "@/lib/standings";
import { formatGoalDifference, ordinal } from "@/lib/format";
import { Flag } from "@/components/ui/Flag";
import { Stepper } from "./Stepper";

type Status = "first_half" | "halftime" | "finished";

const STATUS_OPTIONS: Array<{ key: Status; label: string }> = [
  { key: "first_half", label: "1st half" },
  { key: "halftime", label: "Half-time" },
  { key: "finished", label: "Full-time" },
];

interface Snapshot {
  home: number;
  away: number;
  status: Status;
}

interface Move {
  dir: "up" | "down" | "none";
  text: string;
}

/** Replace the edited fixture in the match list; drop it while not finished. */
function projectMatches(scenario: ConsoleScenario, snap: Snapshot): RawMatch[] {
  return scenario.matches.flatMap((match, index) => {
    if (index !== scenario.editableIndex) return [match];
    if (snap.status !== "finished") return []; // unfinished → not yet counted
    return [{ ...match, homeScore: snap.home, awayScore: snap.away }];
  });
}

function describeMove(base: StandingRow | undefined, next: StandingRow): Move {
  if (!base) return { dir: "none", text: "—" };
  if (next.position < base.position) {
    return { dir: "up", text: `${ordinal(base.position)} → ${ordinal(next.position)}` };
  }
  if (next.position > base.position) {
    return { dir: "down", text: `${ordinal(base.position)} → ${ordinal(next.position)}` };
  }
  if (next.goalDifference !== base.goalDifference) {
    const dir = next.goalDifference > base.goalDifference ? "up" : "down";
    return {
      dir,
      text: `GD ${formatGoalDifference(base.goalDifference)}→${formatGoalDifference(next.goalDifference)}`,
    };
  }
  if (next.points !== base.points) {
    const dir = next.points > base.points ? "up" : "down";
    return { dir, text: `${base.points}→${next.points} pts` };
  }
  return { dir: "none", text: `held ${ordinal(next.position)}` };
}

export function ConsoleScreen({ scenario }: { scenario: ConsoleScenario }) {
  const initial: Snapshot = {
    home: scenario.matches[scenario.editableIndex].homeScore,
    away: scenario.matches[scenario.editableIndex].awayScore,
    status: "finished",
  };

  const [draft, setDraft] = useState<Snapshot>(initial);
  const [committed, setCommitted] = useState<Snapshot>(initial);
  const [justSaved, setJustSaved] = useState(false);

  const baseStandings = useMemo(
    () => computeStandings(scenario.teams, projectMatches(scenario, committed), scenario.qualifyCount),
    [scenario, committed],
  );
  const previewStandings = useMemo(
    () => computeStandings(scenario.teams, projectMatches(scenario, draft), scenario.qualifyCount),
    [scenario, draft],
  );

  const baseById = useMemo(
    () => new Map(baseStandings.map((row) => [row.team.id, row])),
    [baseStandings],
  );

  const dirty =
    draft.home !== committed.home ||
    draft.away !== committed.away ||
    draft.status !== committed.status;

  const rows = previewStandings.map((row) => ({
    row,
    move: describeMove(baseById.get(row.team.id), row),
  }));

  const patch = (next: Partial<Snapshot>) => {
    setDraft((prev) => ({ ...prev, ...next }));
    setJustSaved(false);
  };

  const confirm = () => {
    setCommitted(draft);
    setJustSaved(true);
  };

  return (
    <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:gap-y-0">
      {/* ---------------- left: register a result ---------------- */}
      <div className="min-w-0 px-5 pb-6 pt-2 sm:px-6 lg:border-r lg:border-line">
        <p className="eyebrow mb-4">Register a result</p>

        <div className="mb-4 flex items-center justify-center gap-4 rounded-[11px] border border-line bg-surface-2 p-5">
          <TeamStepper
            flag={scenario.home.flag}
            name={scenario.home.name}
            value={draft.home}
            onChange={(home) => patch({ home })}
          />
          <span className="font-mono text-[14px] text-ink-mute">×</span>
          <TeamStepper
            flag={scenario.away.flag}
            name={scenario.away.name}
            value={draft.away}
            onChange={(away) => patch({ away })}
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
            Status
          </label>
          <div className="flex gap-1.5">
            {STATUS_OPTIONS.map((option) => {
              const selected = draft.status === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => patch({ status: option.key })}
                  aria-pressed={selected}
                  className={[
                    "flex-1 rounded-[7px] border px-2 py-2.5 text-[12.5px] transition-colors duration-150",
                    selected
                      ? "border-line-2 bg-surface-3 text-ink"
                      : "border-line bg-surface-2 text-ink-mute hover:text-ink-dim",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={confirm}
          disabled={!dirty}
          className="flex w-full items-center justify-center gap-2 rounded-[11px] bg-amber px-4 py-3.5 text-[14px] font-bold text-[#1a1205] shadow-[0_8px_22px_-8px_rgba(242,169,59,0.6)] transition-all duration-150 enabled:hover:brightness-105 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          Confirm result
        </button>

        <p className="mt-3 text-center font-mono text-[11.5px] tracking-[0.02em] text-ink-mute">
          {justSaved ? (
            <span className="text-win">✓ saved atomically · version {scenario.version + 1}</span>
          ) : dirty ? (
            <>
              was {committed.home} – {committed.away} · changed to {draft.home} – {draft.away}
            </>
          ) : (
            <>no pending changes</>
          )}
        </p>

        <div className="mt-5 flex gap-2.5 rounded-[11px] border border-dashed border-line-2 px-3.5 py-3 text-[12.5px] leading-[1.45] text-ink-mute">
          <span aria-hidden="true">⛓</span>
          <p>
            <b className="font-semibold text-ink-dim">Atomic</b> recalculation: standings,
            tiebreaks and knockout slots are rewritten in a single transaction —{" "}
            <code className="font-mono text-[12px] text-amber-ink">
              the table is never left in a partial state
            </code>
            .
          </p>
        </div>
      </div>

      {/* ---------------- right: the consequence ---------------- */}
      <div className="min-w-0 bg-gradient-to-b from-amber/[0.03] to-transparent px-5 pb-6 pt-2 sm:px-6">
        <p className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
          ◆ Consequence of the edit
        </p>
        <p className="mb-4 text-[12.5px] text-ink-mute">
          {dirty
            ? `Group ${scenario.groupName} is reordered on confirm. Preview before saving:`
            : `Group ${scenario.groupName} — current standings saved.`}
        </p>

        <div
          key={`${draft.home}-${draft.away}-${draft.status}`}
          className="overflow-hidden rounded-[11px] border border-line bg-surface motion-safe:animate-rise"
        >
          {rows.map(({ row, move }) => (
            <div
              key={row.team.id}
              className={[
                "grid grid-cols-[26px_1fr_auto_auto] items-center gap-3 border-t border-line px-4 py-3 tabular-nums first:border-t-0",
                move.dir === "up" && "bg-win/[0.05]",
                move.dir === "down" && "bg-loss/[0.05]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="font-mono text-[13px] text-ink-mute">{row.position}</span>
              <span className="flex items-center gap-2.5 text-[14px] font-semibold">
                <Flag team={row.team} className="text-[17px]" />
                <span className="truncate">{row.team.name}</span>
              </span>
              <span
                className={[
                  "flex items-center gap-1 font-mono text-[12px]",
                  move.dir === "up"
                    ? "text-win"
                    : move.dir === "down"
                      ? "text-loss"
                      : "text-ink-mute",
                ].join(" ")}
              >
                {move.dir === "up" && "▲"}
                {move.dir === "down" && "▼"}
                {move.text}
              </span>
              <span className="font-mono text-[14px] font-bold text-ink">{row.points}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-mute">
            Audit log
          </div>
          <AuditItem active={dirty} time="now">
            {dirty ? (
              <>
                Preview generated —{" "}
                <b className="text-ink">
                  {scenario.home.name} {draft.home} – {draft.away} {scenario.away.name}
                </b>{" "}
                · standings recalculated
              </>
            ) : (
              <>
                Result saved —{" "}
                <b className="text-ink">
                  {scenario.home.name} {committed.home} – {committed.away} {scenario.away.name}
                </b>
              </>
            )}
          </AuditItem>
          <AuditItem time="11:47" muted>
            Original result lodged — {scenario.home.name} {initial.home} – {initial.away}{" "}
            {scenario.away.name}
          </AuditItem>
          <AuditItem time="10:12" muted>
            Japan 2 – 1 Morocco confirmed
          </AuditItem>
        </div>
      </div>
    </div>
  );
}

function TeamStepper({
  flag,
  name,
  value,
  onChange,
}: {
  flag?: string;
  name: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex w-[92px] flex-col items-center gap-2">
      <span className="text-[30px] leading-none" aria-hidden="true">
        {flag}
      </span>
      <span className="text-center text-[13px] font-semibold">{name}</span>
      <Stepper value={value} onChange={onChange} label={name} />
    </div>
  );
}

function AuditItem({
  time,
  children,
  active = false,
  muted = false,
}: {
  time: string;
  children: React.ReactNode;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3 py-1.5 text-[12.5px] text-ink-dim">
      <span className="w-11 flex-none font-mono text-[11px] text-ink-mute">{time}</span>
      <span
        className={[
          "h-1.5 w-1.5 flex-none -translate-y-px rounded-full",
          active ? "bg-amber" : "bg-ink-mute",
        ].join(" ")}
      />
      <span className={muted ? "text-ink-mute" : undefined}>{children}</span>
    </div>
  );
}
