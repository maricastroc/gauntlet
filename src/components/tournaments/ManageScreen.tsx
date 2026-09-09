"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api/client";
import { notifyApiError, notifySuccess } from "@/lib/toast";
import { useAuth } from "@/lib/auth/context";
import { setCurrentTournamentCookie } from "@/lib/tournament/select";
import type { Team, TournamentDetail } from "@/lib/types";

export function ManageScreen({ tournamentId }: { tournamentId: number }) {
  const { status, token } = useAuth();
  const router = useRouter();
  const [detail, setDetail] = useState<TournamentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authed" || !token) return;
    let active = true;
    (async () => {
      try {
        const loaded = await api.getManagedTournament(token, tournamentId);
        if (active) setDetail(loaded);
      } catch (err) {
        if (active) notifyApiError(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [status, token, tournamentId]);

  if (status === "guest") {
    return (
      <Frame>
        <Notice>
          <Link
            href={`/login?from=/tournaments/${tournamentId}/manage`}
            className="text-amber-ink hover:underline"
          >
            Sign in
          </Link>{" "}
          to manage this tournament.
        </Notice>
      </Frame>
    );
  }

  if (loading || status === "loading") {
    return (
      <Frame>
        <div className="h-32.5 animate-pulse rounded-[13px] bg-white/3" />
      </Frame>
    );
  }

  if (!detail) {
    return (
      <Frame>
        <Empty>This tournament could not be loaded.</Empty>
      </Frame>
    );
  }

  if (!detail.canManage) {
    return (
      <Frame>
        <Empty>
          Only the organizer can manage this tournament.
          <span className="mt-3 block">
            <Link href="/tournaments" className="text-amber-ink hover:underline">
              Back to tournaments
            </Link>
          </span>
        </Empty>
      </Frame>
    );
  }

  return (
    <Frame>
      <div className="max-w-2xl">
        <section className="mb-5 rounded-[13px] border border-line bg-surface-2/60 p-5">
          <p className="eyebrow mb-2.5">Live spectator view</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-sm text-[13.5px] text-ink-dim">
              A read-only view that updates on its own as you enter results — open it in another tab
              or share the link to let others follow along live.
            </p>
            <button
              type="button"
              onClick={() => {
                setCurrentTournamentCookie(detail.id);
                window.open("/live", "_blank", "noopener");
              }}
              className="inline-flex shrink-0 items-center gap-2 rounded-[9px] border border-line-2 px-3.5 py-2 text-[13px] font-semibold text-ink-dim transition-colors hover:border-amber-line hover:text-amber-ink"
            >
              Open live view
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="mb-5 rounded-[13px] border border-line bg-surface-2/60 p-5">
          <p className="eyebrow mb-2.5">Tournament name</p>
          <NameEditor
            initial={detail.name}
            minLength={2}
            ariaLabel="Tournament name"
            display="title"
            onSave={async (name) => {
              const summary = await api.updateTournament(token!, tournamentId, name);
              setDetail((d) => (d ? { ...d, name: summary.name } : d));
              notifySuccess("Tournament renamed.");
              router.refresh();
            }}
          />
        </section>

        <section className="rounded-[13px] border border-line bg-surface-2/60 p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow">Teams · {detail.teams.length}</p>
            <p className="font-mono text-[10.5px] tracking-wide text-ink-mute">
              Click a team to rename
            </p>
          </div>
          <div className="-mx-2 grid gap-0.5">
            {detail.teams.map((team) => (
              <TeamEditor
                key={team.id}
                team={team}
                onSave={async (changes) => {
                  const updated = await api.updateTeam(token!, tournamentId, team.id, changes);
                  setDetail((d) =>
                    d
                      ? { ...d, teams: d.teams.map((t) => (t.id === updated.id ? updated : t)) }
                      : d,
                  );
                  notifySuccess(`${updated.name} updated.`);
                  router.refresh();
                }}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-[9px] border border-line/70 bg-surface-3/40 px-3 py-2 text-[12px] text-ink-dim">
            <span className="text-amber-ink">✓</span>
            <span>Renaming won&apos;t affect standings, tiebreaks or the bracket.</span>
          </div>
        </section>
      </div>
    </Frame>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return <div className="px-5 pt-4 sm:px-6">{children}</div>;
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-line-2 px-4 py-3 text-[13.5px] text-ink-dim">
      <span className="text-amber">◆</span>
      <span>{children}</span>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-line-2 px-6 py-10 text-center text-[14px] text-ink-mute">
      {children}
    </div>
  );
}

function NameEditor({
  initial,
  minLength,
  ariaLabel,
  display,
  onSave,
}: {
  initial: string;
  minLength: number;
  ariaLabel: string;
  display: "title";
  onSave: (name: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group flex w-full items-center gap-3 text-left"
      >
        <span className="title-serif min-w-0 flex-1 truncate text-[20px] text-ink">{initial}</span>
        <RenameHint />
      </button>
    );
  }

  return (
    <NameEditRow
      initial={initial}
      minLength={minLength}
      ariaLabel={ariaLabel}
      display={display}
      onSave={onSave}
      onDone={() => setEditing(false)}
    />
  );
}

function NameEditRow({
  initial,
  minLength,
  ariaLabel,
  onSave,
  onDone,
}: {
  initial: string;
  minLength: number;
  ariaLabel: string;
  display: "title";
  onSave: (name: string) => Promise<void>;
  onDone: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const next = value.trim();
  const dirty = next !== initial && next.length >= minLength;

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await onSave(next);
      onDone();
    } catch (err) {
      notifyApiError(err);
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={value}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") onDone();
        }}
        aria-label={ariaLabel}
        className="min-w-0 flex-1 rounded-[9px] border border-line-2 bg-surface-3 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-amber-line"
      />
      <CancelButton onClick={onDone} />
      <SaveButton dirty={dirty} saving={saving} onClick={save} />
    </div>
  );
}

function TeamEditor({
  team,
  onSave,
}: {
  team: Team;
  onSave: (changes: { name: string; flag: string | null }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Rename ${team.name}`}
        className="group flex w-full items-center gap-3 rounded-[9px] px-2 py-2 text-left transition-colors hover:bg-surface-3/60"
      >
        <span className="w-6 shrink-0 text-center text-[19px] leading-none">
          {team.flag || "🏳"}
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{team.name}</span>
        <RenameHint />
      </button>
    );
  }

  return <TeamEditRow team={team} onSave={onSave} onDone={() => setEditing(false)} />;
}

function TeamEditRow({
  team,
  onSave,
  onDone,
}: {
  team: Team;
  onSave: (changes: { name: string; flag: string | null }) => Promise<void>;
  onDone: () => void;
}) {
  const [name, setName] = useState(team.name);
  const [flag, setFlag] = useState(team.flag ?? "");
  const [saving, setSaving] = useState(false);
  const trimmedName = name.trim();
  const trimmedFlag = flag.trim();
  const dirty =
    trimmedName.length > 0 && (trimmedName !== team.name || trimmedFlag !== (team.flag ?? ""));

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await onSave({ name: trimmedName, flag: trimmedFlag || null });
      onDone();
    } catch (err) {
      notifyApiError(err);
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-[9px] bg-surface-3/40 px-2 py-2">
      <input
        value={flag}
        onChange={(e) => setFlag(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") onDone();
        }}
        aria-label={`${team.name} flag`}
        placeholder="🏳"
        className="w-11 shrink-0 rounded-[8px] border border-line-2 bg-surface-3 px-2 py-1.5 text-center text-[18px] outline-none transition-colors focus:border-amber-line"
      />
      <input
        value={name}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") onDone();
        }}
        aria-label={`${team.name} name`}
        className="min-w-0 flex-1 rounded-[8px] border border-line-2 bg-surface-3 px-3.5 py-1.5 text-[14px] text-ink outline-none transition-colors focus:border-amber-line"
      />
      <CancelButton onClick={onDone} />
      <SaveButton dirty={dirty} saving={saving} onClick={save} />
    </div>
  );
}

function RenameHint() {
  return (
    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
      Rename
    </span>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-[8px] px-2.5 py-1.5 text-[12.5px] font-medium text-ink-mute transition-colors hover:text-ink-dim"
    >
      Cancel
    </button>
  );
}

function SaveButton({
  dirty,
  saving,
  onClick,
}: {
  dirty: boolean;
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!dirty || saving}
      className="shrink-0 rounded-[8px] border border-line-2 px-3 py-1.5 text-[12.5px] font-semibold text-ink-dim transition-colors enabled:hover:border-amber-line enabled:hover:text-amber-ink disabled:opacity-40"
    >
      {saving ? "Saving…" : "Save"}
    </button>
  );
}
