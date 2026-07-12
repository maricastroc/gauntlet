// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Bracket } from "@/lib/types";

const shared = vi.hoisted(() => ({ canManage: true as boolean | null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/auth/context", () => ({ useAuth: () => ({ status: "authed", token: "token" }) }));
vi.mock("@/lib/tournament/useCanManage", () => ({ useCanManage: () => shared.canManage }));

import { PlayableBracket } from "./PlayableBracket";

const liveBracket = (): Bracket => ({
  stageId: 1,
  champion: null,
  ties: [
    {
      id: 10,
      round: 1,
      slot: 1,
      status: "ready",
      home: { team: { id: 1, name: "Brazil" }, score: null, penalties: null },
      away: { team: { id: 2, name: "Japan" }, score: null, penalties: null },
      winnerId: null,
      decidedByPenalties: false,
      fixtureId: 100,
      version: 0,
    },
  ],
});

describe("PlayableBracket", () => {
  beforeEach(() => {
    shared.canManage = true;
  });

  it("lets the organizer play a ready tie when not in spectator mode", () => {
    render(<PlayableBracket initial={liveBracket()} tournamentId={7} />);

    expect(screen.getByText("Brazil").closest("button")).not.toBeNull();
    expect(screen.getByText(/enter result/i)).toBeInTheDocument();
  });

  it("exposes no management controls in spectator mode, even for the organizer", () => {
    render(<PlayableBracket initial={liveBracket()} tournamentId={7} spectator />);

    expect(screen.getByText("Brazil")).toBeInTheDocument();
    expect(screen.getByText("Brazil").closest("button")).toBeNull();
    expect(screen.queryByText(/enter result/i)).toBeNull();
  });
});
