import { useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import type { Team } from "@/lib/types";
import { distribute, groupOptions, qualifyOptions, GROUP_LETTERS } from "@/lib/tournament/draft";
import { Field, Segmented, StepCard, WizardButton } from "./wizard";

interface GroupsStepProps {
  teams: Team[];
  numGroups: number;
  setNumGroups: (n: number) => void;
  qualifyCount: number;
  setQualifyCount: (n: number) => void;
  busy: boolean;
  onSubmit: (groups: number[][]) => void;
}

function swapTeams(groups: number[][], a: number, b: number): number[][] {
  return groups.map((ids) => ids.map((id) => (id === a ? b : id === b ? a : id)));
}

export function GroupsStep({
  teams,
  numGroups,
  setNumGroups,
  qualifyCount,
  setQualifyCount,
  busy,
  onSubmit,
}: GroupsStepProps) {
  const [groups, setGroups] = useState(() => distribute(teams, numGroups));
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(Number(active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (over && active.id !== over.id) {
      setGroups((current) => swapTeams(current, Number(active.id), Number(over.id)));
    }
  }

  const activeTeam = teams.find((t) => t.id === activeId);

  return (
    <StepCard title="Split into groups">
      <div className="grid max-w-140 grid-cols-2 gap-4">
        <Field label="Groups">
          <Segmented
            options={groupOptions(teams.length)}
            value={numGroups}
            onChange={setNumGroups}
          />
        </Field>
        <Field label="Advance per group">
          <Segmented
            options={qualifyOptions(numGroups)}
            value={qualifyCount}
            onChange={setQualifyCount}
          />
        </Field>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-2.5">
          {groups.map((teamIds, index) => (
            <div key={index} className="rounded-[9px] border border-line bg-surface p-3">
              <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-amber-ink">
                Group {GROUP_LETTERS[index]}
              </div>
              <ul className="flex flex-col gap-1">
                {teamIds.map((id) => (
                  <TeamChip key={id} team={teams.find((t) => t.id === id)} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {activeTeam &&
          createPortal(
            <DragOverlay dropAnimation={null}>
              <div className="flex cursor-grabbing items-center gap-2 rounded-sm border border-amber-line bg-surface-3 px-2 py-1.5 text-[13px] text-ink shadow-lg">
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-amber-ink" aria-hidden="true" />
                <span>{activeTeam.flag}</span>
                <span className="truncate">{activeTeam.name}</span>
              </div>
            </DragOverlay>,
            document.body,
          )}
      </DndContext>

      <p className="mt-3 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-widest text-ink-dim">
        <GripVertical className="h-3.5 w-3.5 text-amber-ink/70" aria-hidden="true" />
        Drag a team onto another to swap their spots
      </p>

      <p className="mt-4 text-[13px] text-ink-dim">
        {numGroups * qualifyCount} teams advance — the knockout bracket is generated automatically.
      </p>

      <WizardButton disabled={busy} onClick={() => onSubmit(groups)}>
        {busy ? "Generating…" : "Create tournament"}
      </WizardButton>
    </StepCard>
  );
}

function TeamChip({ team }: { team?: Team }) {
  const drag = useDraggable({ id: team?.id ?? 0 });
  const drop = useDroppable({ id: team?.id ?? 0 });

  if (!team) return null;

  return (
    <li
      ref={(node) => {
        drag.setNodeRef(node);
        drop.setNodeRef(node);
      }}
      {...drag.listeners}
      {...drag.attributes}
      className={[
        "group flex cursor-grab items-center gap-2 rounded-sm border px-2 py-1.5 text-[13px] transition-colors active:cursor-grabbing",
        drag.isDragging
          ? "border-dashed border-line-2 text-ink-mute opacity-50"
          : drop.isOver
            ? "border-amber-line bg-amber/10 text-ink"
            : "border-line bg-surface-2/50 text-ink-dim hover:border-amber-line/60 hover:bg-surface-3 hover:text-ink",
      ].join(" ")}
    >
      <GripVertical
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 text-ink-mute transition-colors group-hover:text-amber-ink"
      />
      <span>{team.flag}</span>
      <span className="truncate">{team.name}</span>
    </li>
  );
}
