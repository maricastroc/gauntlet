"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Settings2, Trash2, Trophy } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { relativeDate } from "@/lib/format";
import { api } from "@/lib/api/client";
import { notifyApiError } from "@/lib/toast";
import { useAuth } from "@/lib/auth/context";
import { setCurrentTournamentCookie } from "@/lib/tournament/select";
import { DEMO_TOURNAMENT_ID, DEMO_TOURNAMENT_NAME } from "@/lib/tournament/constants";
import type { TournamentSummary } from "@/lib/types";

const DEMO_CARD: TournamentSummary = {
  id: DEMO_TOURNAMENT_ID,
  name: DEMO_TOURNAMENT_NAME,
  status: "active",
  teamsCount: 32,
  stagesCount: 2,
};

export default function TournamentsPage() {
  const { status, token } = useAuth();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<TournamentSummary | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    let active = true;
    (async () => {
      if (status === "authed" && token) {
        try {
          const list = await api.listTournaments(token);
          if (active) setTournaments(list);
        } catch {
          if (active) setTournaments([]);
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [status, token]);

  function view(id: number) {
    setCurrentTournamentCookie(id);
    router.push("/");
    router.refresh();
  }

  async function remove(id: number) {
    if (!token) return;
    try {
      await api.deleteTournament(token, id);
      setTournaments((current) => current.filter((t) => t.id !== id));
    } catch (err) {
      notifyApiError(err);
    }
  }

  // Show the read-only sample only as an entry point when you own nothing yet;
  // once you have your own tournament, it's just clutter.
  const cards = tournaments.length > 0 ? tournaments : [DEMO_CARD];

  return (
    <div className="pb-10">
      <PageHeading
        eyebrow="Organizer"
        title="Tournaments"
        subtitle="Every tournament you run. Open one to view it across the app, or start a new build."
        actions={
          status === "authed" ? (
            <Link
              href="/tournaments/new"
              className="inline-flex items-center gap-2 rounded-[10px] bg-amber px-4 py-2.5 text-[13px] font-bold text-[#1a1205] shadow-[0_4px_14px_-9px_rgba(242,169,59,0.5)] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-[1.07] hover:shadow-[0_8px_20px_-10px_rgba(242,169,59,0.6)] active:translate-y-0 active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" />
              New tournament
            </Link>
          ) : undefined
        }
      />

      <div className="px-5 pt-4 sm:px-6">
        {status === "guest" && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[11px] border border-dashed border-line-2 px-4 py-3 text-[13.5px] text-ink-dim">
            <span className="text-amber">◆</span>
            <span>
              <Link href="/login?from=/tournaments" className="text-amber-ink hover:underline">
                Sign in
              </Link>{" "}
              to build and manage your own tournaments.
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[132px] animate-pulse rounded-[13px] bg-white/[0.03]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                isDemo={tournament.id === DEMO_TOURNAMENT_ID}
                onView={() => view(tournament.id)}
                onDelete={
                  tournament.id === DEMO_TOURNAMENT_ID ? undefined : () => setToDelete(tournament)
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        title="Delete tournament?"
        description={
          toDelete
            ? `"${toDelete.name}" and all of its teams, fixtures and results will be permanently deleted. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete tournament"
        onConfirm={() => {
          if (toDelete) remove(toDelete.id);
        }}
      />
    </div>
  );
}

function TournamentCard({
  tournament,
  isDemo,
  onView,
  onDelete,
}: {
  tournament: TournamentSummary;
  isDemo: boolean;
  onView: () => void;
  onDelete?: () => void;
}) {
  const { teamsCount, stagesCount, createdAt } = tournament;
  const stageLabel =
    stagesCount == null ? null : stagesCount >= 2 ? "Groups + Knockout" : "Group stage";
  const meta = [teamsCount != null ? `${teamsCount} teams` : null, stageLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView();
        }
      }}
      className="group flex cursor-pointer flex-col justify-between rounded-[14px] border border-line bg-surface-2/60 p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:border-line-2 hover:bg-surface-2/80 hover:shadow-[0_18px_42px_-22px_rgba(0,0,0,0.95)]"
    >
      <div>
        <div className="mb-3 flex items-center gap-2.5">
          <StatusChip status={tournament.status} />
          {isDemo && (
            <span className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-mute">
              Sample
            </span>
          )}
        </div>
        <h2 className="flex items-center gap-2 font-serif text-[19px] font-semibold leading-tight tracking-[-0.01em]">
          <Trophy className="h-[18px] w-[18px] shrink-0 text-amber-ink/70" />
          <span className="truncate">{tournament.name}</span>
        </h2>
        {meta && (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-mute">
            {meta}
          </p>
        )}
        {createdAt && (
          <p className="mt-1.5 font-mono text-[10.5px] tracking-[0.06em] text-ink-mute/70">
            Created {relativeDate(createdAt)}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-[9px] border border-line-2 bg-surface-3 px-3.5 py-2 text-[12.5px] font-semibold text-ink transition-colors duration-150 group-hover:border-amber-line group-hover:bg-amber-soft group-hover:text-amber-ink">
          Open
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
        <div className="flex items-center gap-2">
          {!isDemo && (
            <Link
              href={`/tournaments/${tournament.id}/manage`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Manage ${tournament.name}`}
              data-tooltip-id="app-tooltip"
              data-tooltip-content="Manage tournament"
              data-tooltip-place="top"
              className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] border border-line text-ink-mute transition-colors duration-150 hover:border-amber-line hover:text-amber-ink"
            >
              <Settings2 className="h-4 w-4" />
            </Link>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label={`Delete ${tournament.name}`}
              data-tooltip-id="app-tooltip"
              data-tooltip-content="Delete tournament"
              data-tooltip-place="top"
              className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] border border-line text-ink-mute transition-colors duration-150 hover:border-loss/40 hover:text-loss"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: TournamentSummary["status"] }) {
  const dot: Record<TournamentSummary["status"], string> = {
    draft: "bg-ink-mute",
    active: "bg-amber shadow-[0_0_7px_0_rgba(242,169,59,0.8)]",
    finished: "bg-win shadow-[0_0_7px_0_rgba(85,184,126,0.7)]",
  };
  const label: Record<TournamentSummary["status"], string> = {
    draft: "Draft",
    active: "Active",
    finished: "Finished",
  };
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.06em] text-ink-dim">
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {label[status]}
    </span>
  );
}
