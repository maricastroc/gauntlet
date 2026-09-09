import { expect, type Locator, type Page } from "@playwright/test";

export const DEMO_EMAIL = "demo@bracket.test";
export const DEMO_PASSWORD = "password";
export const ORGANIZER_STATE = "playwright/.auth/organizer.json";
export const GUEST_STATE = { cookies: [], origins: [] };

export const GROUP_A = {
  name: "A",
  leader: "Brazil",
  runnerUp: "Japan",
  bottom: "Morocco",
} as const;

const THROTTLE_WINDOW_MS = 61_000;
const SIGN_IN_ATTEMPTS = 3;

export async function signIn(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(DEMO_EMAIL);
  await page.getByPlaceholder("Your password").fill(DEMO_PASSWORD);

  for (let attempt = 1; attempt <= SIGN_IN_ATTEMPTS; attempt++) {
    const [response] = await Promise.all([
      page.waitForResponse(
        (candidate) =>
          candidate.request().method() === "POST" &&
          new URL(candidate.url()).pathname.endsWith("/login"),
      ),
      page.getByRole("button", { name: "Sign in" }).click(),
    ]);

    if (response.status() !== 429) break;
    if (attempt < SIGN_IN_ATTEMPTS) await page.waitForTimeout(THROTTLE_WINDOW_MS);
  }

  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

export async function resetSandbox(page: Page): Promise<void> {
  await page.goto("/");

  const reset = page.getByRole("button", { name: "Reset", exact: true });
  await expect(reset).toBeEnabled();

  const provisioned = page.waitForResponse(
    (response) => response.url().includes("/demo/reset") && response.ok(),
  );
  await reset.click();
  await provisioned;
  await expect(reset).toBeEnabled();
}

export async function openGroup(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name, exact: true }).first().click();
}

export function fixtureRow(page: Page, home: string, away: string): Locator {
  return page
    .getByTestId("fixture-row")
    .filter({ has: page.locator(`[data-testid="mini-stepper"][data-label="${home}"]`) })
    .filter({ has: page.locator(`[data-testid="mini-stepper"][data-label="${away}"]`) })
    .first();
}

export async function setScore(
  scope: Locator,
  kind: "mini-stepper" | "stepper",
  team: string,
  target: number,
): Promise<void> {
  const stepper = scope.locator(`[data-testid="${kind}"][data-label="${team}"]`).first();
  const more = kind === "mini-stepper" ? `One more for ${team}` : `One more goal for ${team}`;
  const fewer = kind === "mini-stepper" ? `One fewer for ${team}` : `One fewer goal for ${team}`;

  await expect(stepper).toBeVisible();

  for (let attempt = 0; attempt < 40; attempt++) {
    const current = Number(await stepper.getAttribute("data-value"));
    if (current === target) break;
    await stepper.getByRole("button", { name: current < target ? more : fewer }).click();
  }

  await expect(stepper).toHaveAttribute("data-value", String(target));
}

export function consequenceRow(page: Page, team: string): Locator {
  return page.locator(`[data-testid="consequence-row"][data-team="${team}"]`);
}

export function standingsRow(page: Page, team: string): Locator {
  return page.locator(`[data-testid="standings-row"][data-team="${team}"]`);
}

export function projectedRow(page: Page, team: string): Locator {
  return page.locator(`[data-testid="projected-row"][data-team="${team}"]`);
}

export async function tieCoordinates(page: Page, team: string): Promise<string> {
  const tie = page.getByTestId("bracket-tie").filter({ hasText: team }).first();
  await expect(tie).toBeVisible();
  const round = await tie.getAttribute("data-round");
  const slot = await tie.getAttribute("data-slot");
  return `r${round}s${slot}`;
}

export async function upsetGroupA(page: Page): Promise<void> {
  await page.goto("/console");
  await openGroup(page, GROUP_A.name);

  const row = fixtureRow(page, GROUP_A.leader, GROUP_A.bottom);
  await setScore(row, "mini-stepper", GROUP_A.leader, 0);
  await setScore(row, "mini-stepper", GROUP_A.bottom, 3);
  await expect(row).toHaveAttribute("data-status", "saved");

  await page.reload();
  await openGroup(page, GROUP_A.name);

  const persisted = fixtureRow(page, GROUP_A.leader, GROUP_A.bottom);
  await expect(
    persisted.locator(`[data-testid="mini-stepper"][data-label="${GROUP_A.leader}"]`),
  ).toHaveAttribute("data-value", "0");
  await expect(
    persisted.locator(`[data-testid="mini-stepper"][data-label="${GROUP_A.bottom}"]`),
  ).toHaveAttribute("data-value", "3");
}
