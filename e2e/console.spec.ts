import { expect, test } from "@playwright/test";
import {
  GROUP_A,
  GUEST_STATE,
  consequenceRow,
  fixtureRow,
  openGroup,
  resetSandbox,
  setScore,
  standingsRow,
  upsetGroupA,
} from "./support/app";

test.describe("Console — spectator", () => {
  test.use({ storageState: GUEST_STATE });

  test("an edit reorders the table locally without saving anything", async ({ page }) => {
    await page.goto("/console");
    await openGroup(page, GROUP_A.name);

    await expect(consequenceRow(page, GROUP_A.leader)).toHaveAttribute("data-position", "1");

    const row = fixtureRow(page, GROUP_A.leader, GROUP_A.bottom);
    await setScore(row, "mini-stepper", GROUP_A.leader, 0);
    await setScore(row, "mini-stepper", GROUP_A.bottom, 3);

    await expect(row).toHaveAttribute("data-status", "unsaved");
    await expect(consequenceRow(page, GROUP_A.runnerUp)).toHaveAttribute("data-position", "1");
    await expect(consequenceRow(page, GROUP_A.leader)).not.toHaveAttribute("data-position", "1");

    await page.reload();
    await openGroup(page, GROUP_A.name);

    await expect(consequenceRow(page, GROUP_A.leader)).toHaveAttribute("data-position", "1");
  });
});

test.describe("Console — organizer", () => {
  test.beforeEach(async ({ page }) => {
    await resetSandbox(page);
  });

  test("a saved result recomputes the standings", async ({ page }) => {
    await upsetGroupA(page);

    await page.goto("/standings");

    await expect(standingsRow(page, GROUP_A.runnerUp).getByTestId("standings-points")).toHaveText(
      "7",
    );
    await expect(standingsRow(page, GROUP_A.leader).getByTestId("standings-points")).toHaveText(
      "4",
    );
  });
});
