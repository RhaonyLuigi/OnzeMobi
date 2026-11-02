import { test, expect } from "@playwright/test";
import { seedDriver } from "./fixtures";

test("login validates empty fields, toggles password visibility, and opens the app", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Preencha");
  await page
    .getByRole("textbox", { name: "E-mail ou telefone" })
    .fill("teste@exemplo.com");
  await page.getByLabel("Senha", { exact: true }).fill("exemplo123");
  await page.getByRole("button", { name: "Mostrar senha" }).click();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/home/);
  await expect(
    page.getByRole("button", { name: "Encontrar carregadores" }),
  ).toBeVisible();
});

test("map search and station selection lead to the charge configuration", async ({
  page,
}) => {
  await seedDriver(page);
  await page.goto("/map");
  await page
    .getByRole("textbox", { name: "Pesquisar carregadores" })
    .fill("inexistente");
  await expect(page.getByText("Nenhum carregador encontrado.")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Pesquisar carregadores" })
    .fill("Taguatinga");
  await page
    .getByRole("button", { name: "Taguatinga Shopping", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Recarregar" })).toBeVisible();
  await page.getByRole("radio", { name: "CCS 2" }).click();
  await expect(page.getByRole("radio", { name: "CCS 2" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("button", { name: "Recarregar" }).click();
  await expect(page).toHaveURL(/configure/);
});

test("charge slider updates its quote and a completed session persists in history", async ({
  page,
}) => {
  await seedDriver(page);
  await page.goto("/configure");
  await page
    .getByRole("slider", { name: "Nível de bateria desejado" })
    .fill("90");
  await expect(page.getByText("+ 22,5 kWh", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Calcular valor" }).click();
  await expect(page.getByText("R$ 49,50", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar e iniciar" }).click();
  await expect(page).toHaveURL(/charging/);
  await page.getByRole("button", { name: "Detalhes da recarga" }).click();
  await page
    .getByRole("button", { name: "Concluir recarga de exemplo" })
    .click();
  await expect(page.getByText("Recarga concluída!")).toBeVisible();
  await page.getByRole("button", { name: "Ver histórico" }).click();
  await expect(
    page.getByText("22,5 kWh", { exact: false }).last(),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Ver histórico" }).click();
  await expect(
    page.getByText("Taguatinga Shopping", { exact: true }),
  ).toBeVisible();
});

test("vehicle form validates, saves and persists a newly registered vehicle", async ({
  page,
}) => {
  await page.goto("/garage");
  await page
    .getByRole("button", { name: "Adicionar veículo", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Cadastrar Veículo", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Selecione");
  await page
    .getByRole("button", { name: "Marca do veículo", exact: true })
    .click();
  await page.getByRole("button", { name: "BYD", exact: true }).click();
  await page
    .getByRole("button", { name: "Modelo do veículo", exact: true })
    .click();
  await page.getByRole("button", { name: "Dolphin", exact: true }).click();
  await page.getByRole("textbox", { name: "Placa do veículo" }).fill("ABC1D23");
  await page
    .getByRole("button", { name: "Cadastrar Veículo", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "BYD Dolphin", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "BYD Dolphin", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Editar BYD Dolphin" }).click();
  await page.getByRole("button", { name: "Remover veículo" }).click();
  await expect(
    page.getByRole("button", { name: "BYD Dolphin", exact: true }),
  ).toHaveCount(0);
});

test("QR manual entry requires a code and continues to configuration", async ({
  page,
}) => {
  await page.goto("/qr");
  await page
    .getByRole("button", { name: "Digitar código do carregador", exact: true })
    .click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("pelo menos 3");
  await page
    .getByRole("textbox", { name: "Código do carregador" })
    .fill("ONZE001");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page).toHaveURL(/configure/);
});

test("mobile navigation remains reachable on a smaller screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/home");
  await page.getByRole("tab", { name: "Perfil", exact: true }).click();
  await page
    .getByRole("button", { name: "Minha Garagem", exact: true })
    .click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole("button", { name: "Adicionar veículo", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByRole("tab", { name: "QR Code", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Digitar código do carregador" }),
  ).toBeVisible();
});
