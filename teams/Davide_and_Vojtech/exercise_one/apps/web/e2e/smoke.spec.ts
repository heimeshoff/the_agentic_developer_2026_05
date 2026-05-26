import { expect, test } from "@playwright/test";

test("app shell renders without console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Personal Finance" })).toBeVisible();

  await page.screenshot({ path: "../../tasks/done/evidence/t-004.png", fullPage: true });

  expect(consoleErrors, `unexpected console errors: ${consoleErrors.join(", ")}`).toEqual([]);
});
