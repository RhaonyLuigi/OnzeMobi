import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  Car,
  Chevron,
  GradientButton,
  Header,
  Page,
  Range,
  TextLabel as T,
  s,
} from "../components";
import { colors as C } from "../design/theme";
import { useApp, decimal, money } from "../state";
import { BoltIcon } from "../Icons";

export function ConfigureScreen() {
  const app = useApp();
  const vehicle = app.selected;
  const station = app.selectedStation;
  if (!vehicle || !station)
    return (
      <Page>
        <Header title="Configurar Recarga" />
        <View style={[s.whitePanel, cf.body]}>
          <T weight="bold" style={cf.title}>
            {!vehicle
              ? "Qual veículo vamos recarregar?"
              : "Escolha onde recarregar"}
          </T>
          <T style={cf.description}>
            {!vehicle
              ? "Cadastre ou selecione um veículo para calcular uma recarga com os dados dele."
              : "Escolha um eletroposto no mapa para conferir conectores, potência e tarifa."}
          </T>
          <GradientButton
            title={
              !vehicle
                ? app.saved.vehicles.length
                  ? "Selecionar veículo"
                  : "Cadastre seu veículo"
                : "Escolher eletroposto"
            }
            onPress={() =>
              !vehicle
                ? app.saved.vehicles.length
                  ? app.setSheet("vehicle-picker")
                  : app.openVehicleForm()
                : app.go("map")
            }
            style={{ marginTop: 24 }}
          />
        </View>
      </Page>
    );
  const compatible = !!app.stationConnector && app.quote.powerKw > 0;
  return (
    <Page>
      <Header title="Configurar Recarga" />
      <View style={[s.whitePanel, cf.body]}>
        <View style={cf.steps}>
          <T style={cf.step}>✓ Veículo</T>
          <T style={cf.step}>✓ Eletroposto</T>
          <T weight="semibold" style={[cf.step, { color: C.ink }]}>
            3 · Recarga
          </T>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Alterar eletroposto"
          onPress={() => app.go("map")}
          style={[s.row, cf.station]}
        >
          <View style={cf.icon}>
            <BoltIcon />
          </View>
          <View style={{ flex: 1 }}>
            <T weight="semibold">{station.name}</T>
            <T style={cf.caption}>
              {app.connector} · até {app.stationConnector?.powerKw ?? 0} kW ·{" "}
              {money(station.price)}/kWh
            </T>
          </View>
          <Chevron />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selecionar veículo para recarga"
          onPress={() => app.setSheet("vehicle-picker")}
          style={[s.row, cf.vehicle]}
        >
          <Car w={76} />
          <View style={{ flex: 1 }}>
            <T weight="semibold">
              {vehicle.brand} {vehicle.model}
            </T>
            <T style={cf.caption}>
              {vehicle.plate} · {vehicle.year}
            </T>
            <T style={cf.caption}>Bateria: {decimal(vehicle.capacity)} kWh</T>
          </View>
          <Chevron />
        </Pressable>
        <View style={cf.section}>
          <View style={s.between}>
            <T weight="semibold">Bateria atual informada</T>
            <T weight="bold" style={cf.percentage}>
              {vehicle.battery}%
            </T>
          </View>
          <Range
            label="Bateria atual informada"
            value={vehicle.battery}
            onChange={(v) => {
              app.setCurrent(v);
              app.setTarget(Math.max(app.target, v));
            }}
            gradientTrack
          />
          <T style={cf.caption}>
            Ajuste conforme o painel do carro · autonomia atual estimada:{" "}
            {Math.round((vehicle.range * vehicle.battery) / 100)} km
          </T>
        </View>
        <View style={cf.section}>
          <View style={s.between}>
            <T weight="semibold">Nível de bateria desejado</T>
            <T weight="bold" style={cf.percentage}>
              {app.target}%
            </T>
          </View>
          <Range
            label="Nível de bateria desejado"
            min={vehicle.battery}
            value={Math.max(app.target, vehicle.battery)}
            onChange={(v) => app.setTarget(v)}
            gradientTrack
            size={23}
          />
          <View style={s.between}>
            <T style={cf.caption}>{vehicle.battery}% atual</T>
            <T style={cf.caption}>100%</T>
          </View>
        </View>
        <View style={cf.metrics}>
          {[
            {
              label: "Energia necessária",
              value: `+ ${decimal(app.energy)} kWh`,
            },
            { label: "Tempo estimado", value: `~ ${app.minutes} min` },
            {
              label: "Autonomia recuperada",
              value: `+ ${app.quote.recoveredRange} km`,
            },
            { label: "Valor estimado", value: money(app.cost) },
          ].map((item) => (
            <View key={item.label} style={cf.metric}>
              <T style={cf.caption}>{item.label}</T>
              <T
                weight="bold"
                style={{ fontSize: 19, lineHeight: 26, marginTop: 7 }}
              >
                {item.value}
              </T>
            </View>
          ))}
        </View>
        <View style={cf.note}>
          <T weight="semibold" style={{ fontSize: 12 }}>
            Potência considerada: {decimal(app.quote.powerKw)} kW
          </T>
          <T style={cf.caption}>
            Limitada pelo veículo e pelo conector selecionado. A estimativa
            considera 90% de eficiência; temperatura e redução de potência podem
            alterar o tempo.
          </T>
        </View>
        <T style={cf.caption}>
          Dados de demonstração. A bateria é informada por você; não há leitura
          automática do carro nem cobrança nesta prévia.
        </T>
        {!compatible && (
          <T
            accessibilityRole="alert"
            style={{ color: "#b3261e", fontSize: 12, marginTop: 12 }}
          >
            Escolha no mapa um conector compatível com este veículo.
          </T>
        )}
        <GradientButton
          title="Calcular valor"
          onPress={() => {
            if (!compatible) {
              app.go("map");
              return;
            }
            if (app.target <= vehicle.battery) {
              app.setToast("Selecione uma carga acima da bateria atual.");
              return;
            }
            app.go("summary");
          }}
          style={{ marginTop: 26 }}
          round={14}
          textStyle={{ color: C.navy }}
        />
      </View>
    </Page>
  );
}
const cf = StyleSheet.create({
  body: { padding: 20, paddingBottom: 36 },
  title: { fontSize: 23, lineHeight: 31, marginTop: 20 },
  description: { color: C.gray, fontSize: 14, lineHeight: 23, marginTop: 14 },
  steps: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  step: { color: "#7290a5", fontSize: 10, lineHeight: 16 },
  station: { gap: 11 },
  icon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.light,
  },
  caption: { color: "#6a7d8e", fontSize: 11, lineHeight: 17, marginTop: 4 },
  vehicle: {
    gap: 13,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dce9f4",
    borderRadius: 15,
    marginTop: 22,
  },
  section: { marginTop: 25 },
  percentage: { color: C.ink, fontSize: 22, lineHeight: 29 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 25 },
  metric: {
    flexBasis: "46%",
    flexGrow: 1,
    padding: 14,
    borderRadius: 13,
    backgroundColor: C.light,
  },
  note: {
    padding: 14,
    borderRadius: 13,
    backgroundColor: "#f4f8fb",
    marginTop: 18,
    marginBottom: 13,
  },
});
