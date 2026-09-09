import type { ReactNode } from "react";

export function ErrorState({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-125 flex-col items-start px-6 py-20">
      <p className="eyebrow text-amber">{eyebrow}</p>
      <h1 className="title-serif mt-2.5 text-[32px] leading-[1.06]">{title}</h1>
      <div className="mt-3 text-[15px] leading-relaxed text-ink-dim">{children}</div>
      {actions && <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function ErrorAction({
  onClick,
  href,
  children,
  tone = "quiet",
}: {
  onClick?: () => void;
  href?: string;
  children: ReactNode;
  tone?: "primary" | "quiet";
}) {
  const className =
    tone === "primary"
      ? "rounded-md bg-amber px-4 py-2.5 text-[13.5px] font-bold text-[#1a1205] transition-all duration-150 hover:-translate-y-px hover:brightness-105"
      : "rounded-md border border-line-2 px-4 py-2.5 text-[13.5px] font-semibold text-ink-dim transition-colors duration-150 hover:border-amber-line hover:text-amber-ink";

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
