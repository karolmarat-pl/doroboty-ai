import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function choose(page: Page, name: string) {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: `Wejdź jako ${name}`, exact: true }).click();
}
async function start(page: Page) {
  await choose(page, "Karolina Wiśniewska");
  await page.goto("/#/app/kandydaci/application-example");
  await page.getByRole("link", { name: "Przygotuj rozmowę", exact: true }).click();
  await expect(
    page.getByText("Symulacja · przygotowany scenariusz", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zapisz obszary i przejdź do rozmowy" }).click();
}
async function prepare(page: Page) {
  await page.getByRole("button", { name: "Wczytaj przygotowane odpowiedzi" }).click();
  await page.getByRole("button", { name: "Zastąp odpowiedzi przykładem", exact: true }).click();
}
async function finish(page: Page, count = 4) {
  for (let index = 0; index < count; index++)
    await page.getByRole("button", { name: "Następne pytanie" }).click();
  await page.getByRole("button", { name: "Zakończ symulowaną rozmowę", exact: true }).click();
}

test("prepared conversation, linked quotes and immediate persisted report invalidation", async ({
  page,
}) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://127.0.0.1:") &&
      !request.url().startsWith("data:") &&
      !request.url().startsWith("blob:")
    )
      external.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await start(page);
  await expect(page.getByLabel("Jaki problem rozwiązywał projekt", { exact: false })).toHaveValue(
    "",
  );
  await prepare(page);
  await finish(page);
  await expect(page.getByText("Przykładowy wynik · bez analizy AI", { exact: true })).toBeVisible();
  const map = page.getByRole("navigation", { name: "Mapa projektu", exact: true });
  await expect(map.getByRole("button")).toHaveCount(5);
  await expect(page.locator(".project-map-detail")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Plusy odpowiedzi", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Minusy odpowiedzi", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Plusy odpowiedzi", exact: true })).toContainText(
    "Porównaliśmy 100 zgłoszeń",
  );
  await expect(page.getByRole("region", { name: "Minusy odpowiedzi", exact: true })).toContainText(
    "nie mieliśmy grupy kontrolnej",
  );
  await expect(
    map.getByRole("button", { name: "Przejdź do obszaru: Sprawdzenie", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByText("Wymaganie z opisu stanowiska", { exact: true }).click();
  await expect(page.locator(".conversation-requirement")).toContainText(
    "porównacie wynik z punktem wyjścia",
  );
  await page.screenshot({
    path: "artifacts/project-conversation-pros-cons/result-desktop.png",
    fullPage: true,
  });
  expect(
    (await new AxeBuilder({ page }).include(".project-conversation").analyze()).violations,
  ).toEqual([]);
  const contribution = map.getByRole("button", {
    name: "Przejdź do obszaru: Mój wkład",
    exact: true,
  });
  await contribution.focus();
  await page.keyboard.press("Space");
  await expect(contribution).toBeFocused();
  await expect(contribution).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".conversation-quote")).toContainText("Sam przeprowadziłem 8 rozmów");
  await expect(
    page.getByText(
      "Ta odpowiedź nie wskazuje konkretnego minusa; kwestie do sprawdzenia znajdziesz poniżej",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Odpowiedzi źródłowe", exact: true }).click();
  await map.getByRole("button", { name: "Przejdź do obszaru: Decyzja", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Objaśnienie", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(".conversation-quote")).toContainText("zamiast automatycznej wysyłki");
  await expect(page.getByRole("region", { name: "Minusy odpowiedzi", exact: true })).toContainText(
    "Nie porównaliśmy jeszcze kosztów obu rozwiązań.",
  );
  await map.getByRole("button", { name: "Przejdź do obszaru: Problem", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Punkt wyjścia rozmowy", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Plusy odpowiedzi", exact: true })).toContainText(
    "bez pogorszenia jakości",
  );
  await expect(page.locator(".project-map-empty-cons")).toBeVisible();
  await map.getByRole("button", { name: "Przejdź do obszaru: Ograniczenia", exact: true }).click();
  await expect(page.getByRole("region", { name: "Minusy odpowiedzi", exact: true })).toContainText(
    "W kolejnym pilocie ustaliłbym właściciela aktualizacji materiałów",
  );
  await map.getByRole("button", { name: "Przejdź do obszaru: Sprawdzenie", exact: true }).click();
  await page
    .getByRole("button", { name: "Przejdź do odpowiedzi: Sprawdzanie rezultatów", exact: true })
    .click();
  const answer = page.getByRole("textbox", { name: "Jak sprawdziliście wynik?", exact: false });
  await expect(answer).toBeFocused();
  await answer.fill("Zmieniona odpowiedź: nie mierzyliśmy czasu ani jakości rozwiązania.");
  await page.getByRole("button", { name: "Objaśnienie dla rekrutera" }).click();
  await expect(page.getByRole("heading", { name: "Objaśnienie jest niedostępne" })).toBeVisible();
  await expect(page.locator(".conversation-quote")).toHaveCount(0);
  await expect(page.locator(".project-map-report .project-map-route")).toHaveCount(0);
  await expect(page.locator(".project-map-assessment")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Objaśnienie dla rekrutera" }).click();
  await expect(page.locator(".conversation-quote")).toHaveCount(0);
  await expect(page.locator(".project-map-assessment")).toHaveCount(0);
  await page.getByRole("tab", { name: "Odpowiedzi źródłowe", exact: true }).click();
  await expect(
    page.getByText("Zmieniona odpowiedź: nie mierzyliśmy czasu ani jakości rozwiązania.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Wróć do rozmowy", exact: true }).click();
  await finish(page);
  await expect(page.getByRole("heading", { name: "Objaśnienie jest niedostępne" })).toBeVisible();
  await expect(page.locator(".project-map-assessment")).toHaveCount(0);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("area selection, candidate journey, keyboard and company boundaries", async ({ page }) => {
  await choose(page, "Karolina Wiśniewska");
  await page.goto("/#/app/kandydaci/application-example/rozmowa");
  for (const label of ["Własny wkład", "Decyzje i kompromisy", "Ograniczenia i błędy"])
    await page.getByRole("checkbox", { name: label, exact: false }).uncheck();
  const last = page.getByRole("checkbox", { name: "Sprawdzanie rezultatów", exact: false });
  await last.focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Zapisz obszary i przejdź do rozmowy" }),
  ).toBeDisabled();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Zapisz obszary i przejdź do rozmowy" }).click();
  await choose(page, "Marek Nowak");
  await page.goto("/#/app/aplikacje/application-example");
  await page.getByRole("link", { name: "Otwórz rozmowę", exact: true }).click();
  await prepare(page);
  await finish(page, 1);
  await expect(page.getByRole("heading", { name: "Rozmowa została zakończona" })).toBeVisible();
  await expect(page.locator(".project-map-assessment")).toHaveCount(0);
  await expect(page.getByText("Przykładowy wynik · bez analizy AI", { exact: true })).toHaveCount(
    0,
  );
  await choose(page, "Karolina Wiśniewska");
  await page.goto("/#/app/kandydaci/application-example/rozmowa");
  const resultMap = page.getByRole("navigation", { name: "Mapa projektu", exact: true });
  await expect(resultMap.getByRole("button")).toHaveCount(2);
  await expect(
    resultMap.getByRole("button", { name: "Przejdź do obszaru: Decyzja", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".project-map-detail")).toHaveCount(1);
  await page.getByRole("button", { name: "Obszary do sprawdzenia" }).click();
  await page.getByRole("checkbox", { name: "Własny wkład", exact: false }).check();
  await page.getByRole("button", { name: "Zapisz obszary i przejdź do rozmowy" }).click();
  await page.getByRole("button", { name: "Objaśnienie dla rekrutera" }).click();
  await expect(page.locator(".conversation-quote")).toHaveCount(0);
  await expect(page.locator(".project-map-assessment")).toHaveCount(0);
  for (const [person, route] of [
    ["Tomasz Zieliński", "kandydaci"],
    ["Anna Kowalska", "aplikacje"],
  ]) {
    await choose(page, person);
    await page.goto(`/#/app/${route}/application-example/rozmowa`);
    await expect(page.getByRole("heading", { name: "Nie znaleziono strony" })).toBeVisible();
  }
});

test("responsive conversation and long answers remain readable", async ({ page }) => {
  await start(page);
  await prepare(page);
  await page.getByRole("textbox").fill("Bardzo długi opis wkładu i decyzji kandydata. ".repeat(45));
  for (const width of [
    1280, 1101, 1100, 1099, 851, 850, 849, 701, 700, 699, 601, 600, 599, 390, 320,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const box = await page.getByRole("textbox").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/project-conversation-pros-cons/conversation-mobile.png",
    fullPage: true,
  });
  await prepare(page);
  await finish(page);
  await page.screenshot({
    path: "artifacts/project-conversation-pros-cons/result-mobile.png",
    fullPage: true,
  });
  expect(
    (await new AxeBuilder({ page }).include(".project-conversation").analyze()).violations,
  ).toEqual([]);
  for (const width of [1280, 1100, 851, 850, 849, 601, 600, 599, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    for (const selector of [
      ".project-map-route",
      ".project-map-detail",
      ".conversation-quote",
      ".project-map-meaning",
      ".project-map-assessment",
    ]) {
      const bounds = await page.locator(selector).boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
