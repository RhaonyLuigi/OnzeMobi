import type { Page } from "@playwright/test";

export const driverVehicle = {
  id: "test-dolphin",
  brand: "BYD",
  model: "Dolphin",
  year: "2026",
  plate: "ABC1D23",
  connector: "CCS 2",
  capacity: 44.9,
  battery: 40,
  range: 300,
  maxAcKw: 7,
  maxDcKw: 60,
};
export async function seedDriver(page: Page) {
  await page.addInitScript((vehicle) => {
    if (!localStorage.getItem("onze-mobi:v1"))
      localStorage.setItem(
        "onze-mobi:v1",
        JSON.stringify({
          vehicles: [vehicle],
          selected: vehicle.id,
          draft: {
            station: 0,
            target: 80,
            connector: "CCS 2",
            power: 60,
            time: "12:45",
          },
        }),
      );
  }, driverVehicle);
}
