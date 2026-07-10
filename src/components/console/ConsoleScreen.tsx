"use client";

import { useState } from "react";
import type { FixtureDetail, GroupDetail } from "@/lib/types";
import { Select } from "@/components/ui/Select";
import { useFixtureResult } from "./useFixtureResult";
import { ResultEditor } from "./ResultEditor";
import { ConsequenceTable } from "./ConsequenceTable";

export function ConsoleScreen({ groups }: { groups: GroupDetail[] }) {
  const fixtures = groups.flatMap((group) =>
    group.fixtures
      .filter((fixture) => fixture.home && fixture.away)
      .map((fixture) => ({ fixture, group })),
  );

  const [selectedId, setSelectedId] = useState<number | null>(fixtures[0]?.fixture.id ?? null);

  if (fixtures.length === 0) {
    return (
      <div className="px-5 pt-2 sm:px-6">
        <div className="rounded-md border border-dashed border-line-2 px-6 py-12 text-center text-[14px] text-ink-mute">
          This tournament has no group fixtures to edit yet.
        </div>
      </div>
    );
  }

  const selected = fixtures.find((f) => f.fixture.id === selectedId) ?? fixtures[0];

  const matchSelect = (
    <div>
      <span className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
        Match
      </span>
      <Select
        value={String(selected.fixture.id)}
        onValueChange={(next) => setSelectedId(Number(next))}
        ariaLabel="Match"
        triggerClassName="w-full"
        items={fixtures.map(({ fixture, group }) => ({
          value: String(fixture.id),
          label: `Group ${group.name}: ${fixture.home?.name} vs ${fixture.away?.name}${
            fixture.status === "finished" ? ` (${fixture.homeScore}–${fixture.awayScore})` : ""
          }`,
        }))}
      />
    </div>
  );

  return (
    <FixtureConsole
      key={selected.fixture.id}
      fixture={selected.fixture}
      group={selected.group}
      matchSelect={matchSelect}
    />
  );
}

function FixtureConsole({
  fixture,
  group,
  matchSelect,
}: {
  fixture: FixtureDetail;
  group: GroupDetail;
  matchSelect: React.ReactNode;
}) {
  const result = useFixtureResult(fixture, group);

  return (
    <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:gap-y-0">
      <div className="min-w-0 px-5 pt-2 pb-6 sm:px-6 lg:border-r lg:border-line">
        {matchSelect}
        <ResultEditor fixture={fixture} result={result} />
      </div>
      <ConsequenceTable
        groupName={group.name}
        dirty={result.dirty}
        base={result.base}
        preview={result.preview}
        previewKey={`${result.home}-${result.away}`}
      />
    </div>
  );
}
