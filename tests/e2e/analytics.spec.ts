import { expect, test } from "@playwright/test";

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
