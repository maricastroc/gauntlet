// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { LiveTournamentState } from "@/lib/live/useLiveTournament";

const state = vi.fn<() => LiveTournamentState>();
vi.mock("./LiveTournamentProvider", () => ({ useLiveStatus: () => state() }));

import { LiveStatusBadge } from "./LiveStatusBadge";

describe("LiveStatusBadge", () => {
  beforeEach(() => state.mockReset());

  it("shows Live when connected", () => {
    state.mockReturnValue({ status: "live", lastUpdateAt: null });
    render(<LiveStatusBadge />);
    expect(screen.getByRole("status")).toHaveTextContent(/live/i);
  });

  it("shows Reconnecting on a dropped connection", () => {
    state.mockReturnValue({ status: "reconnecting", lastUpdateAt: null });
    render(<LiveStatusBadge />);
    expect(screen.getByRole("status")).toHaveTextContent(/reconnecting/i);
  });

  it("shows Offline when the stream closes for good", () => {
    state.mockReturnValue({ status: "offline", lastUpdateAt: null });
    render(<LiveStatusBadge />);
    expect(screen.getByRole("status")).toHaveTextContent(/offline/i);
  });
});
