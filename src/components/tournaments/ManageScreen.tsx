"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { notifyApiError } from "@/lib/toast";
import { useAuth } from "@/lib/auth/context";
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
      <section className="mb-5 rounded-[13px] border border-line bg-surface-2/60 p-5">
        <p className="eyebrow mb-2.5">Tournament name</p>
        <NameEditor
          initial={detail.name}
          minLength={2}
          ariaLabel="Tournament name"
          onSave={async (name) => {
            const summary = await api.updateTournament(token!, tournamentId, name);
            setDetail((d) => (d ? { ...d, name: summary.name } : d));
            router.refresh();
          }}
        />
      </section>

      <section className="rounded-[13px] border border-line bg-surface-2/60 p-5">
        <p className="eyebrow mb-3.5">Teams · {detail.teams.length}</p>
        <div className="grid gap-2">
          {detail.teams.map((team) => (
            <TeamEditor
              key={team.id}
              team={team}
              onSave={async (changes) => {
                const updated = await api.updateTeam(token!, tournamentId, team.id, changes);
                setDetail((d) =>
                  d ? { ...d, teams: d.teams.map((t) => (t.id === updated.id ? updated : t)) } : d,
                );
                router.refresh();
              }}
            />
          ))}
        </div>
        <p className="mt-3.5 font-mono text-[11px] text-ink-mute">
          Renaming is safe — standings, tiebreaks and the bracket are keyed by team, not by name.
        </p>
      </section>
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
  onSave,
}: {
  initial: string;
  minLength: number;
  ariaLabel: string;
  onSave: (name: string) => Promise<void>;
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
      setValue(next);
    } catch (err) {
      notifyApiError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        aria-label={ariaLabel}
        className="min-w-0 flex-1 rounded-[9px] border border-line-2 bg-surface-3 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-amber-line"
      />
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
  const [name, setName] = useState(team.name);
  const [flag, setFlag] = useState(team.flag ?? "");
  const [saving, setSaving] = useState(false);
  const trimmedName = name.trim();
  const trimmedFlag = flag.trim();
  const dirty =
    trimmedName.length > 0 &&
    (trimmedName !== team.name || trimmedFlag !== (team.flag ?? ""));

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await onSave({ name: trimmedName, flag: trimmedFlag || null });
      setName(trimmedName);
      setFlag(trimmedFlag);
    } catch (err) {
      notifyApiError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={flag}
        onChange={(e) => setFlag(e.target.value)}
        aria-label={`${team.name} flag`}
        placeholder="🏳"
        className="w-12 shrink-0 rounded-[9px] border border-line-2 bg-surface-3 px-2 py-2 text-center text-[18px] outline-none transition-colors focus:border-amber-line"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        aria-label={`${team.name} name`}
        className="min-w-0 flex-1 rounded-[9px] border border-line-2 bg-surface-3 px-3.5 py-2 text-[14px] text-ink outline-none transition-colors focus:border-amber-line"
      />
      <SaveButton dirty={dirty} saving={saving} onClick={save} />
    </div>
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
      className="shrink-0 rounded-[9px] border border-line-2 px-3 py-2 text-[12.5px] font-semibold text-ink-dim transition-colors enabled:hover:border-amber-line enabled:hover:text-amber-ink disabled:opacity-40"
    >
      {saving ? "Saving…" : "Save"}
    </button>
  );
}
