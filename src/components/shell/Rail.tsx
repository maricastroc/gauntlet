"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav";

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * The left rail — a thin, quiet column of icons. Active destination glows amber;
 * everything else stays muted so navigation never competes with the data.
 */
export function Rail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="flex flex-row items-center gap-1.5 border-b border-line bg-gradient-to-b from-white/[0.02] to-transparent px-3.5 py-2.5 md:h-full md:flex-col md:border-b-0 md:border-r md:px-0 md:py-4"
    >
      <Link
        href="/"
        aria-label="Bracket — home"
        className="mb-0 grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-gradient-to-br from-amber to-[#C9791F] font-serif text-[17px] font-extrabold text-[#1a1205] shadow-[0_4px_14px_-4px_rgba(242,169,59,0.6)] transition-transform duration-200 hover:scale-105 md:mb-3.5"
      >
        B
      </Link>

      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={[
              "grid h-10 w-10 place-items-center rounded-[10px] border transition-colors duration-200 [&_svg]:h-[19px] [&_svg]:w-[19px]",
              active
                ? "border-amber-line bg-amber-soft text-amber-ink"
                : "border-transparent text-ink-mute hover:bg-white/[0.03] hover:text-ink-dim",
            ].join(" ")}
          >
            {item.icon}
          </Link>
        );
      })}
    </nav>
  );
}
