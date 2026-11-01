import type { Vehicle } from "../state";

export type TripPriority = "fastest" | "cheapest" | "fewest";
export type TripStop = {
  id: string;
  name: string;
  atKm: number;
  arrivalBattery: number;
  departureBattery: number;
  energyKwh: number;
  minutes: number;
  cost: number;
  connector: string;
  powerKw: number;
};
export type TripPlan = {
  mode: "demo";
  origin: string;
  destination: string;
  distanceKm: number;
  driveMinutes: number;
  chargeMinutes: number;
  cost: number;
  reserve: number;
  priority: TripPriority;
  vehicleName: string;
  initialBattery: number;
  stops: TripStop[];
};
export type TripMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};
export type TripConversation = {
  origin: string;
  destination: string;
  priority: TripPriority;
  stage: "destination" | "origin" | "ready";
  messages: TripMessage[];
  plan: TripPlan | null;
};
export const priorities: { id: TripPriority; label: string; hint: string }[] = [
  { id: "fastest", label: "Menor tempo", hint: "Recargas mais rápidas" },
  { id: "cheapest", label: "Menor custo", hint: "Tarifas mais baixas" },
  { id: "fewest", label: "Menos paradas", hint: "Mais carga por parada" },
];
export function newTrip(): TripConversation {
  return {
    origin: "",
    destination: "",
    priority: "fastest",
    stage: "destination",
    plan: null,
    messages: [
      {
        id: "welcome",
        role: "assistant",
        text: "Olá! Sou seu assistente de viagem ONZE. Para onde você quer ir? Vou montar uma prévia das paradas para recarga com base no seu veículo.",
      },
    ],
  };
}

// This local adapter supplies UI fixtures only. It never geocodes a destination,
// calls a model, or claims to discover real charging stations.
// Replace it with a server-backed route/charging provider for production.
export function createDemoPlan(input: {
  origin: string;
  destination: string;
  priority: TripPriority;
  vehicle: Vehicle;
}): TripPlan {
  const { origin, destination, priority, vehicle } = input;
  const distanceKm = 420; // Hypothetical scenario, independent of city names.
  const rangeKm = Math.max(100, vehicle.range);
  const reserve = 20;
  const chargeLimit = priority === "fewest" ? 95 : 80;
  const powerKw =
    priority === "fastest" ? 120 : priority === "cheapest" ? 60 : 90;
  const price = priority === "cheapest" ? 1.9 : 2.5;
  const stops: TripStop[] = [];
  let battery = vehicle.battery;
  let position = 0;
  while (
    distanceKm - position >
    (rangeKm * Math.max(0, battery - reserve)) / 100 + 0.001
  ) {
    const usableKm = (rangeKm * Math.max(0, battery - reserve)) / 100;
    const leg = Math.floor(usableKm * 0.85);
    position += leg;
    const arrivalBattery = Math.max(0, battery - (leg / rangeKm) * 100);
    const neededForArrival =
      ((distanceKm - position) / rangeKm) * 100 + reserve;
    const departureBattery = Math.min(
      chargeLimit,
      Math.max(arrivalBattery + 1, neededForArrival),
    );
    const energyKwh =
      Math.round(
        ((departureBattery - arrivalBattery) * vehicle.capacity) / 10,
      ) / 10;
    stops.push({
      id: `demo-stop-${stops.length + 1}`,
      name: `Eletroposto de exemplo ${String(stops.length + 1).padStart(2, "0")}`,
      atKm: position,
      arrivalBattery: Math.round(arrivalBattery),
      departureBattery: Math.round(departureBattery),
      energyKwh,
      minutes: Math.ceil((energyKwh / powerKw) * 60) + 5,
      cost: Math.round(energyKwh * price * 100) / 100,
      connector: vehicle.connector,
      powerKw,
    });
    battery = departureBattery;
  }
  return {
    mode: "demo",
    origin,
    destination,
    distanceKm,
    driveMinutes: Math.ceil((distanceKm / 80) * 60),
    chargeMinutes: stops.reduce((total, stop) => total + stop.minutes, 0),
    cost:
      Math.round(stops.reduce((total, stop) => total + stop.cost, 0) * 100) /
      100,
    reserve,
    priority,
    initialBattery: vehicle.battery,
    vehicleName:
      vehicle.id === "preview"
        ? "Veículo de exemplo"
        : `${vehicle.brand} ${vehicle.model}`,
    stops,
  };
}

const cleanPlace = (text: string) =>
  text
    .trim()
    .replace(/[.!?]+$/, "")
    .trim();
export function readJourney(
  text: string,
): { origin: string; destination: string } | null {
  const match = text
    .trim()
    .match(
      /^(?:quero\s+(?:viajar|ir)\s+)?de\s+(.+?)\s+(?:para|pra|até)\s+(.+)$/iu,
    );
  return match
    ? { origin: cleanPlace(match[1]), destination: cleanPlace(match[2]) }
    : null;
}
export function readDestination(text: string) {
  return cleanPlace(
    text.replace(
      /^(?:quero\s+)?(?:(?:viajar|ir)\s+)?(?:para|pra|até)\s+/iu,
      "",
    ),
  );
}
export function readOrigin(text: string) {
  return cleanPlace(
    text.replace(/^(?:vou\s+sair\s+de|saindo\s+de|estou\s+em|de)\s+/iu, ""),
  );
}
export function samePlace(a: string, b: string) {
  const key = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  return key(a) === key(b);
}
export function duration(minutes: number) {
  const h = Math.floor(minutes / 60),
    m = minutes % 60;
  return h ? `${h}h${m ? ` ${m}min` : ""}` : `${m} min`;
}
