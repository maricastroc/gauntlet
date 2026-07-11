import { describe, expect, it } from "vitest";
import { matchDecidesQualification } from "@/lib/console";
import type { QualificationOutlook } from "@/lib/types";

const outlook = (entries: Record<number, QualificationOutlook>) =>
  new Map(Object.entries(entries).map(([id, o]) => [Number(id), o]));

describe("matchDecidesQualification", () => {
  it("is decisive when either team is still contending", () => {
    const o = outlook({ 1: "contending", 2: "eliminated" });
    expect(matchDecidesQualification(o, 1, 2)).toBe(true);
    expect(matchDecidesQualification(o, 2, 1)).toBe(true);
  });

  it("is a dead rubber when both teams are already settled", () => {
    expect(matchDecidesQualification(outlook({ 1: "clinched", 2: "eliminated" }), 1, 2)).toBe(false);
    expect(matchDecidesQualification(outlook({ 1: "clinched", 2: "clinched" }), 1, 2)).toBe(false);
  });

  it("is not decisive without a forecast or a known team", () => {
    expect(matchDecidesQualification(null, 1, 2)).toBe(false);
    expect(matchDecidesQualification(outlook({ 1: "contending" }), undefined, 2)).toBe(false);
  });
});
