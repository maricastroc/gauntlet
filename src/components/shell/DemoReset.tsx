"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { DEMO_EMAIL } from "@/lib/auth/demo";
import { api } from "@/lib/api/client";
import { setCurrentTournamentCookie } from "@/lib/tournament/select";
import { notifyApiError, notifySuccess } from "@/lib/toast";

/** Demo-only control: your edits are private to this session; reset restores a clean copy. */
export function DemoReset() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [resetting, setResetting] = useState(false);

  if (!user || !token || user.email !== DEMO_EMAIL) return null;

  async function reset() {
    if (!token) return;
    setResetting(true);
    try {
      const id = await api.resetDemo(token);
      setCurrentTournamentCookie(id);
      router.refresh();
      notifySuccess("Demo sandbox reset to a clean tournament.");
    } catch (err) {
      notifyApiError(err);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div
      className="hidden items-center gap-1.5 rounded-full border border-line-2 bg-surface-2/60 py-1 pl-3 pr-1 sm:flex"
      data-tooltip-id="app-tooltip"
      data-tooltip-content="Your edits are private to this session and expire after a day."
      data-tooltip-place="bottom"
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Demo sandbox
      </span>
      <button
        type="button"
        onClick={reset}
        disabled={resetting}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] text-ink-dim transition-colors duration-150 hover:text-amber-ink disabled:opacity-50"
      >
        <RotateCcw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
        {resetting ? "Resetting…" : "Reset"}
      </button>
    </div>
  );
}
