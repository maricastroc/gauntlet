import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="px-5 pb-2 pt-6 sm:px-6 sm:pt-7">
      <p className="eyebrow flex items-center gap-2.5 text-amber">
        <span className="text-amber">{eyebrow}</span>
        <span className="h-px w-10 bg-gradient-to-r from-amber-line to-transparent" />
      </p>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h1 className="title-serif min-w-0 text-[clamp(28px,3.6vw,40px)] leading-[1.04]">
          {title}
        </h1>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {subtitle && (
        <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-ink-dim">{subtitle}</p>
      )}
    </div>
  );
}
