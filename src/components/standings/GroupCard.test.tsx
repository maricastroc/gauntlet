// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Group, StandingRow } from "@/lib/types";
import { GroupCard } from "./GroupCard";

const row = (over: Partial<StandingRow> & Pick<StandingRow, "position" | "team">): StandingRow => ({
  played: 3,
  won: 2,
  drawn: 1,
  lost: 0,
  goalsFor: 6,
  goalsAgainst: 1,
  goalDifference: 5,
  points: 7,
  form: ["W", "D", "W"],
  qualified: false,
  ...over,
});

const GROUP: Group = {
  id: 1,
  name: "A",
  qualifyCount: 2,
  standings: [
    row({ position: 1, team: { id: 10, name: "Brazil", flag: "🇧🇷" }, outlook: "clinched" }),
    row({
      position: 2,
      team: { id: 11, name: "Japan", flag: "🇯🇵" },
      outlook: "contending",
      advanceProb: 0.62,
    }),
    row({
      position: 3,
      team: { id: 12, name: "Morocco", flag: "🇲🇦" },
      points: 0,
      outlook: "eliminated",
    }),
  ],
  tiebreakNote: {
    teams: ["Brazil", "Japan"],
    points: 7,
    detail: "Brazil stays ahead on goal difference.",
  },
};

describe("GroupCard", () => {
  it("shows the group name and how many teams advance", () => {
    render(<GroupCard group={GROUP} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText(/top 2 advance/i)).toBeInTheDocument();
  });

  it("renders every team in standings order", () => {
    render(<GroupCard group={GROUP} />);
    const names = screen.getAllByRole("cell").map((c) => c.textContent);
    const order = ["Brazil", "Japan", "Morocco"].map((n) =>
      names.findIndex((t) => t?.includes(n)),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order.every((i) => i >= 0)).toBe(true);
  });

  it("translates each team's outlook into a badge", () => {
    render(<GroupCard group={GROUP} />);
    expect(screen.getByText("through")).toBeInTheDocument();
    expect(screen.getByText("out")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
  });

  it("draws the qualification line under the last qualifying place", () => {
    render(<GroupCard group={GROUP} />);
    expect(screen.getByText(/qualification line/i)).toBeInTheDocument();
  });

  it("surfaces the tiebreak note when present", () => {
    render(<GroupCard group={GROUP} />);
    expect(screen.getByText("Brazil stays ahead on goal difference.")).toBeInTheDocument();
  });

  it("omits the tiebreak note when there isn't one", () => {
    render(<GroupCard group={{ ...GROUP, tiebreakNote: undefined }} />);
    expect(screen.queryByText(/goal difference/i)).toBeNull();
  });
});
