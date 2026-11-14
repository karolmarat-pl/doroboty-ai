import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { STORAGE_KEY } from "../../src/features/prototype/storage";

test("a downloaded scenario restores into an isolated browser and survives reload", async ({
  page,
  browser,
}) => {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.goto("/#/app/profil");
  await page.getByLabel("Imię i nazwisko").fill("Anna — próba odtworzenia");
  await page.getByRole("button", { name: "Zapisz profil", exact: true }).click();
  await page.goto("/#/app/settings");
  const expected = JSON.parse(
    await page.evaluate((key) => localStorage.getItem(key)!, STORAGE_KEY),
  );
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Eksportuj dane" }).click();
  const raw = await readFile((await (await downloading).path())!, "utf8");
  expect(JSON.parse(raw)).toEqual(expected);
  const context = await browser.newContext();
  try {
    const restored = await context.newPage();
    await restored.goto("http://127.0.0.1:3106/#/auth/sign-in");
    await restored.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
    await restored.goto("http://127.0.0.1:3106/#/app/settings");
    await restored.getByLabel("Importuj plik scenariusza").setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(raw),
    });
    await restored.getByRole("button", { name: "Importuj", exact: true }).click();
    await expect(restored.getByRole("status")).toContainText("Dane zostały zaimportowane");
    await restored.reload();
    expect(
      JSON.parse(await restored.evaluate((key) => localStorage.getItem(key)!, STORAGE_KEY)),
    ).toEqual(expected);
    await expect(
      restored.getByText("Anna — próba odtworzenia", { exact: true }).first(),
    ).toBeVisible();
    expect(
      JSON.parse(await page.evaluate((key) => localStorage.getItem(key)!, STORAGE_KEY)),
    ).toEqual(expected);
  } finally {
    await context.close();
  }
});
