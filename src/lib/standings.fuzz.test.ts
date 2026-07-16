import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildFuzzSuite, type FuzzSuite } from "./standings.fuzz.gen";

const filePath = path.join(process.cwd(), "test-vectors", "standings.fuzz.json");

if (process.env.UPDATE_VECTORS) {
  writeFileSync(filePath, JSON.stringify(buildFuzzSuite(), null, 2) + "\n", "utf8");
}

describe("standings fuzz vectors (shared with the API engine)", () => {
  it("committed artifact is in sync with the generator — run `npm run vectors` if this fails", () => {
    expect(existsSync(filePath)).toBe(true);
    const committed = JSON.parse(readFileSync(filePath, "utf8")) as FuzzSuite;
    expect(committed).toEqual(buildFuzzSuite());
  });
});
