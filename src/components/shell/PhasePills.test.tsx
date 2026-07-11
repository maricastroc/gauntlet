import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PhasePill } from "@/lib/types";
import { PhasePills } from "./PhasePills";

const pathname = vi.fn(() => "/");
vi.mock("next/navigation", () => ({ usePathname: () => pathname() }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const PHASES: PhasePill[] = [
  { key: "groups", label: "Groups", state: "done" },
  { key: "r1", label: "Quarters", state: "now" },
  { key: "r2", label: "Semis", state: "todo" },
  { key: "r3", label: "Final", state: "todo" },
];

const linkTo = (label: string) => screen.getByRole("link", { name: `Go to ${label}` });

describe("PhasePills", () => {
  beforeEach(() => pathname.mockReturnValue("/"));

  it("links Groups to standings and the knockout round to the bracket", () => {
    render(<PhasePills phases={PHASES} />);
    expect(linkTo("Groups")).toHaveAttribute("href", "/standings");
    expect(linkTo("Quarters")).toHaveAttribute("href", "/bracket");
  });

  it("locks phases that haven't been reached yet", () => {
    render(<PhasePills phases={PHASES} />);

    expect(screen.queryByRole("link", { name: "Go to Semis" })).toBeNull();

    const semis = screen.getByText("Semis");
    expect(semis).toHaveAttribute("aria-disabled", "true");
    expect(semis).toHaveAttribute("data-tooltip-content", "Finish the Quarters to unlock");
  });

  it("highlights Groups when on the standings page", () => {
    pathname.mockReturnValue("/standings");
    render(<PhasePills phases={PHASES} />);
    expect(linkTo("Groups")).toHaveAttribute("aria-current", "page");
    expect(linkTo("Quarters")).not.toHaveAttribute("aria-current");
  });

  it("highlights the knockout round when on the bracket page", () => {
    pathname.mockReturnValue("/bracket");
    render(<PhasePills phases={PHASES} />);
    expect(linkTo("Quarters")).toHaveAttribute("aria-current", "page");
    expect(linkTo("Groups")).not.toHaveAttribute("aria-current");
  });

  it("falls back to the live phase on routes that aren't a pill target", () => {
    pathname.mockReturnValue("/");
    render(<PhasePills phases={PHASES} />);

    expect(linkTo("Quarters")).toHaveAttribute("aria-current", "page");
    expect(linkTo("Groups")).not.toHaveAttribute("aria-current");
  });
});
