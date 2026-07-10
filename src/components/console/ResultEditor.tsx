"use client";

import Link from "next/link";
import type { FixtureDetail } from "@/lib/types";
import { Stepper } from "./Stepper";
import type { useFixtureResult } from "./useFixtureResult";

interface ResultEditorProps {
  fixture: FixtureDetail;
  result: ReturnType<typeof useFixtureResult>;
}

export function ResultEditor({ fixture, result }: ResultEditorProps) {
  const { authed, home, away, setHome, setAway, version, saving, saved, error, dirty, confirm } =
    result;

  return (
    <div className="min-w-0 px-5 pb-6 sm:px-6 lg:border-r lg:border-line">
      <div className="mb-4 flex items-center justify-center gap-4 rounded-md border border-line bg-surface-2 p-5">
        <SideStepper team={fixture.home} value={home} onChange={setHome} />
        <span className="font-mono text-[14px] text-ink-mute">×</span>
        <SideStepper team={fixture.away} value={away} onChange={setAway} />
      </div>

      {authed ? (
        <button
          type="button"
          onClick={confirm}
          disabled={!dirty || saving}
          className="flex w-full items-center justify-center rounded-md bg-amber px-4 py-3.5 text-[15px] font-bold text-[#1a1205] shadow-[0_5px_16px_-10px_rgba(242,169,59,0.5)] transition-all duration-150 enabled:hover:-translate-y-0.5 enabled:hover:brightness-[1.07] enabled:hover:shadow-[0_9px_22px_-10px_rgba(242,169,59,0.6)] enabled:active:translate-y-0 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {saving ? "Saving…" : "Confirm result"}
        </button>
      ) : (
        <Link
          href="/login?from=/console"
          className="flex w-full items-center justify-center rounded-md border border-amber-line bg-amber-soft px-4 py-3.5 text-[14px] font-bold text-amber-ink transition-colors hover:brightness-110"
        >
          Sign in to save results
        </Link>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-[9px] border border-loss/35 bg-loss/8 px-3 py-2 text-center text-[12px] text-loss"
        >
          {error}
        </p>
      )}

      <p className="mt-3 text-center font-mono text-[11.5px] text-ink-mute">
        {saved && !dirty ? (
          <span className="text-win">✓ saved atomically · version {version}</span>
        ) : dirty ? (
          <>
            pending — changed to {home} – {away}
          </>
        ) : authed ? (
          <>no pending changes</>
        ) : (
          <>reading only · sign in to edit</>
        )}
      </p>

      <div className="mt-5 flex gap-2.5 rounded-md border border-dashed border-line-2 px-3.5 py-3 text-[12.5px] leading-[1.45] text-ink-mute">
        <span aria-hidden="true">⛓</span>
        <p>
          <b className="font-semibold text-ink-dim">Atomic</b> recalculation: standings, tiebreaks
          and knockout slots are rewritten in a single transaction —{" "}
          <code className="font-mono text-[12px] text-amber-ink">
            the table is never left in a partial state
          </code>
          .
        </p>
      </div>
    </div>
  );
}

function SideStepper({
  team,
  value,
  onChange,
}: {
  team: { name: string; flag?: string } | null;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex w-23 flex-col items-center gap-2">
      <span className="text-[30px] leading-none" aria-hidden="true">
        {team?.flag}
      </span>
      <span className="text-center text-[13px] font-semibold">{team?.name}</span>
      <Stepper value={value} onChange={onChange} label={team?.name ?? ""} />
    </div>
  );
}
