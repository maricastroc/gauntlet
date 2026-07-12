"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import type { Bracket, BracketTie, GroupDetail } from "@/lib/types";
import { shortRound } from "@/lib/format";
import { useAuth } from "@/lib/auth/context";
import { useCanManage } from "@/lib/tournament/useCanManage";
import { CascadeTimeline } from "@/components/whatif/CascadeTimeline";
import { ReadOnlyBanner } from "@/components/ui/ReadOnlyBanner";
import { GroupEditor } from "./GroupEditor";
import { RoundEditor } from "./RoundEditor";
import { useResultCascade } from "./useResultCascade";

type Section =
  | { kind: "group"; key: string; label: string; group: GroupDetail; locked: false }
  | { kind: "round"; key: string; label: string; ties: BracketTie[]; locked: boolean };

/**
 * Knockout rounds as selectable sections, locked to match the header: a round is
 * open once every earlier round is decided, and stays locked until then — so the
 * Console can never record a result for a round the tournament hasn't reached.
 */
function knockoutSections(bracket: Bracket): Section[] {
  if (!bracket.ties.length) return [];
  const maxRound = Math.max(...bracket.ties.map((tie) => tie.round), 1);
  const byRound = new Map<number, BracketTie[]>();
  for (const tie of bracket.ties) {
    const list = byRound.get(tie.round) ?? [];
    list.push(tie);
    byRound.set(tie.round, list);
  }

  let currentReached = false;
  return [...byRound.keys()]
    .sort((a, b) => a - b)
    .map((round) => {
      const ties = (byRound.get(round) ?? []).sort((a, b) => a.slot - b.slot);
      const complete = ties.every((tie) => tie.status === "decided");
      let locked = false;
      if (complete) {
        locked = false;
      } else if (!currentReached) {
        currentReached = true;
      } else {
        locked = true;
      }
      return { kind: "round" as const, key: `r${round}`, label: shortRound(round, maxRound), ties, locked };
    });
}

function TabRow({
  eyebrow,
  sections,
  selectedKey,
  onSelect,
}: {
  eyebrow: string;
  sections: Section[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
        {eyebrow}
      </div>
      <div className="flex flex-wrap gap-2">
        {sections.map((section, index) => {
          if (section.locked) {
            const prev = sections[index - 1];
            const hint = prev ? `Finish the ${prev.label} to unlock` : "Not reached yet";
            return (
              <span
                key={section.key}
                aria-disabled="true"
                data-tooltip-id="app-tooltip"
                data-tooltip-content={hint}
                className="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-line px-3.5 py-1.5 font-mono text-[12px] tracking-[0.06em] text-ink-mute/60"
              >
                <Lock className="h-3 w-3" aria-hidden="true" />
                {section.label}
              </span>
            );
          }
          const active = section.key === selectedKey;
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => onSelect(section.key)}
              className={[
                "rounded-md border px-3.5 py-1.5 font-mono text-[12px] tracking-[0.06em] transition-colors",
                active
                  ? "border-amber bg-amber font-bold text-[#1a1205]"
                  : "border-line-2 text-ink-dim hover:border-amber-line hover:text-ink",
              ].join(" ")}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ConsoleScreen({
  groups,
  bracket,
  tournamentId,
}: {
  groups: GroupDetail[];
  bracket: Bracket;
  tournamentId: number;
}) {
  const groupSections = useMemo<Section[]>(
    () =>
      groups
        .filter((group) => group.fixtures.some((f) => f.home && f.away))
        .map((group) => ({
          kind: "group" as const,
          key: `g:${group.name}`,
          label: group.name,
          group,
          locked: false as const,
        })),
    [groups],
  );
  const roundSections = useMemo(() => knockoutSections(bracket), [bracket]);
  const sections = useMemo(
    () => [...groupSections, ...roundSections],
    [groupSections, roundSections],
  );

  const [selectedKey, setSelectedKey] = useState(sections[0]?.key ?? "");

  const { status, token } = useAuth();
  const authed = status === "authed" && token !== null;
  const canManage = useCanManage(tournamentId);
  const readOnly = canManage === false;
  const router = useRouter();
  const { steps, nonce, report, dismiss } = useResultCascade(tournamentId, authed);

  const handleGroupSaved = useCallback(() => {
    router.refresh();
    report();
  }, [router, report]);

  const handleRoundSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  if (sections.length === 0) {
    return (
      <div className="px-5 pt-2 sm:px-6">
        <div className="rounded-md border border-dashed border-line-2 px-6 py-12 text-center text-[14px] text-ink-mute">
          This tournament has no fixtures to edit yet.
        </div>
      </div>
    );
  }

  const openSections = sections.filter((section) => !section.locked);
  const selected =
    openSections.find((section) => section.key === selectedKey) ?? openSections[0] ?? sections[0];

  return (
    <div className="px-5 pt-2 sm:px-6">
      {readOnly && <ReadOnlyBanner />}
      <CascadeTimeline
        key={nonce}
        steps={steps}
        title="What your result caused"
        onDismiss={dismiss}
      />

      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
        {groupSections.length > 0 && (
          <TabRow
            eyebrow="Group"
            sections={groupSections}
            selectedKey={selected.key}
            onSelect={setSelectedKey}
          />
        )}
        {roundSections.length > 0 && (
          <TabRow
            eyebrow="Knockout"
            sections={roundSections}
            selectedKey={selected.key}
            onSelect={setSelectedKey}
          />
        )}
      </div>

      {selected.kind === "group" ? (
        <GroupEditor
          key={selected.key}
          group={selected.group}
          onSaved={handleGroupSaved}
          readOnly={readOnly}
        />
      ) : (
        <RoundEditor
          key={selected.key}
          label={selected.label}
          ties={selected.ties}
          onSaved={handleRoundSaved}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
