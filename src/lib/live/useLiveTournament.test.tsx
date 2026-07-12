// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => {
  const router = { refresh };
  return { useRouter: () => router };
});
vi.mock("@/lib/api/client", () => ({ API_BASE_URL: "http://api.test" }));

import { useLiveTournament } from "./useLiveTournament";

class MockEventSource {
  static instances: MockEventSource[] = [];
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  url: string;
  readyState = MockEventSource.CONNECTING;
  closed = false;
  private listeners: Record<string, Array<(ev: unknown) => void>> = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, fn: (ev: unknown) => void) {
    (this.listeners[type] ??= []).push(fn);
  }

  removeEventListener(type: string, fn: (ev: unknown) => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((f) => f !== fn);
  }

  close() {
    this.closed = true;
    this.readyState = MockEventSource.CLOSED;
  }

  private dispatch(type: string, ev: unknown) {
    (this.listeners[type] ?? []).forEach((f) => f(ev));
  }

  open() {
    this.readyState = MockEventSource.OPEN;
    this.dispatch("open", {});
  }

  message(data: unknown) {
    this.dispatch("update", { data: typeof data === "string" ? data : JSON.stringify(data) });
  }

  fail(readyState = MockEventSource.CONNECTING) {
    this.readyState = readyState;
    this.dispatch("error", {});
  }

  static latest() {
    return MockEventSource.instances[MockEventSource.instances.length - 1];
  }
}

beforeEach(() => {
  refresh.mockReset();
  MockEventSource.instances = [];
  vi.stubGlobal("EventSource", MockEventSource);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const flushCoalesce = () => act(() => void vi.advanceTimersByTime(400));

describe("useLiveTournament", () => {
  it("opens one stream for the tournament and reports live on open", () => {
    const { result } = renderHook(() => useLiveTournament(7));
    const es = MockEventSource.latest();

    expect(es.url).toBe("http://api.test/tournaments/7/stream");
    expect(result.current.status).toBe("connecting");

    act(() => es.open());
    expect(result.current.status).toBe("live");
  });

  it("refetches once when the revision advances (after the coalesce window)", () => {
    renderHook(() => useLiveTournament(7));
    const es = MockEventSource.latest();

    act(() => es.message({ tournament_id: 7, revision: 1 }));
    expect(refresh).not.toHaveBeenCalled();

    flushCoalesce();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("coalesces a burst of frames into a single refetch", () => {
    renderHook(() => useLiveTournament(7));
    const es = MockEventSource.latest();

    act(() => {
      es.message({ tournament_id: 7, revision: 1 });
      es.message({ tournament_id: 7, revision: 2 });
      es.message({ tournament_id: 7, revision: 3 });
    });
    flushCoalesce();

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("ignores duplicate and out-of-order revisions", () => {
    renderHook(() => useLiveTournament(7));
    const es = MockEventSource.latest();

    act(() => es.message({ tournament_id: 7, revision: 5 }));
    flushCoalesce();
    expect(refresh).toHaveBeenCalledTimes(1);

    act(() => {
      es.message({ tournament_id: 7, revision: 5 });
      es.message({ tournament_id: 7, revision: 3 });
    });
    flushCoalesce();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("ignores events for a different tournament", () => {
    renderHook(() => useLiveTournament(7));
    const es = MockEventSource.latest();

    act(() => es.message({ tournament_id: 99, revision: 10 }));
    flushCoalesce();

    expect(refresh).not.toHaveBeenCalled();
  });

  it("re-syncs after a reconnect emits a newer revision", () => {
    const { result } = renderHook(() => useLiveTournament(7));
    const es = MockEventSource.latest();

    act(() => es.open());
    act(() => es.message({ tournament_id: 7, revision: 1 }));
    flushCoalesce();
    expect(refresh).toHaveBeenCalledTimes(1);

    act(() => es.fail(MockEventSource.CONNECTING));
    expect(result.current.status).toBe("reconnecting");

    act(() => es.open());
    expect(result.current.status).toBe("live");

    act(() => es.message({ tournament_id: 7, revision: 4 }));
    flushCoalesce();
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("stays recoverable when a refetch throws", () => {
    refresh.mockImplementationOnce(() => {
      throw new Error("network");
    });
    renderHook(() => useLiveTournament(7));
    const es = MockEventSource.latest();

    act(() => es.message({ tournament_id: 7, revision: 1 }));
    expect(() => flushCoalesce()).not.toThrow();

    act(() => es.message({ tournament_id: 7, revision: 2 }));
    flushCoalesce();
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("marks offline when the connection closes for good", () => {
    const { result } = renderHook(() => useLiveTournament(7));
    const es = MockEventSource.latest();

    act(() => es.fail(MockEventSource.CLOSED));
    expect(result.current.status).toBe("offline");
  });

  it("closes the stream on unmount", () => {
    const { unmount } = renderHook(() => useLiveTournament(7));
    const es = MockEventSource.latest();

    unmount();
    expect(es.closed).toBe(true);
  });

  it("opens no stream when there is no current tournament", () => {
    renderHook(() => useLiveTournament(null));
    expect(MockEventSource.instances).toHaveLength(0);
  });
});
