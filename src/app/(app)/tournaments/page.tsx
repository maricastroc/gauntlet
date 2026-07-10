"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { setCurrentTournamentCookie } from "@/lib/tournament/select";
import { DEMO_TOURNAMENT_ID, DEMO_TOURNAMENT_NAME } from "@/lib/tournament/constants";
import type { TournamentSummary } from "@/lib/types";

const DEMO_CARD: TournamentSummary = {
  id: DEMO_TOURNAMENT_ID,
  name: DEMO_TOURNAMENT_NAME,
  status: "active",
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
    await api.deleteTournament(token, id).catch(() => {});
    setTournaments((current) => current.filter((t) => t.id !== id));
  }

  const hasDemo = tournaments.some((t) => t.id === DEMO_TOURNAMENT_ID);
  const cards = hasDemo ? tournaments : [DEMO_CARD, ...tournaments];

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
              className="inline-flex items-center gap-2 rounded-[10px] bg-amber px-4 py-2.5 text-[13px] font-bold text-[#1a1205] shadow-[0_8px_22px_-8px_rgba(242,169,59,0.6)] transition-all duration-150 hover:brightness-105 active:scale-[0.99]"
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
  return (
    <div className="flex flex-col justify-between rounded-[13px] border border-line bg-surface-2/60 p-5 transition-colors duration-150 hover:border-line-2">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <StatusChip status={tournament.status} />
          {isDemo && (
            <span className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-mute">
              Sample
            </span>
          )}
        </div>
        <h2 className="font-serif text-[19px] font-semibold leading-tight tracking-[-0.01em]">
          {tournament.name}
        </h2>
        {(tournament.teamsCount != null || tournament.stagesCount != null) && (
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-mute">
            {tournament.teamsCount ?? 0} teams · {tournament.stagesCount ?? 0} stages
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex-1 rounded-[9px] border border-line-2 bg-surface-3 px-3 py-2 text-[12.5px] font-semibold text-ink transition-colors duration-150 hover:border-amber-line hover:text-amber-ink"
        >
          Open
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${tournament.name}`}
            className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-line text-ink-mute transition-colors duration-150 hover:border-loss/40 hover:text-loss"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: TournamentSummary["status"] }) {
  const styles: Record<TournamentSummary["status"], string> = {
    draft: "border-line-2 text-ink-mute",
    active: "border-amber-line text-amber-ink",
    finished: "border-win/40 text-win",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}
