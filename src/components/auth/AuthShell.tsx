import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Shared chrome for the auth screens: the mark, a mono eyebrow, a serif title
 * and a subtitle, centered on the stadium background. The form (and any
 * page-specific footer) is passed as children.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[420px] flex-col justify-center px-6 py-16">
      <div className="animate-fade-up">
        <Link
          href="/"
          aria-label="Bracket — home"
          className="mb-8 inline-grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-gradient-to-br from-amber to-[#C9791F] font-serif text-[18px] font-extrabold text-[#1a1205] shadow-[0_4px_14px_-4px_rgba(242,169,59,0.6)]"
        >
          B
        </Link>

        <p className="eyebrow text-amber">{eyebrow}</p>
        <h1 className="title-serif mt-2.5 text-[34px] leading-[1.05]">{title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">{subtitle}</p>

        {children}
      </div>
    </main>
  );
}

/** The full-width amber submit button shared by both forms. */
export function AuthSubmit({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-[11px] bg-amber px-4 py-3.5 text-[14px] font-bold text-[#1a1205] shadow-[0_8px_22px_-8px_rgba(242,169,59,0.6)] transition-all duration-150 enabled:hover:brightness-105 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

/** Inline form error surface. */
export function AuthError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-[9px] border border-loss/35 bg-loss/[0.08] px-3.5 py-2.5 text-[13px] text-loss"
    >
      {message}
    </p>
  );
}
