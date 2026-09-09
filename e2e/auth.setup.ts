import { test as setup } from "@playwright/test";
import { ORGANIZER_STATE, signIn } from "./support/app";

setup.setTimeout(300_000);

setup("sign in as the demo organizer", async ({ page }) => {
  await signIn(page);
  await page.context().storageState({ path: ORGANIZER_STATE });
});
