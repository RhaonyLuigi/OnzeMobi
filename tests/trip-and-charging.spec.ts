import { test, expect } from "@playwright/test";

test("Viagem opens the assistant even while a charging session is active", async ({
  page,
}) => {
  await page.goto("/configure");
  await page.getByRole("button", { name: "Calcular valor" }).click();
  await page.getByRole("button", { name: "Confirmar e iniciar" }).click();
  await page
    .getByRole("button", { name: "Voltar para o início", exact: true })
    .click();
  await expect(
    page.getByText("Recarga em andamento", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Viagem", exact: true }).click();
  await expect(page).toHaveURL(/\/trip$/);
  await expect(
    page.getByRole("textbox", { name: "Mensagem para o assistente de viagem" }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "Viagem" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByText("Modo demonstração · conversa e rota simuladas"),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Perfil", exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText("Meu Perfil", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Viagem", exact: true }).click();
  await expect(page).toHaveURL(/\/trip$/);
});

test("chat collects a destination and origin, rejects identical cities, and offers a cheaper demo plan", async ({
  page,
}) => {
  await page.goto("/trip");
  const input = page.getByRole("textbox", {
    name: "Mensagem para o assistente de viagem",
  });
  await expect(
    page.getByRole("button", { name: "Enviar mensagem" }),
  ).toBeDisabled();
  await input.fill("Quero ir para Goiânia");
  await input.press("Enter");
  await expect(page.getByText(/De qual cidade você vai sair/)).toBeVisible();
  await input.fill("Goiânia");
  await input.press("Enter");
  await expect(page.getByText(/A origem e o destino são iguais/)).toBeVisible();
  await input.fill("Brasília");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  const plan = page.locator('[data-testid="trip-plan"]:visible');
  await expect(plan).toBeVisible();
  await expect(plan.getByText("Goiânia", { exact: true })).toBeVisible();
  await expect(plan.getByText("Brasília", { exact: true })).toBeVisible();
  await expect(plan.getByText(/Trajeto hipotético de 420 km/)).toBeVisible();
  const parseCost = (text: string | null) =>
    Number(text!.replace(/[^\d,]/g, "").replace(",", "."));
  const fastCost = parseCost(await plan.getByText(/^R\$/).textContent());
  await page.getByRole("radio", { name: "Menor custo", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Menor custo" }),
  ).toHaveAttribute("aria-checked", "true");
  const cheapCost = parseCost(await plan.getByText(/^R\$/).textContent());
  expect(cheapCost).toBeLessThan(fastCost);
  await page.getByRole("button", { name: "Ver paradas da viagem" }).click();
  await expect(plan.getByText("Eletroposto de exemplo 01")).toBeVisible();
  await page.getByRole("tab", { name: "Inicio", exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByRole("button", { name: "Encontrar carregadores" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Viagem", exact: true }).click();
  await expect(page.locator('[data-testid="trip-plan"]:visible')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-testid="trip-plan"]:visible')).toBeVisible();
  await page.getByRole("button", { name: "Nova conversa" }).click();
  await expect(page.locator('[data-testid="trip-plan"]:visible')).toHaveCount(
    0,
  );
  await expect(input).toHaveValue("");
});

test("assistant accepts an entire journey and fewer stops without claiming real station data", async ({
  page,
}) => {
  await page.goto("/trip");
  await page
    .getByRole("button", { name: "De Brasília para São Paulo", exact: true })
    .click();
  await expect(page.locator('[data-testid="trip-plan"]:visible')).toBeVisible();
  await page.getByRole("radio", { name: "Menos paradas", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Menos paradas" }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(
    page
      .locator('[data-testid="trip-plan"]:visible')
      .getByText(/não representam uma rota real/),
  ).toBeVisible();
});

test("charging information survives reload and its home button remains fixed on a small screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/configure");
  await page
    .getByRole("slider", { name: "Nível de bateria desejado" })
    .fill("90");
  await page.getByRole("button", { name: "Calcular valor" }).click();
  await page.getByRole("button", { name: "Confirmar e iniciar" }).click();
  await page.reload();
  await expect(page.getByText("Potência média", { exact: true })).toBeVisible();
  const home = page.getByRole("button", {
    name: "Voltar para o início",
    exact: true,
  });
  await expect(home).toBeVisible();
  const before = await home.boundingBox();
  expect(before!.y + before!.height).toBeLessThan(740);
  await page
    .getByText("Informações da sessão", { exact: true })
    .scrollIntoViewIfNeeded();
  await expect(page.getByText("90%", { exact: true })).toBeVisible();
  await expect(page.getByText("ONZE-001", { exact: true })).toBeVisible();
  const after = await home.boundingBox();
  expect(after!.y).toBeCloseTo(before!.y, 0);
  await home.click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByText("Recarga em andamento", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver detalhes de recarga" }).click();
  await expect(page).toHaveURL(/\/charging$/);
});
