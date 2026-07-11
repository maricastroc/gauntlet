"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Bracket, BracketTie, GroupDetail } from "@/lib/types";
import { shortRound } from "@/lib/format";
import { useAuth } from "@/lib/auth/context";
import { CascadeTimeline } from "@/components/whatif/CascadeTimeline";
import { GroupEditor } from "./GroupEditor";
import { RoundEditor } from "./RoundEditor";
import { useResultCascade } from "./useResultCascade";

type Section =
  | { kind: "group"; key: string; label: string; group: GroupDetail }
  | { kind: "round"; key: string; label: string; ties: BracketTie[] };

function knockoutSections(bracket: Bracket): Section[] {
  if (!bracket.ties.length) return [];
  const maxRound = Math.max(...bracket.ties.map((tie) => tie.round), 1);
  const byRound = new Map<number, BracketTie[]>();
  for (const tie of bracket.ties) {
    const list = byRound.get(tie.round) ?? [];
    list.push(tie);
    byRound.set(tie.round, list);
  }
  return [...byRound.keys()]
    .sort((a, b) => a - b)
    .map((round) => ({
      kind: "round" as const,
      key: `r${round}`,
      label: shortRound(round, maxRound),
      ties: (byRound.get(round) ?? []).sort((a, b) => a.slot - b.slot),
    }));
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
        {sections.map((section) => {
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

  const selected = sections.find((section) => section.key === selectedKey) ?? sections[0];

  return (
    <div className="px-5 pt-2 sm:px-6">
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
        <GroupEditor key={selected.key} group={selected.group} onSaved={handleGroupSaved} />
      ) : (
        <RoundEditor
          key={selected.key}
          label={selected.label}
          ties={selected.ties}
          onSaved={handleRoundSaved}
        />
      )}
    </div>
  );
}
