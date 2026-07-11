"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";
import { notifyApiError } from "@/lib/toast";
import { useAuth } from "@/lib/auth/context";

export function GenerateBracket({ tournamentId }: { tournamentId: number }) {
  const { status, token } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (status !== "authed" || !token) {
      toast.error("Sign in as the organizer to generate the bracket.");
      return;
    }
    setBusy(true);
    try {
      await api.buildKnockout(token, tournamentId);
      router.refresh();
    } catch (err) {
      notifyApiError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[11px] border border-dashed border-line-2 px-6 py-12 text-center">
      <p className="text-[14px] text-ink-mute">
        No knockout bracket yet — the groups are set, so you can generate it now.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={generate}
        className="mt-4 rounded-md border border-amber-line bg-amber-soft px-4 py-2 text-[13.5px] font-semibold text-amber-ink transition-colors duration-150 hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Generating…" : "Generate bracket"}
      </button>
    </div>
  );
}
