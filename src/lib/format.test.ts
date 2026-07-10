import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatGoalDifference,
  formatProbability,
  initials,
  ordinal,
  relativeDate,
  roundName,
  roundTag,
} from "@/lib/format";

describe("roundName", () => {
  it("names rounds by distance to the final", () => {
    expect(roundName(4, 4)).toBe("Final");
    expect(roundName(3, 4)).toBe("Semifinals");
    expect(roundName(2, 4)).toBe("Quarterfinals");
    expect(roundName(1, 4)).toBe("Round of 16");
    expect(roundName(1, 5)).toBe("Round of 32");
  });

  it("falls back to a generic label for deeper rounds", () => {
    expect(roundName(1, 6)).toBe("Round 1");
  });
});

describe("roundTag", () => {
  it("drops the slot number for the final", () => {
    expect(roundTag(4, 4, 1)).toBe("F");
  });

  it("prefixes the slot for named rounds", () => {
    expect(roundTag(3, 4, 2)).toBe("SF2");
    expect(roundTag(2, 4, 3)).toBe("QF3");
  });

  it("uses a numbered prefix for early rounds", () => {
    expect(roundTag(1, 5, 4)).toBe("R1·4");
  });
});

describe("formatGoalDifference", () => {
  it("prefixes positive values with a plus", () => {
    expect(formatGoalDifference(3)).toBe("+3");
  });

  it("prefixes negative values with a minus sign", () => {
    expect(formatGoalDifference(-2)).toBe("−2");
  });

  it("renders zero without a sign", () => {
    expect(formatGoalDifference(0)).toBe("0");
  });
});

describe("formatProbability", () => {
  it("rounds to a whole percent", () => {
    expect(formatProbability(0.26)).toBe("26%");
    expect(formatProbability(0.555)).toBe("56%");
  });

  it("clamps the near-certain to 100% and the tiny-but-alive to <1%", () => {
    expect(formatProbability(1)).toBe("100%");
    expect(formatProbability(0.997)).toBe("100%");
    expect(formatProbability(0.004)).toBe("<1%");
  });

  it("shows a bare 0% only for a true zero", () => {
    expect(formatProbability(0)).toBe("0%");
  });
});

describe("ordinal", () => {
  it("uses st/nd/rd for 1, 2, 3", () => {
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
  });

  it("uses th for the 11-13 exception range", () => {
    expect(ordinal(11)).toBe("11th");
    expect(ordinal(12)).toBe("12th");
    expect(ordinal(13)).toBe("13th");
  });

  it("uses th for other values and repeats the pattern past 20", () => {
    expect(ordinal(4)).toBe("4th");
    expect(ordinal(21)).toBe("21st");
    expect(ordinal(112)).toBe("112th");
  });
});

describe("relativeDate", () => {
  afterEach(() => vi.useRealTimers());

  it("returns an empty string for an invalid date", () => {
    expect(relativeDate("not-a-date")).toBe("");
  });

  it("describes recent and distant dates relative to now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T12:00:00Z"));

    expect(relativeDate("2026-07-10T00:00:00Z")).toBe("today");
    expect(relativeDate("2026-07-09T00:00:00Z")).toBe("yesterday");
    expect(relativeDate("2026-07-05T00:00:00Z")).toBe("5 days ago");
    expect(relativeDate("2026-06-01T00:00:00Z")).toBe("a month ago");
    expect(relativeDate("2024-07-10T00:00:00Z")).toBe("2 years ago");
  });
});

describe("initials", () => {
  it("takes the first letter of the first two words", () => {
    expect(initials("Costa Rica")).toBe("CR");
    expect(initials("United States of America")).toBe("US");
  });

  it("handles a single word", () => {
    expect(initials("Brazil")).toBe("B");
  });

  it("returns an empty string for empty input", () => {
    expect(initials("")).toBe("");
  });
});
