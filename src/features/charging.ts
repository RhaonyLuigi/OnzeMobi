import type { Charge, Vehicle } from "../state";

export function calculateCharge(
  vehicle: Vehicle,
  target: number,
  connector: string,
  stationPower: number,
  tariff: number,
) {
  const vehiclePower =
    connector === "Tipo 2" ? (vehicle.maxAcKw ?? 7.4) : (vehicle.maxDcKw ?? 60);
  const powerKw = Math.max(0, Math.min(stationPower, vehiclePower));
  const delta = Math.max(0, Math.min(100, target) - vehicle.battery);
  const energy = Math.round((delta * vehicle.capacity) / 10) / 10;
  return {
    energy,
    powerKw,
    minutes: powerKw > 0 ? Math.ceil((energy / (powerKw * 0.9)) * 60) : 0,
    cost: Math.round(energy * tariff * 100) / 100,
    recoveredRange: Math.round((vehicle.range * delta) / 100),
  };
}

// Shared demo snapshot used by the charging page, home card, and details sheet.
// The clock advances a clearly labelled local demo, never real charger telemetry.
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
  now = Date.now(),
) {
  const vehicle = session?.vehicle ?? fallback.vehicle;
  const energy = session?.energy ?? fallback.energy;
  const totalMinutes = session?.minutes ?? fallback.minutes;
  const totalCost = session?.cost ?? fallback.cost;
  const initialBattery = session?.initialBattery ?? vehicle.battery;
  const target = session?.targetBattery ?? fallback.target;
  const progress = session?.completedAt
    ? 1
    : session
      ? Math.min(
          1,
          Math.max(
            0,
            (session.demoProgress ?? 0) +
              (now - new Date(session.date).getTime()) /
                Math.max(1, totalMinutes * 60000),
          ),
        )
      : 0.6;
  const addedEnergy = Math.round(energy * progress * 10) / 10;
  const elapsed = Math.round(totalMinutes * progress);
  const battery = Math.min(
    target,
    Math.floor(initialBattery + (target - initialBattery) * progress + 0.0001),
  );
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
    runningCost:
      Math.round(
        addedEnergy *
          (session?.pricePerKwh ?? (energy > 0 ? totalCost / energy : 2.5)) *
          100,
      ) / 100,
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
