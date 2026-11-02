import React from "react";
import { View, Pressable, StyleSheet, TextInput } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import {
  Art,
  Car,
  GradientButton,
  Header,
  Outline,
  Page,
  SmallHeading,
  TextLabel as T,
  Range,
  s,
} from "../components";
import { colors as C, fonts } from "../design/theme";
import { useApp, money, decimal } from "../state";

const label = { color: "#ddf2ff", fontSize: 12, lineHeight: 15 };
function SimField({
  title,
  icon,
  children,
  onPress,
}: React.PropsWithChildren<{
  title: string;
  icon: string;
  onPress?: () => void;
}>) {
  return (
    <View
      style={{
        height: 73,
        borderWidth: 1,
        borderColor: "#00a2ffad",
        borderRadius: 15,
        paddingHorizontal: 19,
        paddingTop: 6,
      }}
    >
      <View style={[s.row, { height: 18, gap: 5 }]}>
        <Art node="226:1091" name={icon} w={25} h={20} fit="contain" />
        <T style={label}>{title}</T>
      </View>
      <Pressable
        disabled={!onPress}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={title}
        onPress={onPress}
        style={[
          s.row,
          {
            height: 33,
            borderWidth: 1,
            borderColor: "#00a2ffad",
            borderRadius: 7,
            marginTop: 5,
            paddingHorizontal: 13,
            gap: 16,
          },
        ]}
      >
        {children}
      </Pressable>
    </View>
  );
}
export function SimulationScreen() {
  const app = useApp();
  const { energy, minutes } = app;
  return (
    <Page dark>
      <Header logo />
      <View style={[s.darkPanel, { paddingTop: 15, paddingHorizontal: 16 }]}>
        <T
          weight="black"
          style={{
            color: "white",
            fontSize: 20,
            lineHeight: 25,
            letterSpacing: 1.8,
            marginLeft: 30,
          }}
        >
          Simule sua recarga
        </T>
        <T
          style={{
            color: "#d4d4d4",
            fontSize: 12,
            lineHeight: 15,
            marginLeft: 30,
            width: 270,
            marginTop: 6,
          }}
        >
          Escolha as opções abaixo para descobrir quanto custa recarregar seu
          carro
        </T>
        <View style={{ gap: 10, marginTop: 20 }}>
          <SimField
            title="Modelo do carro"
            icon="imgImage27"
            onPress={() => app.setSheet("vehicle-picker")}
          >
            <Art node="226:1091" name="imgCarro" w={41} h={15} />
            <T style={{ color: "#d4d4d4", fontSize: 12, flex: 1 }}>
              {app.selected
                ? `${app.vehicle.brand} ${app.vehicle.model}`
                : "Modelo do carro"}
            </T>
            <Art node="226:1091" name="imgChevronDown" w={16} />
          </SimField>
          <SimField
            title="Carregador"
            icon="imgInicio"
            onPress={() => {
              const power =
                app.power === 60 ? 150 : app.power === 150 ? 22 : 60;
              app.setPower(power);
              app.setConnector(power === 22 ? "Tipo 2" : "CCS 2");
              app.setStation(null);
            }}
          >
            <Art node="226:1091" name="imgImage29" w={25} h={26} />
            <T style={{ color: "#d4d4d4", fontSize: 12, flex: 1 }}>
              {app.power === 22 ? "AC 22kW" : `DC ${app.power}kW (rápido)`}
            </T>
            <Art node="226:1091" name="imgChevronDown" w={16} />
          </SimField>
          <SimField title="Horário de início" icon="imgImage28">
            <TextInput
              accessibilityLabel="Horário de início"
              value={app.time === "12:45" ? "14:25" : app.time}
              onChangeText={app.setTime}
              placeholder="14:25"
              maxLength={5}
              style={{
                color: "#d4d4d4",
                fontSize: 12,
                fontFamily: fonts.regular,
                flex: 1,
                outlineWidth: 0,
              }}
            />
            <Art node="226:1091" name="imgIcon" w={17} h={18} />
          </SimField>
        </View>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#00a2ffad",
            borderRadius: 15,
            height: 109,
            marginTop: 24,
            paddingHorizontal: 19,
            paddingTop: 6,
          }}
        >
          <View style={[s.row, { gap: 4 }]}>
            <Art node="226:1091" name="imgImage30" w={25} h={15} />
            <T style={[label, { flex: 1 }]}>Nível atual de bateria</T>
            <T weight="semibold" style={{ color: C.cyan, fontSize: 15 }}>
              {app.simReady ? app.current : "--"}%
            </T>
          </View>
          <Range
            label="Nível atual de bateria"
            value={app.current}
            onChange={(v) => {
              app.setCurrent(v);
              app.setTarget(Math.max(v, app.target));
            }}
            thumb={C.cyan}
            dark
          />
          <View style={[s.row, { gap: 5 }]}>
            <Art node="226:1091" name="imgImage31" w={25} h={19} />
            <T style={label}>
              Meta de carga {app.simReady ? `${app.target}%` : ""}
            </T>
          </View>
          <Range
            label="Meta de carga"
            value={app.simReady ? app.target : 0}
            onChange={(v) => {
              app.setTarget(Math.max(v, app.current));
            }}
            thumb={C.blue}
            dark
          />
        </View>
        <View
          style={{
            height: 109,
            marginTop: 17,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: "#00a2ffad",
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={["#00a2ff33", "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[StyleSheet.absoluteFill]}
          />
          <View style={[s.row, { flex: 1 }]}>
            <View style={{ width: "43%", alignItems: "center" }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Art
                  node="226:1091"
                  name="imgEllipse3"
                  w={56}
                  style={StyleSheet.absoluteFill}
                />
                <Art
                  node="226:1091"
                  name="imgEllipse5"
                  w={28}
                  h={37.22}
                  style={{ position: "absolute", right: 0, top: 0.06 }}
                />
                <Art node="226:1091" name="imgIcon1" w={22.6} h={14.8} />
              </View>
              <T
                weight="semibold"
                style={{ color: "white", fontSize: 20, lineHeight: 24 }}
              >
                {app.simReady ? money(app.cost) : "R$--"}
              </T>
              <T style={{ color: "#ddf2ff", fontSize: 10, lineHeight: 12 }}>
                Valor estimado da recarga
              </T>
            </View>
            <View
              style={{
                flex: 1,
                paddingHorizontal: 12,
                borderLeftWidth: 1,
                borderColor: C.cyan,
              }}
            >
              <View style={{ alignItems: "center", gap: 3 }}>
                <View style={s.row}>
                  <Art node="226:1091" name="imgImage29" w={25} h={26} />
                  <T
                    weight="semibold"
                    style={{ color: "white", marginLeft: 7 }}
                  >
                    {app.simReady ? decimal(energy) : "--"}kWh
                  </T>
                </View>
                <T style={label}>Energia necessária</T>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: C.cyan,
                  marginVertical: 8,
                }}
              />
              <View style={{ alignItems: "center", gap: 4 }}>
                <View style={[s.row, { gap: 14 }]}>
                  <Art node="226:1091" name="imgIcon" w={17} h={18} />
                  <T weight="semibold" style={{ color: "white" }}>
                    ~ {app.simReady ? minutes : "--"} min
                  </T>
                </View>
                <T style={label}>Tempo estimado</T>
              </View>
            </View>
          </View>
        </View>
        <View
          style={[
            s.row,
            {
              height: 39,
              marginTop: 36,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: "#00a2ffad",
              gap: 2,
            },
          ]}
        >
          <Art node="226:1091" name="imgImage33" w={39} h={29} />
          <T
            style={{
              color: "#ddf2ff",
              fontSize: 11,
              lineHeight: 13,
              flex: 1,
              paddingRight: 26,
            }}
          >
            O valor pode variar de acordo com o carregador, horário e tarifa
            aplicada
          </T>
        </View>
        {app.simReady && (
          <GradientButton
            title="Encontrar carregador"
            onPress={() => app.go("map")}
            style={{ marginTop: 18, marginBottom: 16 }}
          />
        )}
      </View>
    </Page>
  );
}
export { ConfigureScreen } from "./Configure";
export function SummaryScreen() {
  const app = useApp();
  return (
    <Page dark>
      <Header title="Resumo da Recarga" />
      <View
        style={[
          s.darkPanel,
          s.pad,
          { borderTopColor: "#00e585", paddingBottom: 35 },
        ]}
      >
        <View
          style={[s.row, { minHeight: 175, paddingHorizontal: 8, gap: 22 }]}
        >
          <Car w={114} gray />
          <View style={{ flex: 1 }}>
            <T weight="medium" style={c.white}>
              {app.vehicle.brand}
            </T>
            <T weight="medium" style={[c.white, { marginTop: 3 }]}>
              {app.vehicle.model}
            </T>
            <T style={{ color: "white", fontSize: 14, marginTop: 14 }}>
              Bateria: {app.vehicle.battery}% → {app.target}%
            </T>
            <T style={{ color: "white", fontSize: 14, marginTop: 10 }}>
              · {decimal(app.energy)} kWh
            </T>
          </View>
        </View>
        <Outline
          style={{ height: 219 }}
          radius={19}
          innerStyle={{ padding: 21 }}
        >
          <View style={{ flex: 1, flexDirection: "row", gap: 15 }}>
            <View style={{ flex: 1 }}>
              <View
                style={[
                  c.tableCell,
                  {
                    borderBottomWidth: 1,
                    borderColor: C.cyan,
                    paddingBottom: 14,
                  },
                ]}
              >
                <T style={c.tableLabel}>Energia total</T>
                <T weight="semibold" style={c.white}>
                  {decimal(app.energy)} kWh
                </T>
              </View>
              <View style={[c.tableCell, { paddingTop: 15 }]}>
                <T style={c.tableLabel}>Preço por kwh</T>
                <T weight="bold" style={{ color: "white", fontSize: 18 }}>
                  {money(app.tariff)}
                </T>
              </View>
            </View>
            <LinearGradient
              colors={[C.cyan, C.blue]}
              style={{ width: 1, height: 172, marginVertical: 2 }}
            />
            <View style={{ flex: 1 }}>
              <View
                style={[
                  c.tableCell,
                  {
                    borderBottomWidth: 1,
                    borderColor: C.cyan,
                    paddingBottom: 14,
                  },
                ]}
              >
                <T style={c.tableLabel}>Tempo estimado</T>
                <T weight="semibold" style={c.white}>
                  ~ {app.minutes} min
                </T>
              </View>
              <View style={[c.tableCell, { paddingTop: 15 }]}>
                <T style={c.tableLabel}>Valor estimado</T>
                <T
                  weight="bold"
                  style={{ color: "white", fontSize: 24, lineHeight: 29 }}
                >
                  {money(app.cost)}
                </T>
              </View>
            </View>
          </View>
        </Outline>
        <SmallHeading style={{ color: "white", marginTop: 29 }}>
          Forma de pagamento
        </SmallHeading>
        <Outline
          style={{ height: 90, marginTop: 22 }}
          innerStyle={[s.row, { paddingHorizontal: 10, gap: 33 }]}
        >
          <Art node="92:685" name="imgImage13" w={45} h={28} />
          <View style={{ flex: 1 }}>
            <T weight="semibold" style={{ color: "white", fontSize: 14 }}>
              .... {app.saved.card}
            </T>
            <T style={{ color: "white", fontSize: 14 }}>Mastercard</T>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => app.setSheet("payment")}
            style={{ padding: 20 }}
          >
            <T
              weight="semibold"
              style={{
                color: "#3bceff",
                fontSize: 14,
                textDecorationLine: "underline",
              }}
            >
              Trocar
            </T>
          </Pressable>
        </Outline>
        <GradientButton
          title="Confirmar e iniciar"
          onPress={app.start}
          style={{ width: 230, alignSelf: "center", marginTop: 70 }}
          textStyle={{ color: "#000", fontSize: 14 }}
        />
      </View>
    </Page>
  );
}
export { ChargingScreen } from "./ChargingStatus";
export function SuccessScreen() {
  const app = useApp();
  const charge = app.session;
  return (
    <Page dark style={{ minHeight: 797 }}>
      <View style={{ height: 365, alignItems: "center" }}>
        <Art node="101:986" name="imgImage17" w={198} />
        {[
          {
            left: 40.017,
            top: 49.677,
            w: 29.574,
            h: 78.077,
            rotate: "22.88deg",
          },
          {
            left: 307.929,
            top: 0.765,
            w: 29.574,
            h: 78.077,
            rotate: "112.88deg",
          },
          {
            left: 313.918,
            top: 136.608,
            w: 24.981,
            h: 65.949,
            rotate: "-129.4deg",
          },
          {
            left: 56.744,
            top: 137.337,
            w: 24.981,
            h: 65.949,
            rotate: "-71.49deg",
          },
        ].map((p, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: p.w,
              height: p.h,
              borderRadius: 54,
              overflow: "hidden",
              transform: [{ rotate: p.rotate }],
            }}
          >
            <Art
              node="101:986"
              name="imgImage15"
              w={p.w * 6.36}
              h={p.h * 2.4091}
              style={{ position: "absolute", left: 0, top: 0 }}
            />
          </View>
        ))}
        <T
          weight="semibold"
          style={{ color: "white", fontSize: 23, lineHeight: 29, marginTop: 6 }}
        >
          Recarga concluída!
        </T>
        <T
          weight="medium"
          style={{
            color: "white",
            fontSize: 20,
            lineHeight: 24,
            marginTop: 32,
          }}
        >
          Você adicionou{" "}
          <T style={{ color: "#00a3ff", fontSize: 20 }}>
            {decimal(charge?.energy ?? app.energy)} kWh
          </T>
        </T>
        <T
          style={{ color: "white", fontSize: 17, lineHeight: 21, marginTop: 6 }}
        >
          Tempo total: {charge?.minutes ?? app.minutes} min
        </T>
      </View>
      <Outline
        style={{ height: 194, marginHorizontal: 16 }}
        innerStyle={{ paddingHorizontal: 19, paddingTop: 12 }}
      >
        <T style={{ color: "white", fontSize: 16 }}>Valor total</T>
        <T
          weight="semibold"
          style={{
            color: "white",
            fontSize: 40,
            lineHeight: 48,
            marginTop: 15,
          }}
        >
          {money(charge?.cost ?? app.cost)}
        </T>
        <GradientButton
          round={36}
          title="Extrato"
          onPress={() => app.openReceipt()}
          style={{ marginTop: 15 }}
          textStyle={{ color: "#000", fontSize: 20 }}
        />
      </Outline>
      <View style={{ marginTop: 74, marginHorizontal: 16, gap: 14 }}>
        {[
          { title: "Voltar para o inicio", onPress: () => app.go("home") },
          { title: "Ver histórico", onPress: () => app.setSheet("history") },
        ].map((v) => (
          <Pressable
            key={v.title}
            accessibilityRole="button"
            accessibilityLabel={v.title}
            onPress={v.onPress}
          >
            <Outline
              style={{ height: 51 }}
              innerStyle={{ justifyContent: "center", alignItems: "center" }}
            >
              <T weight="medium" style={{ color: "white", fontSize: 16 }}>
                {v.title}
              </T>
            </Outline>
          </Pressable>
        ))}
      </View>
    </Page>
  );
}
const c = StyleSheet.create({
  rule: {
    height: 1,
    width: 253,
    alignSelf: "center",
    marginTop: 18,
    backgroundColor: "#b5b5b5",
  },
  metric: {
    height: 101,
    backgroundColor: C.light,
    borderRadius: 15,
    flex: 1,
    alignItems: "center",
  },
  white: { color: "white", fontSize: 15, lineHeight: 18 },
  tableLabel: {
    color: "white",
    fontSize: 17,
    lineHeight: 21,
    textAlign: "center",
  },
  tableCell: { flex: 1, alignItems: "center", justifyContent: "space-evenly" },
  liveMetric: { flex: 1, alignItems: "center", height: 71, paddingTop: 4 },
});
