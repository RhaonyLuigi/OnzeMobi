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
import { chargeSnapshot } from "./features/charging";
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
};
export type Sheet =
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
  brand: "Marca",
  model: "Modelo",
  year: "2023",
  plate: "",
  connector: "Tipo 2",
  capacity: 155.5556,
  battery: 62,
  range: 280,
};
export const stations = [
  {
    id: 0,
    name: "Taguatinga Shopping",
    available: 4,
    price: 2.2,
    node: "214:499",
    image: "imgImage11",
  },
  {
    id: 1,
    name: "Estacionamento Assaí",
    available: 1,
    price: 1.89,
    node: "228:196",
    image: "imgImages1",
  },
  {
    id: 2,
    name: "Trade Center",
    available: 2,
    price: 2.0,
    node: "228:282",
    image: "imgImages11",
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
};
const initial: Saved = {
  vehicles: [sampleVehicle],
  selected: null,
  profile: { name: "Nome", email: "Seunome@gmail.com" },
  history: [],
  active: false,
  card: "1234",
  session: null,
  notifications: true,
  trip: newTrip(),
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
  const [station, setStation] = useState<number | null>(null);
  const [target, setTarget] = useState(80);
  const [current, setCurrent] = useState(0);
  const [simReady, setSimReady] = useState(false);
  const [power, setPower] = useState(60);
  const [time, setTime] = useState("12:45");
  const [toast, setToast] = useState("");
  const session = saved.session;
  const setSession = (session: Charge) => setSaved((s) => ({ ...s, session }));
  const [connector, setConnector] = useState("Tipo 2");
  const selected = saved.vehicles.find((v) => v.id === saved.selected) ?? null;
  const vehicle = selected ?? sampleVehicle;
  const energy =
    Math.round(
      ((Math.max(0, target - vehicle.battery) * vehicle.capacity) / 100) * 10,
    ) / 10;
  const minutes = Math.ceil((energy / 52.5) * 60);
  const cost = Math.round(energy * 2.5 * 100) / 100;
  const liveCharge = chargeSnapshot(session, {
    vehicle,
    energy,
    minutes,
    cost,
    target,
    connector,
  });
  useEffect(() => {
    AsyncStorage.getItem("onze-mobi:v1")
      .then((value) => {
        if (value) {
          try {
            setSaved({ ...initial, ...JSON.parse(value) });
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
      powerKw: 60,
      pricePerKwh: 2.5,
      chargerId: `ONZE-${String((station ?? 0) + 1).padStart(3, "0")}`,
    };
    setSession(charge);
    update({ active: true });
    go("charging");
  };
  const finish = () => {
    const charge = session ?? {
      id: Date.now().toString(),
      station: stations[station ?? 0].name,
      energy,
      minutes,
      cost,
      date: new Date().toISOString(),
    };
    setSession(charge);
    setSaved((s) => ({
      ...s,
      active: false,
      history: [charge, ...s.history.filter((c) => c.id !== charge.id)],
    }));
    go("success");
  };
  const choose = (v: Vehicle) => {
    setSaved((saved) => ({
      ...saved,
      selected: v.id,
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
    setCurrent(v.battery);
    setTarget(Math.max(80, v.battery));
    setSimReady(true);
    setSheet(null);
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
    setSimReady,
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
