import React from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Art,
  GradientButton,
  Header,
  Outline,
  Page,
  TextLabel as T,
  s,
} from "../components";
import { ChargeRing } from "../ChargeRing";
import { colors as C } from "../design/theme";
import { useApp, decimal, money } from "../state";

export function ChargingScreen() {
  const app = useApp();
  const charge = app.liveCharge;
  const details = [
    { label: "Eletroposto", value: charge.station },
    { label: "Carregador", value: charge.chargerId },
    {
      label: "Veículo",
      value:
        charge.vehicle.id === "preview"
          ? "Veículo de exemplo"
          : `${charge.vehicle.brand} ${charge.vehicle.model}`,
    },
    {
      label: "Conector",
      value: `${charge.connector} · até ${charge.powerKw} kW`,
    },
    { label: "Bateria na chegada", value: `${charge.initialBattery}%` },
    { label: "Meta de bateria", value: `${charge.target}%` },
    {
      label: "Energia restante",
      value: `${decimal(charge.remainingEnergy)} kWh`,
    },
    { label: "Energia total prevista", value: `${decimal(charge.energy)} kWh` },
    { label: "Preço por kWh", value: money(charge.tariff) },
    { label: "Pagamento", value: `Mastercard ···· ${app.saved.card}` },
  ];
  return (
    <Page dark scroll={false}>
      <Header title="Carregando..." onBack={() => app.go("home")} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        <View style={{ alignItems: "center", paddingTop: 5 }}>
          <Art
            node="101:884"
            name="imgImage14"
            blur={2.4}
            w={370}
            h={370}
            fit="cover"
            style={{
              position: "absolute",
              top: 0,
              opacity: 0.3,
              borderRadius: 20,
            }}
          />
          <LinearGradient
            colors={[C.navy, "#0a192f30", C.navy]}
            style={{ position: "absolute", width: "100%", height: 370, top: 0 }}
            pointerEvents="none"
          />
          <View style={cs.demo}>
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: C.cyan,
              }}
            />
            <T style={{ color: "#b8d5e7", fontSize: 10, lineHeight: 15 }}>
              Sessão de demonstração
            </T>
          </View>
          <View style={{ marginTop: 19 }}>
            <ChargeRing value={charge.battery}>
              <T
                weight="semibold"
                style={{ color: "white", fontSize: 42, lineHeight: 51 }}
              >
                {charge.battery}
                <T style={{ color: "white", fontSize: 24 }}>%</T>
              </T>
              <T style={{ color: "#b7cedf", fontSize: 11, lineHeight: 16 }}>
                Bateria atual
              </T>
              <Art
                node="101:884"
                name="imgIcon"
                w={13.5}
                h={25.27}
                style={{ marginTop: 6 }}
              />
            </ChargeRing>
          </View>
          <T
            style={{
              color: "#c3d2e1",
              fontSize: 12,
              lineHeight: 18,
              marginTop: 14,
            }}
          >
            Meta de {charge.target}% · cerca de {charge.remainingMinutes} min
            restantes
          </T>
        </View>
        <View style={[s.row, { gap: 10, marginTop: 21 }]}>
          <View style={cs.metric}>
            <T style={cs.label}>Energia adicionada</T>
            <T weight="semibold" style={cs.metricValue}>
              {decimal(charge.addedEnergy)} kWh
            </T>
          </View>
          <View style={cs.metric}>
            <T style={cs.label}>Tempo decorrido</T>
            <T weight="semibold" style={cs.metricValue}>
              {charge.elapsed} min
            </T>
          </View>
        </View>
        <View style={[s.row, { gap: 10, marginTop: 10 }]}>
          <View style={cs.metric}>
            <T style={cs.label}>Potência média</T>
            <T weight="semibold" style={cs.metricValue}>
              {charge.averagePower} kW
            </T>
          </View>
          <View style={cs.metric}>
            <T style={cs.label}>Autonomia recuperada</T>
            <T weight="semibold" style={cs.metricValue}>
              + {charge.recoveredRange} km
            </T>
            <T style={{ color: "#728da6", fontSize: 9, lineHeight: 12 }}>
              Estimativa ilustrativa
            </T>
          </View>
        </View>
        <Outline style={{ marginTop: 16 }} innerStyle={{ padding: 17 }}>
          <View style={[s.between, { alignItems: "flex-start" }]}>
            <View>
              <T style={{ color: "#bbd0df", fontSize: 11, lineHeight: 16 }}>
                Valor estimado até agora
              </T>
              <T
                weight="semibold"
                style={{
                  color: "white",
                  fontSize: 28,
                  lineHeight: 35,
                  marginTop: 5,
                }}
              >
                {money(charge.runningCost)}
              </T>
            </View>
            <View style={{ alignItems: "flex-end", marginTop: 2 }}>
              <T style={{ color: "#8fa7bf", fontSize: 10, lineHeight: 15 }}>
                Previsão ao concluir
              </T>
              <T
                weight="semibold"
                style={{
                  color: C.cyan,
                  fontSize: 15,
                  lineHeight: 22,
                  marginTop: 7,
                }}
              >
                {money(charge.totalCost)}
              </T>
            </View>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: "#21415b",
              marginVertical: 12,
            }}
          />
          <T style={{ color: "#93acc0", fontSize: 11, lineHeight: 16 }}>
            {money(charge.tariff)}/kWh · sem cobrança real nesta prévia
          </T>
        </Outline>
        <View style={cs.details}>
          <T
            weight="semibold"
            style={{ color: "white", fontSize: 15, marginBottom: 7 }}
          >
            Informações da sessão
          </T>
          {details.map((detail, index) => (
            <View
              key={detail.label}
              style={[
                s.between,
                {
                  alignItems: "flex-start",
                  gap: 15,
                  paddingVertical: 11,
                  borderBottomWidth: index === details.length - 1 ? 0 : 1,
                  borderColor: "#20354e",
                },
              ]}
            >
              <T style={[cs.label, { flex: 1, lineHeight: 18 }]}>
                {detail.label}
              </T>
              <T
                weight="medium"
                style={{
                  color: "#e1edf6",
                  fontSize: 12,
                  lineHeight: 18,
                  textAlign: "right",
                  flex: 1.2,
                }}
              >
                {detail.value}
              </T>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Detalhes da recarga"
          onPress={() => app.setSheet("details")}
          style={[
            s.between,
            {
              minHeight: 47,
              marginTop: 13,
              borderWidth: 1,
              borderColor: "#2a4b63",
              borderRadius: 13,
              paddingHorizontal: 16,
            },
          ]}
        >
          <T style={{ color: "#c3d6e7", fontSize: 13 }}>Detalhes da recarga</T>
          <T style={{ color: C.cyan, fontSize: 20 }}>›</T>
        </Pressable>
      </ScrollView>
      <View style={cs.footer}>
        <GradientButton
          title="Voltar para o início"
          onPress={() => app.go("home")}
          round={14}
        />
        <T
          style={{
            color: "#8ea7bd",
            fontSize: 10,
            lineHeight: 15,
            textAlign: "center",
            marginTop: 7,
          }}
        >
          {app.saved.active
            ? "Sua recarga continua enquanto você navega pelo app."
            : "Dados simulados. Nenhum carregador real está conectado."}
        </T>
      </View>
    </Page>
  );
}
const cs = StyleSheet.create({
  demo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#25445f",
    backgroundColor: "#10263e",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  metric: {
    flex: 1,
    minHeight: 77,
    borderRadius: 13,
    backgroundColor: "#11263e",
    borderWidth: 1,
    borderColor: "#213d57",
    padding: 12,
    justifyContent: "center",
  },
  label: { color: "#8fa9bf", fontSize: 10, lineHeight: 16 },
  metricValue: { color: "white", fontSize: 19, lineHeight: 26, marginTop: 4 },
  details: {
    borderWidth: 1,
    borderColor: "#25415b",
    borderRadius: 16,
    backgroundColor: "#102239",
    padding: 16,
    paddingBottom: 5,
    marginTop: 16,
  },
  footer: {
    backgroundColor: C.navy,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 5,
    borderTopWidth: 1,
    borderColor: "#20354e",
  },
});
