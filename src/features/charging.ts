import type { Charge, Vehicle } from "../state";

// Shared demo snapshot used by the charging page, home card, and details sheet.
// No timer or simulated value is presented as live charger telemetry.
export function chargeSnapshot(
  session: Charge | null,
  fallback: {
    vehicle: Vehicle;
    energy: number;
    minutes: number;
    cost: number;
    target: number;
    connector: string;
  },
) {
  const vehicle = session?.vehicle ?? fallback.vehicle;
  const energy = session?.energy ?? fallback.energy;
  const totalMinutes = session?.minutes ?? fallback.minutes;
  const totalCost = session?.cost ?? fallback.cost;
  const initialBattery = session?.initialBattery ?? vehicle.battery;
  const target = session?.targetBattery ?? fallback.target;
  const addedEnergy = Math.round(energy * 0.6 * 10) / 10;
  const elapsed = Math.min(
    Math.max(0, totalMinutes - 1),
    Math.round(totalMinutes * 0.5625),
  );
  const battery = Math.round(initialBattery + (target - initialBattery) * 0.6);
  return {
    vehicle,
    battery,
    initialBattery,
    target,
    energy,
    addedEnergy,
    elapsed,
    remainingMinutes: Math.max(0, totalMinutes - elapsed),
    remainingEnergy: Math.round((energy - addedEnergy) * 10) / 10,
    runningCost: Math.round(totalCost * 0.6 * 100) / 100,
    totalCost,
    tariff: session?.pricePerKwh ?? (energy > 0 ? totalCost / energy : 2.5),
    averagePower: elapsed > 0 ? Math.round((addedEnergy / elapsed) * 60) : 0,
    connector: session?.connector ?? fallback.connector,
    powerKw: session?.powerKw ?? 60,
    recoveredRange: Math.round(
      (vehicle.range * Math.max(0, battery - initialBattery)) / 100,
    ),
    station: session?.station ?? "Taguatinga Shopping",
    chargerId: session?.chargerId ?? "ONZE-001",
  };
}
