"use client";

import { useState } from "react";
import type { GroupDetail } from "@/lib/types";
import { GroupEditor } from "./GroupEditor";

export function ConsoleScreen({ groups }: { groups: GroupDetail[] }) {
  const editable = groups.filter((group) => group.fixtures.some((f) => f.home && f.away));
  const [selectedName, setSelectedName] = useState(editable[0]?.name ?? "");

  if (editable.length === 0) {
    return (
      <div className="px-5 pt-2 sm:px-6">
        <div className="rounded-md border border-dashed border-line-2 px-6 py-12 text-center text-[14px] text-ink-mute">
          This tournament has no group fixtures to edit yet.
        </div>
      </div>
    );
  }

  const group = editable.find((g) => g.name === selectedName) ?? editable[0];

  return (
    <div className="px-5 pt-2 sm:px-6">
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
        Group
      </div>
      <div className="flex flex-wrap gap-2">
        {editable.map((option) => {
          const active = option.name === group.name;
          return (
            <button
              key={option.name}
              type="button"
              onClick={() => setSelectedName(option.name)}
              className={[
                "rounded-md border px-3.5 py-1.5 font-mono text-[12px] tracking-[0.06em] transition-colors",
                active
                  ? "border-amber bg-amber font-bold text-[#1a1205]"
                  : "border-line-2 text-ink-dim hover:border-amber-line hover:text-ink",
              ].join(" ")}
            >
              {option.name}
            </button>
          );
        })}
      </div>

      <GroupEditor key={group.name} group={group} />
    </div>
  );
}
