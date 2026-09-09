import { expect, test } from "@playwright/test";
import { GROUP_A, resetSandbox, tieCoordinates, upsetGroupA } from "./support/app";

test.beforeEach(async ({ page }) => {
  await resetSandbox(page);
});

test("a group result cascades into the knockout seeding", async ({ page }) => {
  await page.goto("/bracket");
  const leaderTie = await tieCoordinates(page, GROUP_A.leader);
  const runnerUpTie = await tieCoordinates(page, GROUP_A.runnerUp);
  expect(leaderTie).not.toEqual(runnerUpTie);

  await upsetGroupA(page);

  await page.goto("/bracket");
  expect(await tieCoordinates(page, GROUP_A.runnerUp)).toEqual(leaderTie);
  expect(await tieCoordinates(page, GROUP_A.leader)).toEqual(runnerUpTie);
});
