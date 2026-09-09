import { expect, test } from "@playwright/test";
import {
  GROUP_A,
  openGroup,
  projectedRow,
  resetSandbox,
  setScore,
  standingsRow,
} from "./support/app";

test.beforeEach(async ({ page }) => {
  await resetSandbox(page);
});

test("a what-if scenario re-projects the standings without persisting them", async ({ page }) => {
  await page.goto("/standings");
  await expect(standingsRow(page, GROUP_A.leader).getByTestId("standings-points")).toHaveText("7");

  await page.goto("/what-if");
  await openGroup(page, GROUP_A.name);

  await page
    .getByRole("button")
    .filter({ hasText: GROUP_A.leader })
    .filter({ hasText: GROUP_A.bottom })
    .first()
    .click();

  const editor = page.getByTestId("scenario-editor");
  await setScore(editor, "stepper", GROUP_A.leader, 0);
  await setScore(editor, "stepper", GROUP_A.bottom, 3);

  await page.getByRole("button", { name: /Pin this result|Update this result/ }).click();

  await expect(projectedRow(page, GROUP_A.runnerUp)).toHaveAttribute("data-position", "1");
  await expect(projectedRow(page, GROUP_A.leader)).not.toHaveAttribute("data-position", "1");

  await page.goto("/standings");
  await expect(standingsRow(page, GROUP_A.leader).getByTestId("standings-points")).toHaveText("7");
  await expect(standingsRow(page, GROUP_A.runnerUp).getByTestId("standings-points")).toHaveText(
    "7",
  );
});
