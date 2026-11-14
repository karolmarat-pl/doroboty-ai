import { expect, test, type Page } from "@playwright/test";
import { gunzipSync } from "node:zlib";

type CapturedEvent = { event: string; properties: Record<string, unknown> };

async function interceptAnalytics(page: Page) {
  const events: CapturedEvent[] = [];
  const origin = "https://analytics.example";
  // Production bot filtering stays enabled; this isolated test represents a normal browser.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    // Isolate SDK tests from the dev StrictMode Web Lock acquisition race.
    // Real lock contention and persistence are exercised by the static-build journeys.
    Object.defineProperty(navigator, "locks", {
      value: {
        request: async (name: string, _options: unknown, callback: (lock: unknown) => unknown) =>
          callback({ name, mode: "exclusive" }),
      },
    });
  });
  await page.route(`${origin}/**`, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: `http://127.0.0.1:3107${url.pathname}${url.search}`,
    });
    await route.fulfill({ response });
  });
  await page.route("https://eu-assets.i.posthog.com/**", async (route) => {
    await route.fulfill({
      json: {
        sessionRecording: { endpoint: "/s/", minimumDurationMilliseconds: 0 },
        autocapture_opt_out: false,
        supportedCompression: [],
      },
    });
  });
  await page.route("https://eu.i.posthog.com/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.includes("flags")) {
      await route.fulfill({
        json: {
          featureFlags: {},
          sessionRecording: { endpoint: "/s/", minimumDurationMilliseconds: 0 },
          autocapture_opt_out: false,
          supportedCompression: [],
        },
      });
      return;
    }
    const body = request.postDataBuffer();
    if (body) {
      let decoded = body;
      if (body[0] === 0x1f && body[1] === 0x8b) decoded = gunzipSync(body);
      const raw = decoded.toString();
      const data = raw.startsWith("data=")
        ? Buffer.from(new URLSearchParams(raw).get("data")!, "base64").toString()
        : raw;
      const parsed = JSON.parse(data) as
        CapturedEvent | CapturedEvent[] | { batch: CapturedEvent[] };
      events.push(
        ...(Array.isArray(parsed) ? parsed : "batch" in parsed ? parsed.batch : [parsed]),
      );
    }
    await route.fulfill({ json: { status: 1 } });
  });
  return { events, origin };
}

test("real SDK sends initial and hash-route pageviews once, including history navigation", async ({
  page,
}) => {
  const { events, origin } = await interceptAnalytics(page);
  const paths = () =>
    events
      .filter((event) => event.event === "$pageview")
      .map((event) => event.properties.$pathname);
  await page.goto(`${origin}/#/polityka-prywatnosci`);
  await expect.poll(paths).toEqual(["/polityka-prywatnosci"]);
  await expect(page.getByText("oraz nagrywa sesje bez maskowania", { exact: false })).toBeVisible();
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 850 });
    await page.screenshot({
      path: `artifacts/posthog-pageviews/privacy-${width}.png`,
      fullPage: true,
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 1280, height: 850 });
  await page
    .getByRole("navigation", { name: "Główna nawigacja" })
    .getByRole("link", { name: "Oferty", exact: true })
    .click();
  await expect.poll(paths).toEqual(["/polityka-prywatnosci", "/oferty"]);
  await page.evaluate(() => {
    window.location.hash = "/oferty?category=Build";
  });
  await page.goBack();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Prywatność prototypu", exact: true }),
  ).toBeVisible();
  await expect.poll(paths).toEqual(["/polityka-prywatnosci", "/oferty", "/polityka-prywatnosci"]);
  await page.goForward();
  await expect
    .poll(paths)
    .toEqual(["/polityka-prywatnosci", "/oferty", "/polityka-prywatnosci", "/oferty"]);
  for (const event of events.filter((event) => event.event === "$pageview")) {
    expect(event.properties.$current_url).not.toContain("category=");
    expect(event.properties).not.toHaveProperty("$referrer");
  }
});

test("real recorder keeps synthetic private-screen, dialog and input content while autocapture excludes it", async ({
  page,
}) => {
  const { events, origin } = await interceptAnalytics(page);
  const snapshots = () =>
    JSON.stringify(
      events.filter((event) => event.event === "$snapshot"),
      (_key, value) =>
        typeof value === "string" && value.startsWith("\x1f\x8b")
          ? JSON.parse(gunzipSync(Buffer.from(value, "latin1")).toString())
          : value,
    );
  const interactions = () => events.filter((event) => event.event === "$autocapture").length;
  const latestView = () =>
    events.filter((event) => event.event === "$pageview").at(-1)?.properties.$pathname;
  await page.goto(`${origin}/#/auth/sign-in`);
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.getByRole("link", { name: "Profil", exact: true }).click();
  await expect.poll(latestView).toBe("/app/profil");
  const beforeInput = interactions();
  const input = page.getByLabel("Imię i nazwisko");
  await input.fill("SYNTHETIC_REPLAY_INPUT_VISIBLE");
  await page.getByRole("button", { name: "Zapisz profil", exact: true }).click();
  await expect
    .poll(() => events.filter((event) => event.event === "candidate_profile_saved").length)
    .toBe(1);
  expect(events.some((event) => event.event === "$identify")).toBe(false);
  await expect
    .poll(() => snapshots().includes("SYNTHETIC_REPLAY_INPUT_VISIBLE"), { timeout: 15000 })
    .toBe(true);
  expect(snapshots()).toContain("Anna Kowalska");
  expect(interactions()).toBe(beforeInput);
  await page.getByRole("link", { name: "Ustawienia", exact: true }).click();
  await expect.poll(latestView).toBe("/app/settings");
  const beforeDialog = interactions();
  await page.getByRole("button", { name: "Resetuj scenariusz", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect
    .poll(() => snapshots().includes("Zresetować scenariusz?"), { timeout: 15000 })
    .toBe(true);
  expect(interactions()).toBe(beforeDialog);
  await page.getByRole("button", { name: "Anuluj", exact: true }).click();
});

test("analytics test remains honest offline and private routes carry the exclusion boundary", async ({
  page,
}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/#/polityka-prywatnosci");
    const button = page.getByRole("button", { name: "Test PostHog", exact: true });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("Pomiar jest niedostępny");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.goto("/#/auth/sign-in");
  await expect(
    page
      .locator("[data-analytics-private]")
      .getByRole("heading", { name: "Wybierz osobę", exact: true }),
  ).toBeVisible();
});

test("person-picker keyboard navigation works offline without analytics requests", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://")) external.push(request.url());
  });
  await page.goto("/");
  const picker = page.getByRole("link", { name: "Wybierz osobę", exact: true });
  await picker.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Wybierz osobę", exact: true })).toBeVisible();
  expect(external).toEqual([]);
});
