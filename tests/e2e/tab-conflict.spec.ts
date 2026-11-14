import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { STORAGE_KEY } from "../../src/features/prototype/storage";

async function profile(page: Page) {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.goto("/#/app/profil");
}
async function savedName(page: Page) {
  return page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).people.find(
        (p: { id: string }) => p.id === "candidate-anna",
      ).name,
    STORAGE_KEY,
  );
}
test("two tabs preserve the winner and export the losing edits; closing and reloading resumes writing", async ({
  page,
  context,
}) => {
  await profile(page);
  const second = await context.newPage();
  await second.goto("/#/app/profil");
  await expect(second.getByText(/Inna karta może zapisywać/)).toBeVisible();
  await page.getByLabel("Imię i nazwisko", { exact: true }).fill("Pierwsza karta");
  await second.getByLabel("Imię i nazwisko", { exact: true }).fill("Druga karta");
  await Promise.all(
    [page, second].map((p) =>
      p.getByRole("button", { name: "Zapisz profil", exact: true }).click(),
    ),
  );
  expect(await savedName(second)).toBe("Pierwsza karta");
  await expect(second.getByText("Profil został zapisany.", { exact: true })).toHaveCount(0);
  const downloading = second.waitForEvent("download");
  await second.getByRole("button", { name: "Eksportuj zmiany tej karty" }).focus();
  await second.keyboard.press("Enter");
  const exported = JSON.parse(await readFile((await (await downloading).path())!, "utf8"));
  expect(exported.people.find((p: { id: string }) => p.id === "candidate-anna").name).toBe(
    "Druga karta",
  );
  await second.goto("/#/app/settings");
  await second.getByRole("button", { name: "Resetuj scenariusz", exact: true }).click();
  await second.getByRole("button", { name: "Resetuj", exact: true }).click();
  await expect(second.getByText("Przywrócono scenariusz początkowy.")).toHaveCount(0);
  await second.getByLabel("Importuj plik scenariusza").setInputFiles({
    name: "copy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(exported)),
  });
  await second.getByRole("button", { name: "Importuj", exact: true }).click();
  expect(await savedName(second)).toBe("Pierwsza karta");
  await expect(second.getByText("Dane zostały zaimportowane.")).toHaveCount(0);
  await expect(second.getByRole("alertdialog")).toHaveCount(0);
  for (const width of [1280, 390, 320]) {
    await second.setViewportSize({ width, height: 900 });
    await second.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    expect(await second.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await second.screenshot({ path: `artifacts/tab-conflict/${width}.png`, fullPage: true });
  }
  await page.close();
  await second.reload();
  await expect(second.getByText(/Inna karta może zapisywać/)).toHaveCount(0);
  await second.goto("/#/app/profil");
  await expect(second.getByLabel("Imię i nazwisko", { exact: true })).toHaveValue("Pierwsza karta");
  await second.getByLabel("Imię i nazwisko", { exact: true }).fill("Po odzyskaniu");
  await second.getByRole("button", { name: "Zapisz profil", exact: true }).click();
  expect(await savedName(second)).toBe("Po odzyskaniu");
});
test("external storage clearing blocks the owner without replacing local edits", async ({
  page,
  context,
}) => {
  await profile(page);
  const second = await context.newPage();
  await second.goto("/");
  await second.evaluate(() => localStorage.clear());
  await expect(page.getByText(/Inna karta może zapisywać/)).toBeVisible();
  await page.getByLabel("Imię i nazwisko", { exact: true }).fill("Do eksportu");
  await page.getByRole("button", { name: "Zapisz profil", exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  await expect(page.getByRole("button", { name: "Eksportuj zmiany tej karty" })).toBeVisible();
});
test("snapshot check catches same-document changes even without a storage event", async ({
  page,
}) => {
  await profile(page);
  await page.evaluate((key) => {
    const s = JSON.parse(localStorage.getItem(key)!);
    s.people[0].name = "External";
    localStorage.setItem(key, JSON.stringify(s));
  }, STORAGE_KEY);
  await page.getByLabel("Imię i nazwisko", { exact: true }).fill("Local");
  await page.getByRole("button", { name: "Zapisz profil", exact: true }).click();
  expect(await savedName(page)).toBe("External");
  await expect(page.getByText(/Inna karta może zapisywać/)).toBeVisible();
});
test("missing Web Locks keeps changes exportable without writing", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "locks", { value: undefined }));
  await profile(page);
  await expect(page.getByText(/Ta przeglądarka nie pozwala/)).toBeVisible();
  await page.getByLabel("Imię i nazwisko", { exact: true }).fill("Tylko lokalnie");
  await page.getByRole("button", { name: "Zapisz profil", exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  await expect(page.getByRole("button", { name: "Eksportuj zmiany tej karty" })).toBeVisible();
});
