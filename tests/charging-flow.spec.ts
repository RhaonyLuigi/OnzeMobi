import { test, expect, type Page } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import fs from "node:fs/promises";
import { seedDriver } from "./fixtures";

async function register(
  page: Page,
  brand: string,
  model: string,
  plate: string,
  battery = 25,
) {
  await page
    .getByRole("button", { name: "Marca do veículo", exact: true })
    .click();
  await page.getByRole("button", { name: brand, exact: true }).click();
  await page
    .getByRole("button", { name: "Modelo do veículo", exact: true })
    .click();
  await page.getByRole("button", { name: model, exact: true }).click();
  await page.getByRole("textbox", { name: "Placa do veículo" }).fill(plate);
  await page.getByRole("radio", { name: "CCS 2", exact: true }).click();
  await page
    .getByRole("slider", { name: "Bateria atual do veículo" })
    .fill(String(battery));
  await page
    .getByRole("button", { name: "Cadastrar Veículo", exact: true })
    .click();
}
async function startSession(page: Page) {
  await page.goto("/configure");
  await page
    .getByRole("slider", { name: "Nível de bateria desejado" })
    .fill("90");
  await page
    .getByRole("button", { name: "Calcular valor", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar e iniciar", exact: true })
    .click();
  await expect(page).toHaveURL(/\/charging$/);
}

test("new driver registers a vehicle and proceeds through station selection into charging", async ({
  page,
}) => {
  await page.goto("/home");
  await expect(page.getByText("Marca", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Cadastre seu veículo", exact: true })
    .click();
  await register(page, "BYD", "Dolphin", "AAA1B23");
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByText("Bateria informada: 25% · Trocar veículo"),
  ).toBeVisible();
  await expect(page.getByText("24,7 kWh", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Recarregar meu veículo", exact: true })
    .click();
  await expect(page).toHaveURL(/\/map$/);
  await page
    .getByRole("button", { name: "Taguatinga Shopping", exact: true })
    .click();
  await page.getByRole("button", { name: "Recarregar", exact: true }).click();
  await expect(page).toHaveURL(/\/configure$/);
  await expect(
    page.getByRole("slider", { name: "Bateria atual informada" }),
  ).toHaveValue("25");
  await expect(page.getByText("+ 24,7 kWh", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Potência considerada: 60 kW", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Calcular valor", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar e iniciar", exact: true })
    .click();
  await expect(page).toHaveURL(/\/charging$/);
  await page.reload();
  await expect(page.getByText("BYD Dolphin", { exact: true })).toBeVisible();
  await expect(
    page.getByText("25%", { exact: true }).filter({ visible: true }).first(),
  ).toBeVisible();
});

test("garage stays in a popup and switching models changes the simulation", async ({
  page,
}) => {
  await seedDriver(page);
  await page.goto("/home");
  await expect(
    page
      .locator('[data-testid="home-simulation"]:visible')
      .getByText("18 kWh", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Perfil", exact: true }).click();
  await page
    .getByRole("button", { name: "Minha Garagem", exact: true })
    .click();
  await expect(page).toHaveURL(/\/profile$/);
  await page
    .getByRole("button", { name: "Adicionar veículo", exact: true })
    .click();
  await register(page, "BMW", "iX", "BBB2C34", 40);
  await expect(
    page.getByRole("button", { name: "BMW iX", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByRole("tab", { name: "Inicio", exact: true }).click();
  await expect(
    page
      .locator('[data-testid="home-simulation"]:visible')
      .getByText("44,6 kWh", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Escolha seu veículo para recarregar" })
    .click();
  await page.getByRole("button", { name: "BYD Dolphin", exact: true }).click();
  await expect(
    page
      .locator('[data-testid="home-simulation"]:visible')
      .getByText("18 kWh", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Bateria informada: 40% · Trocar veículo"),
  ).toBeVisible();
});

test("map centers a station, supports zoom and exposes connector-specific information", async ({
  page,
}) => {
  await seedDriver(page);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/home");
  await page.getByRole("button", { name: "Recarregar meu veículo" }).click();
  await page
    .getByRole("button", { name: "Selecionar Trade Center", exact: true })
    .click();
  const marker = page.getByRole("button", {
    name: "Selecionar Trade Center",
    exact: true,
  });
  await expect
    .poll(async () => {
      const dot = await marker.boundingBox();
      const panel = await page.getByTestId("station-panel").boundingBox();
      return (
        !!dot &&
        !!panel &&
        dot.x >= 0 &&
        dot.x + dot.width <= 360 &&
        dot.y + dot.height < panel.y
      );
    })
    .toBe(true);
  const before = await marker.boundingBox();
  await page.getByRole("button", { name: "Aproximar mapa" }).click();
  await expect
    .poll(async () => (await marker.boundingBox())!.width)
    .toBeGreaterThan(before!.width);
  await expect(
    page.getByRole("radio", { name: "CCS 2", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Mais informações do eletroposto" })
    .click();
  await expect(
    page.getByText("Horário na prévia: 24 horas", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Recarregar", exact: true }).click();
  await expect(
    page.getByText(/Tipo 2 · até 22 kW · R\$ 1,89\/kWh/),
  ).toBeVisible();
  await expect(page.getByText("Potência considerada: 7 kW")).toBeVisible();
});

test("battery alarm plays a test tone, persists and triggers once at the chosen percentage", async ({
  page,
}) => {
  await seedDriver(page);
  await page.addInitScript(() => {
    const target = window as Window & { alarmTones?: number };
    target.alarmTones = 0;
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const oscillator = create.call(this);
      const start = oscillator.start.bind(oscillator);
      oscillator.start = (time) => {
        target.alarmTones = (target.alarmTones ?? 0) + 1;
        start(time);
      };
      return oscillator;
    };
  });
  await startSession(page);
  await page
    .getByRole("button", { name: "Configurar alerta de bateria" })
    .click();
  await page.getByRole("slider", { name: "Porcentagem do alerta" }).fill("85");
  await page.getByRole("button", { name: "Testar som do alarme" }).click();
  await expect(
    page.getByText("Som de teste reproduzido.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Salvar alerta", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("onze-mobi:v1")!).alarm?.threshold,
      ),
    )
    .toBe(85);
  await page.reload();
  await page
    .getByRole("button", { name: "Configurar alerta de bateria" })
    .click();
  await expect(
    page.getByRole("slider", { name: "Porcentagem do alerta" }),
  ).toHaveValue("85");
  await page.getByRole("button", { name: "Testar som do alarme" }).click();
  await page
    .getByRole("button", { name: "Avançar demonstração até o alerta" })
    .click();
  await expect(page.getByText("Bateria em 85%", { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { alarmTones?: number }).alarmTones,
      ),
    )
    .toBe(6);
  await page.getByRole("button", { name: "Entendi", exact: true }).click();
  await page.waitForTimeout(3300);
  expect(
    await page.evaluate(
      () => (window as Window & { alarmTones?: number }).alarmTones,
    ),
  ).toBe(6);
  await expect(page.getByText("Bateria em 85%", { exact: true })).toHaveCount(
    0,
  );
});

test("completed charge opens its statement and downloads a valid PDF", async ({
  page,
}, testInfo) => {
  page.on("console", (message) => {
    if (message.type() === "error") console.log(message.text());
  });
  await seedDriver(page);
  await startSession(page);
  await page
    .getByRole("button", { name: "Detalhes da recarga", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Concluir recarga de exemplo" })
    .click();
  await page.getByRole("button", { name: "Extrato", exact: true }).click();
  const receipt = page.getByTestId("charge-receipt");
  await expect(receipt.getByText("BYD Dolphin", { exact: true })).toBeVisible();
  await expect(
    receipt.getByText("40% para 90%", { exact: true }),
  ).toBeVisible();
  await expect(receipt.getByText("R$ 49,50", { exact: true })).toBeVisible();
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Baixar extrato em PDF", exact: true })
    .click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^onze-mobi-extrato-.*\.pdf$/);
  const file = testInfo.outputPath("recarga.pdf");
  await download.saveAs(file);
  const pdf = await PDFDocument.load(await fs.readFile(file));
  expect(pdf.getPageCount()).toBe(1);
  expect(pdf.getTitle()).toContain("Extrato ONZE mobi");
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Ver histórico", exact: true })
    .click();
  await page.getByRole("button", { name: /^Ver extrato / }).click();
  await expect(
    page
      .getByTestId("charge-receipt")
      .getByText("40% para 90%", { exact: true }),
  ).toBeVisible();
});
