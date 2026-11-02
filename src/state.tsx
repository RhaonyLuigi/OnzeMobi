import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import { usePathname, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  newTrip,
  createDemoPlan,
  type TripConversation,
} from "./features/trip";
import { calculateCharge, chargeSnapshot } from "./features/charging";
import { deliverBatteryAlarm } from "./features/batteryAlarm";
export const routes = [
  "splash",
  "login",
  "signup",
  "recovery",
  "home",
  "map",
  "qr",
  "simulation",
  "configure",
  "summary",
  "charging",
  "success",
  "profile",
  "garage",
  "trip",
] as const;
export type Route = (typeof routes)[number];
export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  connector: string;
  capacity: number;
  battery: number;
  range: number;
  maxAcKw?: number;
  maxDcKw?: number;
};
export type Charge = {
  id: string;
  station: string;
  energy: number;
  minutes: number;
  cost: number;
  date: string;
  vehicle?: Vehicle;
  initialBattery?: number;
  targetBattery?: number;
  connector?: string;
  powerKw?: number;
  pricePerKwh?: number;
  chargerId?: string;
  demoProgress?: number;
  completedAt?: string;
  paymentLast4?: string;
};
export type Sheet =
  | "garage"
  | "alarm"
  | "receipt"
  | "vehicle-picker"
  | "vehicle-form"
  | "manual-code"
  | "payment"
  | "account"
  | "plans"
  | "history"
  | "settings"
  | "help"
  | "notifications"
  | "details"
  | "google"
  | "terms"
  | "recovery-sent"
  | null;
export const sampleVehicle: Vehicle = {
  id: "preview",
  brand: "Veículo",
  model: "de exemplo",
  year: "2023",
  plate: "",
  connector: "Tipo 2",
  capacity: 60,
  battery: 62,
  range: 280,
  maxAcKw: 7.4,
  maxDcKw: 60,
};
export const stations = [
  {
    id: 0,
    name: "Taguatinga Shopping",
    available: 4,
    price: 2.2,
    node: "214:499",
    image: "imgImage11",
    area: "Taguatinga Sul · Brasília, DF",
    hours: "08h às 22h",
    amenities: ["Alimentação", "Banheiros", "Estacionamento"],
    connectors: [
      { type: "Tipo 2", powerKw: 22, available: 2 },
      { type: "CCS 2", powerKw: 150, available: 2 },
    ],
    x: 125,
    y: 280,
  },
  {
    id: 1,
    name: "Estacionamento Assaí",
    available: 2,
    price: 2.0,
    node: "228:196",
    image: "imgImages1",
    area: "Águas Claras · Brasília, DF",
    hours: "07h às 22h",
    amenities: ["Mercado", "Banheiros", "Estacionamento"],
    connectors: [
      { type: "Tipo 2", powerKw: 22, available: 1 },
      { type: "CCS 2", powerKw: 60, available: 1 },
    ],
    x: 295,
    y: 405,
  },
  {
    id: 2,
    name: "Trade Center",
    available: 1,
    price: 1.89,
    node: "228:282",
    image: "imgImages11",
    area: "Taguatinga Centro · Brasília, DF",
    hours: "24 horas",
    amenities: ["Café", "Banheiros", "Estacionamento"],
    connectors: [{ type: "Tipo 2", powerKw: 22, available: 1 }],
    x: 265,
    y: 190,
  },
];
type Saved = {
  vehicles: Vehicle[];
  selected: string | null;
  profile: { name: string; email: string };
  history: Charge[];
  active: boolean;
  card: string;
  session: Charge | null;
  notifications: boolean;
  trip: TripConversation;
  draft: {
    station: number | null;
    target: number;
    connector: string;
    power: number;
    time: string;
  };
  alarm: { sessionId: string; threshold: number; triggered: boolean } | null;
};
const initial: Saved = {
  vehicles: [],
  selected: null,
  profile: { name: "Nome", email: "Seunome@gmail.com" },
  history: [],
  active: false,
  card: "1234",
  session: null,
  notifications: true,
  trip: newTrip(),
  draft: {
    station: null,
    target: 80,
    connector: "CCS 2",
    power: 60,
    time: "12:45",
  },
  alarm: null,
};
function useAppState() {
  const router = useRouter();
  const pathname = usePathname();
  const pathRoute = pathname.replace(/^\//, "") as Route;
  const route: Route =
    pathname === "/"
      ? "splash"
      : routes.includes(pathRoute)
        ? pathRoute
        : "home";
  const [saved, setSaved] = useState<Saved>(initial);
  const [ready, setReady] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [vehicleFormReturn, setVehicleFormReturn] = useState<
    "garage" | "vehicle-picker" | null
  >(null);
  const [receipt, setReceipt] = useState<Charge | null>(null);
  const [alarmRinging, setAlarmRinging] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  const { station, target, power, time, connector } = saved.draft;
  const setDraft = (patch: Partial<Saved["draft"]>) =>
    setSaved((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
  const setStation = (station: number | null) => setDraft({ station });
  const setTarget = (target: number) =>
    setDraft({ target: Math.max(0, Math.min(100, target)) });
  const setPower = (power: number) => setDraft({ power });
  const setTime = (time: string) => setDraft({ time });
  const setConnector = (connector: string) => setDraft({ connector });
  const [toast, setToast] = useState("");
  const session = saved.session;
  const setSession = (session: Charge) => setSaved((s) => ({ ...s, session }));
  const selected = saved.vehicles.find((v) => v.id === saved.selected) ?? null;
  const simReady = !!selected;
  const vehicle = selected ?? sampleVehicle;
  const current = selected?.battery ?? 0;
  const setCurrent = (battery: number) =>
    setSaved((s) => ({
      ...s,
      vehicles: s.vehicles.map((v) =>
        v.id === s.selected
          ? { ...v, battery: Math.round(Math.max(0, Math.min(100, battery))) }
          : v,
      ),
    }));
  const selectedStation = station === null ? null : (stations[station] ?? null);
  const stationConnector = selectedStation?.connectors.find(
    (c) => c.type === connector,
  );
  const tariff = selectedStation?.price ?? 2.2;
  const quote = calculateCharge(
    vehicle,
    target,
    connector,
    selectedStation ? (stationConnector?.powerKw ?? 0) : power,
    tariff,
  );
  const { energy, minutes, cost } = quote;
  const liveCharge = chargeSnapshot(
    session,
    {
      vehicle,
      energy,
      minutes,
      cost,
      target,
      connector,
    },
    clock,
  );
  useEffect(() => {
    AsyncStorage.getItem("onze-mobi:v1")
      .then((value) => {
        if (value) {
          try {
            const data = JSON.parse(value);
            setSaved({
              ...initial,
              ...data,
              vehicles: (data.vehicles ?? []).filter(
                (v: Vehicle) => v.id !== "preview",
              ),
              selected: data.selected === "preview" ? null : data.selected,
              draft: { ...initial.draft, ...data.draft },
            });
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem("onze-mobi:v1", JSON.stringify(saved)).catch(
        () => {},
      );
  }, [saved, ready]);
  useEffect(() => {
    if (!saved.active) return;
    const timer = setInterval(() => setClock(Date.now()), 3000);
    return () => clearInterval(timer);
  }, [saved.active]);
  useEffect(() => {
    const alarm = saved.alarm;
    if (
      !ready ||
      !saved.active ||
      !alarm ||
      alarm.triggered ||
      alarm.sessionId !== session?.id ||
      liveCharge.battery < alarm.threshold
    )
      return;
    const timer = setTimeout(() => {
      setSaved((s) =>
        s.alarm?.sessionId === alarm.sessionId
          ? { ...s, alarm: { ...s.alarm, triggered: true } }
          : s,
      );
      setAlarmRinging(true);
      void deliverBatteryAlarm(alarm.threshold);
    }, 0);
    return () => clearTimeout(timer);
  }, [ready, saved.active, saved.alarm, session?.id, liveCharge.battery]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const go = useCallback(
    (next: Route) => {
      setSheet(null);
      router.push(next === "splash" ? "/" : `/${next}`);
    },
    [router],
  );
  const back = () => {
    if (sheet) {
      setSheet(null);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };
  const update = (patch: Partial<Saved>) =>
    setSaved((s) => ({ ...s, ...patch }));
  const start = () => {
    if (!selected) {
      setSheet("vehicle-picker");
      return;
    }
    if (!selectedStation) {
      go("map");
      return;
    }
    if (!stationConnector || quote.powerKw <= 0) {
      setToast("Escolha um conector compatível com seu veículo.");
      return;
    }
    if (saved.active) {
      setToast("Você já tem uma recarga em andamento.");
      go("charging");
      return;
    }
    if (target <= selected.battery || energy <= 0) { setToast("Selecione uma carga acima da bateria atual."); go("configure"); return; }
    const charge: Charge = {
      id: Date.now().toString(),
      station: stations[station ?? 0].name,
      energy,
      minutes,
      cost,
      date: new Date().toISOString(),
      vehicle: { ...vehicle },
      initialBattery: vehicle.battery,
      targetBattery: target,
      connector,
      powerKw: quote.powerKw,
      pricePerKwh: tariff,
      chargerId: `ONZE-${String((station ?? 0) + 1).padStart(3, "0")}`,
      paymentLast4: saved.card,
      demoProgress: 0,
    };
    setSession(charge);
    setClock(Date.now());
    update({ active: true, alarm: null });
    go("charging");
  };
  const finish = () => {
    if (!session || !saved.active) { setSheet(null); setToast("Não há uma recarga ativa para concluir."); return; }
    const charge: Charge = {
      ...(session ?? {
        id: Date.now().toString(),
        station: stations[station ?? 0].name,
        energy,
        minutes,
        cost,
        date: new Date().toISOString(),
      }),
      completedAt: new Date().toISOString(),
      demoProgress: 1,
    };
    setSession(charge);
    setSaved((s) => ({
      ...s,
      active: false,
      alarm: null,
      vehicles: s.vehicles.map((v) =>
        v.id === charge.vehicle?.id
          ? { ...v, battery: charge.targetBattery ?? v.battery }
          : v,
      ),
      history: [charge, ...s.history.filter((c) => c.id !== charge.id)],
    }));
    setReceipt(charge);
    go("success");
  };
  const choose = (v: Vehicle, closeSheet = true) => {
    setSaved((saved) => ({
      ...saved,
      selected: v.id,
      draft: {
        ...saved.draft,
        station: null,
        connector: v.connector,
        target: Math.min(100, Math.max(80, v.battery + 1)),
      },
      trip: saved.trip.plan
        ? {
            ...saved.trip,
            plan: createDemoPlan({
              origin: saved.trip.origin,
              destination: saved.trip.destination,
              priority: saved.trip.priority,
              vehicle: v,
            }),
          }
        : saved.trip,
    }));
    if (closeSheet) setSheet(null);
  };
  const openVehicleForm = (
    vehicle: Vehicle | null = null,
    returnTo: "garage" | "vehicle-picker" | null = null,
  ) => {
    setEditing(vehicle);
    setVehicleFormReturn(returnTo);
    setSheet("vehicle-form");
  };
  const saveVehicle = (v: Vehicle) => {
    setSaved((s) => ({
      ...s,
      vehicles: s.vehicles.some((old) => old.id === v.id)
        ? s.vehicles.map((old) => (old.id === v.id ? v : old))
        : [...s.vehicles, v],
      selected: v.id,
      draft: {
        ...s.draft,
        station: null,
        connector: v.connector,
        target: Math.min(100, Math.max(80, v.battery + 1)),
      },
    }));
    setSheet(vehicleFormReturn);
  };
  const openReceipt = (charge: Charge | null = session) => {
    setReceipt(charge);
    setSheet("receipt");
  };
  const advanceDemo = (battery: number) => {
    if (!session || !saved.active) return;
    const start = session.initialBattery ?? vehicle.battery;
    const end = session.targetBattery ?? target;
    const elapsedProgress =
      (Date.now() - new Date(session.date).getTime()) /
      Math.max(1, session.minutes * 60000);
    setSession({
      ...session,
      demoProgress: Math.max(
        0,
        Math.min(1, (battery - start) / Math.max(1, end - start)) -
          elapsedProgress,
      ),
    });
    setClock(Date.now());
  };
  return {
    route,
    go,
    back,
    saved,
    update,
    ready,
    sheet,
    setSheet,
    editing,
    setEditing,
    station,
    setStation,
    target,
    setTarget,
    current,
    setCurrent,
    simReady,
    power,
    setPower,
    time,
    setTime,
    toast,
    setToast,
    session,
    selected,
    vehicle,
    energy,
    minutes,
    cost,
    start,
    finish,
    choose,
    connector,
    setConnector,
    liveCharge,
    selectedStation,
    stationConnector,
    tariff,
    quote,
    openVehicleForm,
    saveVehicle,
    vehicleFormReturn,
    receipt,
    openReceipt,
    alarmRinging,
    setAlarmRinging,
    advanceDemo,
  };
}
type AppContext = ReturnType<typeof useAppState>;
const Context = createContext<AppContext | null>(null);
export function AppProvider({ children }: React.PropsWithChildren) {
  return <Context.Provider value={useAppState()}>{children}</Context.Provider>;
}
export function useApp() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("AppProvider missing");
  return ctx;
}
export const money = (value: number) =>
  `R$ ${value.toFixed(2).replace(".", ",")}`;
export const decimal = (value: number) => String(value).replace(".", ",");
