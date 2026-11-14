import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { STORAGE_KEY } from "../../src/features/prototype/storage";

for (const trigger of ["click", "timer", "promise"] as const) {
  test(`${trigger} failure preserves saved data, reports safely and recovers`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/#/auth/sign-in");
    await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
    const before = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(before).not.toBeNull();
    await page.evaluate((trigger) => {
      const fail = () => {
        throw new Error("PRIVATE_RUNTIME_TEXT");
      };
      if (trigger === "timer") setTimeout(fail, 0);
      else if (trigger === "promise") void Promise.reject(new Error("PRIVATE_RUNTIME_TEXT"));
      else {
        const button = document.createElement("button");
        button.textContent = "Test fault";
        button.addEventListener("click", fail);
        document.body.append(button);
        button.click();
        button.remove();
      }
    }, trigger);
    const heading = page.getByRole("heading", { name: "Wystąpił błąd aplikacji" });
    await expect(heading).toBeFocused();
    await expect(page.getByRole("link", { name: "karolmarat@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:karolmarat@gmail.com",
    );
    const firstDownload = page.waitForEvent("download");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Pobierz raport błędu" })).toBeFocused();
    await page.keyboard.press("Enter");
    const raw = await readFile((await (await firstDownload).path())!, "utf8");
    const report = JSON.parse(raw);
    expect(Object.keys(report).sort()).toEqual(["code", "occurredAt", "reference"]);
    expect(report.code).toBe(trigger === "promise" ? "UNHANDLED_REJECTION" : "RUNTIME_FAILURE");
    expect(raw).not.toContain("PRIVATE_RUNTIME_TEXT");
    // Repeated failures must not replace the first report or refocus the page.
    await page.evaluate(() => {
      window.dispatchEvent(
        new ErrorEvent("error", { message: "PRIVATE_REPEAT", cancelable: true }),
      );
    });
    const again = page.waitForEvent("download");
    await page.keyboard.press("Enter");
    expect(await readFile((await (await again).path())!, "utf8")).toBe(raw);
    expect(errors.join(" ")).not.toContain("PRIVATE_");
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(before);
    await page.getByRole("button", { name: "Uruchom ponownie" }).click();
    await expect(heading).toHaveCount(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(before);
  });
}

test("download failure offers a manual report without replacing the incident", async ({ page }) => {
  await page.goto("/#/oferty");
  await page.evaluate(() => {
    setTimeout(() => {
      throw new Error("PRIVATE_DOWNLOAD_TEST");
    }, 0);
  });
  await expect(page.getByRole("heading", { name: "Wystąpił błąd aplikacji" })).toBeVisible();
  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new Error("PRIVATE_DOWNLOAD_FAILURE");
    };
  });
  await page.getByRole("button", { name: "Pobierz raport błędu" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Nie udało się pobrać raportu" }),
  ).toContainText("RUNTIME_FAILURE");
  await expect(page.locator("body")).not.toContainText("PRIVATE_");
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: "artifacts/runtime-recovery/download-failure-320.png",
    fullPage: true,
  });
});

test("render failure offers private diagnostics and reload preserves saved work", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  const before = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  await page.goto("/#/oferty");
  // Throw only once per tab, during rendered salary formatting; never add a product crash route.
  await page.addInitScript(() => {
    if (sessionStorage.getItem("test-render-crash")) return;
    sessionStorage.setItem("test-render-crash", "done");
    Object.defineProperty(Intl.NumberFormat.prototype, "format", {
      get() {
        throw new Error("PRIVATE_TEST_TEXT");
      },
    });
  });

  await page.reload();
  await expect(page.getByRole("heading", { name: "Wystąpił błąd aplikacji" })).toBeVisible();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pobierz raport błędu" }).focus();
  await page.keyboard.press("Enter");
  const raw = await readFile((await (await downloading).path())!, "utf8");
  const report = JSON.parse(raw);
  expect(Object.keys(report).sort()).toEqual(["code", "occurredAt", "reference"]);
  expect(report.code).toBe("UI_RENDER_FAILURE");
  expect(Number.isNaN(Date.parse(report.occurredAt))).toBe(false);
  expect(raw).not.toContain("PRIVATE_TEST_TEXT");
  expect(consoleErrors.join(" ")).not.toContain("PRIVATE_TEST_TEXT");
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(before);
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `artifacts/error-recovery/${width}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Uruchom ponownie" }).click();
  await expect(page.getByRole("heading", { name: "Wystąpił błąd aplikacji" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(before);
});
