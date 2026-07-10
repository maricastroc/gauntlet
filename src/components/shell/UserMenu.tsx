"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { initials } from "@/lib/format";

/** Organizer identity in the topbar: avatar + sign-out when authed, else sign-in. */
export function UserMenu() {
  const { status, user, logout } = useAuth();

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.04]" />;
  }

  if (status === "guest" || !user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-line-2 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-dim transition-colors duration-150 hover:border-amber-line hover:text-amber-ink"
      >
        Sign in
      </Link>
    );
  }

  const firstName = user.name.split(/\s+/)[0];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="grid h-8 w-8 place-items-center rounded-full border border-amber-line bg-amber-soft font-mono text-[11px] font-bold text-amber-ink"
        title={user.name}
      >
        {initials(user.name)}
      </div>
      <span className="hidden text-[13px] font-medium text-ink-dim sm:inline">
        {firstName}
      </span>
      <button
        type="button"
        onClick={() => logout()}
        title="Sign out"
        aria-label="Sign out"
        className="grid h-8 w-8 place-items-center rounded-[8px] text-ink-mute transition-colors duration-150 hover:bg-white/[0.03] hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
