import { test, expect } from "@playwright/test";

test("opening waits for its photograph before continuing to login", async ({
  page,
}) => {
  let releaseImage!: () => void;
  const imageGate = new Promise<void>((resolve) => {
    releaseImage = resolve;
  });
  await page.route(/11-249-imgImage5\.png/, async (route) => {
    await imageGate;
    await route.continue();
  });
  try {
    await page.goto("/");
    await expect(page.getByTestId("launch-screen")).toBeVisible();
    // A cold or slow connection must not skip the opening before the image arrives.
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL("/");
    releaseImage();
    const photo = page.getByRole("img", {
      name: "Carro elétrico conectado a um eletroposto à noite",
    });
    await expect(photo).toBeVisible();
    await expect
      .poll(() =>
        photo.evaluate(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expect(
      page.getByText("Mais energia.", { exact: false }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
    await expect(
      page.getByRole("button", { name: "Entrar", exact: true }),
    ).toBeVisible();
  } finally {
    releaseImage();
  }
});

for (const route of ["login", "home", "map", "charging", "profile"]) {
  test(`phone mockup chrome is absent on ${route}`, async ({ page }) => {
    await page.goto(`/${route}`);
    await expect(page.getByRole("img").first()).toBeVisible();
    await expect(page.getByText("9:41", { exact: true })).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("9:41");
  });
}
