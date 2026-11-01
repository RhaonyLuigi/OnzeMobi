import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  Art,
  Car,
  Chevron,
  Header,
  Page,
  SmallHeading,
  TextLabel as T,
  Range,
  s,
} from "../components";
import { colors as C } from "../design/theme";
import { useApp, Vehicle, decimal, money, Sheet } from "../state";
import { ChargeRing } from "../ChargeRing";

export function StationRow({
  index = 0,
  onPress,
  compact = false,
}: {
  index?: number;
  onPress: () => void;
  compact?: boolean;
}) {
  const names = ["Taguatinga Shopping", "Estacionamento Assaí", "Trade Center"];
  const available = [4, 2, 1],
    prices = ["2.20", "2.00", "1.89"];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={names[index]}
      onPress={onPress}
      style={[m.station, { height: 57 }]}
    >
      <Art
        node="139:426"
        name={
          index === 0
            ? "imgImage11"
            : index === 1
              ? "imgImages1"
              : "imgImages11"
        }
        w={39}
        fit="cover"
        style={{ borderRadius: 4 }}
      />
      <View
        style={{
          flex: 1,
          alignSelf: "stretch",
          justifyContent: "center",
          paddingLeft: 8,
          gap: 6,
        }}
      >
        <T
          weight="medium"
          numberOfLines={1}
          style={{
            color: "#000",
            fontSize: 12,
            lineHeight: 15,
            letterSpacing: 1.08,
          }}
        >
          {names[index]}
        </T>
        <View style={s.row}>
          {!compact && <Art name="imgZap" w={16} />}
          <T
            style={{
              color: "#969696",
              fontSize: 11,
              lineHeight: 13,
              letterSpacing: 0.99,
              paddingLeft: compact ? 17 : 4,
            }}
          >
            {available[index]} vagas disponíveis
          </T>
        </View>
      </View>
      <View
        style={[
          s.row,
          {
            backgroundColor: C.light,
            borderRadius: 14,
            height: 38,
            paddingHorizontal: 7,
            gap: 3,
          },
        ]}
      >
        <T
          weight="semibold"
          style={{ fontSize: 12, lineHeight: 15, color: C.ink }}
        >
          R$ {prices[index]}/kWh
        </T>
        {!compact && <Chevron />}
      </View>
    </Pressable>
  );
}
function HomeSimulation() {
  const app = useApp();
  const selected = app.selected;
  return (
    <View style={m.simulation}>
      <View style={[s.row, { height: 123, marginTop: 8 }]}>
        <View
          style={{
            width: 107,
            height: 113,
            justifyContent: "center",
            alignItems: "center",
            borderRightWidth: 1,
            borderColor: C.border,
          }}
        >
          <View style={{ width: 99, height: 99, alignItems: "center" }}>
            <Art name="imgEllipse2" w={99} style={StyleSheet.absoluteFill} />
            <Art
              name="imgEllipse1"
              w={4}
              h={5.983}
              style={{ position: "absolute", left: 47.5, top: 0 }}
            />
            <Art name="imgImage9" w={26} h={33} style={{ marginTop: 17 }} />
            <T weight="semibold" style={{ color: "#000", fontSize: 15 }}>
              {selected ? selected.battery : "--"}%
            </T>
            <T style={{ color: "#3c3c3c", fontSize: 10, lineHeight: 12 }}>
              Bateria atual
            </T>
          </View>
        </View>
        <View style={{ flex: 1, paddingLeft: 7 }}>
          <T style={m.microLabel}>Carga desejada</T>
          <T weight="semibold" style={{ color: "#000" }}>
            {selected ? app.target : "--"}%
          </T>
          <Range
            label="Carga desejada"
            value={selected ? app.target : 0}
            onChange={(v) => {
              if (selected) app.setTarget(Math.max(v, selected.battery));
            }}
            onStart={() => {
              if (!selected) app.setSheet("vehicle-picker");
            }}
            size={16}
          />
          <View
            style={{ height: 1, backgroundColor: C.border, marginVertical: 2 }}
          />
          <View style={[s.row, { height: 61 }]}>
            <View
              style={[
                s.row,
                { flex: 1, alignItems: "flex-start", paddingRight: 4 },
              ]}
            >
              <Art
                name="imgIcon1"
                w={18.25}
                h={20.83}
                style={{ marginTop: 3, marginRight: 6 }}
              />
              <View>
                <T style={[m.microLabel, { width: 68 }]}>Energia necessária</T>
                <View style={s.row}>
                  <T weight="semibold" style={{ color: "#000", fontSize: 15 }}>
                    {selected ? decimal(app.energy) : "--"}kWh
                  </T>
                  <Art name="imgIcon" w={10} h={6} style={{ marginLeft: 4 }} />
                </View>
              </View>
            </View>
            <View
              style={[
                s.row,
                {
                  borderLeftWidth: 1,
                  borderColor: C.border,
                  flex: 1,
                  paddingLeft: 6,
                  alignItems: "flex-start",
                },
              ]}
            >
              <Art
                name="imgIcon2"
                w={17}
                h={18}
                style={{ marginRight: 8, marginTop: 3 }}
              />
              <View>
                <T style={[m.microLabel, { width: 68 }]}>Tempo estimado</T>
                <T
                  weight="semibold"
                  style={{ color: "#000", marginTop: 3, fontSize: 15 }}
                >
                  ~ {selected ? app.minutes : "--"} min
                </T>
              </View>
            </View>
          </View>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Faça agora a sua simulação"
        onPress={() => app.go("simulation")}
        style={[
          s.row,
          {
            height: 41,
            marginHorizontal: 12,
            backgroundColor: "#e6f3ff",
            borderRadius: 10,
            paddingHorizontal: 13,
            marginTop: 5,
          },
        ]}
      >
        <Art name="imgImage10" w={23} h={30} />
        <T
          weight="semibold"
          style={{ color: C.ink, fontSize: 15, flex: 1, marginLeft: 9 }}
        >
          Faça agora a sua simulação
        </T>
        <Chevron color="#3b9eff" />
      </Pressable>
    </View>
  );
}
function ActiveCharge() {
  const app = useApp();
  return (
    <View style={[m.simulation, { height: 213 }]}>
      <View style={[s.between, { paddingHorizontal: 10, paddingTop: 5 }]}>
        <SmallHeading>Recarga em andamento</SmallHeading>
        <T style={{ fontSize: 12, color: "#00c887" }}>● Prévia</T>
      </View>
      <View style={[s.row, { flex: 1, paddingHorizontal: 8 }]}>
        <ChargeRing
          size={99}
          thickness={5}
          value={app.liveCharge.battery}
          track="#f3f3f3"
        >
          <Art name="imgImage9" w={26} h={33} />
          <T weight="semibold">{app.liveCharge.battery}%</T>
          <T style={{ fontSize: 10 }}>Carregando...</T>
        </ChargeRing>
        <View
          style={{
            flex: 1,
            marginLeft: 12,
            borderLeftWidth: 1,
            borderColor: C.border,
            padding: 12,
          }}
        >
          <View style={s.between}>
            <View>
              <T style={m.microLabel}>Energia adicionada</T>
              <T weight="semibold">{decimal(app.liveCharge.addedEnergy)} kWh</T>
            </View>
            <View>
              <T style={m.microLabel}>Tempo decorrido</T>
              <T weight="semibold">~{app.liveCharge.elapsed} min</T>
            </View>
          </View>
          <View
            style={{ height: 1, backgroundColor: C.border, marginVertical: 10 }}
          />
          <T style={[m.microLabel, { textAlign: "center" }]}>Valor estimado</T>
          <T
            weight="semibold"
            style={{ textAlign: "center", fontSize: 18, marginTop: 3 }}
          >
            {money(app.liveCharge.runningCost)}
          </T>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => app.go("charging")}
        style={[
          s.row,
          {
            margin: 12,
            marginTop: 0,
            height: 41,
            borderRadius: 10,
            backgroundColor: "#e6f3ff",
            justifyContent: "center",
            gap: 8,
          },
        ]}
      >
        <SmallHeading style={{ color: C.ink }}>
          Ver detalhes de recarga
        </SmallHeading>
        <Chevron color="#3b9eff" />
      </Pressable>
    </View>
  );
}
export function HomeScreen() {
  const app = useApp();
  return (
    <Page nav="home">
      <LinearGradient
        colors={[C.navy, C.navy, "#204f95"]}
        locations={[0, 0.35, 1]}
        style={{ height: 350, paddingHorizontal: 16 }}
      >
        <View style={{ height: 67, alignItems: "center" }}>
          <Art name="imgImage4" w={172} h={69} style={{ marginTop: -2 }} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificações"
            onPress={() => app.setSheet("notifications")}
            style={{ position: "absolute", right: 14, top: 13 }}
          >
            <Art name="imgNotificationIconlyPro" w={28} h={30} />
          </Pressable>
        </View>
        <T
          style={{
            color: "white",
            fontSize: 20,
            lineHeight: 24,
            letterSpacing: 1.8,
            marginTop: 8,
          }}
        >
          Olá
          {app.saved.profile.name !== "Nome"
            ? `, ${app.saved.profile.name.split(" ")[0]}`
            : ""}
          !
        </T>
        <T style={{ color: "#d4d4d4", fontSize: 14, lineHeight: 17 }}>
          Que bom te ver por aqui!
        </T>
        <LinearGradient
          colors={["#00d26a", "#00a8e8", "#0055d4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: 57, height: 3, borderRadius: 70, marginTop: 5 }}
        />
        <View
          style={{
            height: 202,
            borderRadius: 25,
            marginTop: 18,
            overflow: "hidden",
            paddingHorizontal: 25,
          }}
        >
          <Art
            name="imgRectangle7"
            w="100%"
            h={202}
            fit="cover"
            style={{ position: "absolute", left: 0, top: 0, borderRadius: 25 }}
          />
          <T
            weight="medium"
            style={{
              color: "white",
              fontSize: 16,
              lineHeight: 20,
              width: 167,
              marginTop: 24,
            }}
          >
            Carregue seu carro com mais praticidade
          </T>
          <T
            style={{
              color: "#c8c8c8",
              fontSize: 12,
              lineHeight: 15,
              maxWidth: 207,
              marginTop: 13,
            }}
          >
            Encontre o carregador mais próximo ou escaneie o QR Code
          </T>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Encontrar carregadores"
            onPress={() => {
              app.setStation(null);
              app.go("map");
            }}
            style={{
              backgroundColor: "#00ed7e",
              width: 174,
              height: 36,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 30,
              marginLeft: -2,
            }}
          >
            <T style={{ color: "#000", fontSize: 12 }}>
              Encontrar carregadores
            </T>
          </Pressable>
        </View>
      </LinearGradient>
      <View
        style={[
          s.whitePanel,
          {
            marginTop: 0,
            minHeight: 401,
            paddingHorizontal: 16,
            paddingBottom: 37,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Escolha seu veículo para recarregar"
          onPress={() => app.setSheet("vehicle-picker")}
          style={[s.row, { height: 62, gap: 10 }]}
        >
          <Car w={64} />
          <View style={{ flex: 1 }}>
            <T weight="semibold" style={{ color: "#000", lineHeight: 15 }}>
              {app.selected?.brand ?? "Marca"}
            </T>
            <T weight="semibold" style={{ color: "#000", lineHeight: 15 }}>
              {app.selected?.model ?? "Modelo"}
            </T>
            <T
              numberOfLines={1}
              style={{
                color: "#5c5c5c",
                fontSize: 12,
                letterSpacing: 1.08,
                lineHeight: 15,
              }}
            >
              Escolha seu veículo para recarregar
            </T>
          </View>
          <Chevron color="#000" />
        </Pressable>
        {app.saved.active ? (
          <ActiveCharge />
        ) : (
          <View style={{ marginTop: 16 }}>
            <HomeSimulation />
          </View>
        )}
        <View
          style={[
            s.between,
            { marginTop: app.saved.active ? 4 : 17, paddingHorizontal: 4 },
          ]}
        >
          <SmallHeading style={{ color: "#000" }}>
            Carregadores próximos
          </SmallHeading>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver todos os carregadores"
            onPress={() => {
              app.setStation(null);
              app.go("map");
            }}
            style={[s.row, { gap: 6 }]}
          >
            <T style={{ color: "#3b9eff", fontSize: 12 }}>Ver todos</T>
            <Art name="imgCornerUpRight" w={14} h={11} />
          </Pressable>
        </View>
        <View style={{ marginTop: 10 }}>
          <StationRow
            onPress={() => {
              app.setStation(0);
              app.go("map");
            }}
          />
        </View>
      </View>
    </Page>
  );
}
export function VehicleRow({
  vehicle,
  onPress,
  onEdit,
  disabled = false,
  checked = false,
}: {
  vehicle: Vehicle;
  onPress?: () => void;
  onEdit?: () => void;
  disabled?: boolean;
  checked?: boolean;
}) {
  return (
    <View
      style={[
        s.row,
        {
          height: 87,
          borderRadius: 8,
          paddingHorizontal: 7,
          backgroundColor: disabled ? "#aaa" : "white",
          boxShadow: "0px 1px 4px rgba(0,0,0,0.18)",
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${vehicle.brand} ${vehicle.model}`}
        disabled={disabled}
        onPress={onPress}
        style={[s.row, { flex: 1, gap: 10, height: "100%" }]}
      >
        <Car w={92} node="226:1394" />
        <View style={{ flex: 1 }}>
          <T weight="semibold" style={{ color: "#000" }}>
            {vehicle.brand}
          </T>
          <T weight="semibold" style={{ color: "#000" }}>
            {vehicle.model}
          </T>
          <T style={{ color: "#777", fontSize: 14, lineHeight: 20 }}>
            Bateria:{" "}
            {vehicle.id === "preview" || disabled ? "--" : vehicle.capacity} kWh
          </T>
          <T style={{ color: "#777", fontSize: 14, lineHeight: 20 }}>
            Autonomia:{" "}
            {vehicle.id === "preview" || disabled ? "--" : vehicle.range} km
          </T>
        </View>
      </Pressable>
      {checked ? (
        <T style={{ color: "#00e97e", fontSize: 25 }}>☑</T>
      ) : disabled ? (
        <T style={{ color: "#ee3333", fontSize: 25 }}>▱</T>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${vehicle.brand} ${vehicle.model}`}
          onPress={onEdit}
          style={{ padding: 13 }}
        >
          <Art node="226:1394" name="imgPencilSquare" w={24} />
        </Pressable>
      )}
    </View>
  );
}
export function GarageScreen() {
  const app = useApp();
  return (
    <Page nav="home">
      <Header title="Minha garagem" />
      <View style={[s.whitePanel, s.pad, { paddingTop: 54 }]}>
        <VehicleRow
          vehicle={{ ...app.vehicle, brand: "Exemplo", model: "Exemplo" }}
          disabled
        />
        <View style={{ gap: 16, marginTop: 16 }}>
          {app.saved.vehicles.map((v) => (
            <VehicleRow
              key={v.id}
              vehicle={v}
              onPress={() => {
                app.choose(v);
                app.go("home");
              }}
              onEdit={() => {
                app.setEditing(v);
                app.setSheet("vehicle-form");
              }}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar veículo"
          onPress={() => {
            app.setEditing(null);
            app.setSheet("vehicle-form");
          }}
          style={[
            s.row,
            {
              height: 51,
              marginTop: Math.max(
                44,
                135 - (app.saved.vehicles.length - 1) * 103,
              ),
              borderRadius: 9,
              backgroundColor: C.light,
              justifyContent: "center",
              gap: 14,
            },
          ]}
        >
          <T style={{ color: C.ink, fontSize: 22 }}>+</T>
          <T weight="semibold" style={{ color: C.ink }}>
            Adicionar veículo
          </T>
        </Pressable>
      </View>
    </Page>
  );
}
export function ProfileScreen() {
  const app = useApp();
  const rows: {
    title: string;
    subtitle: string;
    icon: string;
    sheet?: Sheet;
    size?: number;
  }[] = [
    {
      title: "Minha Garagem",
      subtitle: "Veículos cadastrados",
      icon: "imgVector1",
    },
    {
      title: "Minha Conta",
      subtitle: "Dados da conta",
      icon: "imgVector2",
      sheet: "account",
    },
    {
      title: "Meus Planos",
      subtitle: "Planos de assinatura",
      icon: "imgVector3",
      sheet: "plans",
    },
    {
      title: "Histórico",
      subtitle: "Extratos de recargas",
      icon: "imgVector4",
      sheet: "history",
    },
    {
      title: "Formas de pagamento",
      subtitle: "Cartões e métodos",
      icon: "imgIcon2",
      sheet: "payment",
    },
    {
      title: "Configurações",
      subtitle: "Idioma, tema e mais",
      icon: "settings",
      sheet: "settings",
    },
    {
      title: "Ajuda e suporte",
      subtitle: "F.A.Q, atendimento e Termos",
      icon: "imgQuestionSquare",
      sheet: "help",
    },
  ];
  return (
    <Page nav="profile">
      <LinearGradient colors={[C.navy, "#12315b"]} style={{ height: 266 }}>
        <Header title="Meu Perfil" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          onPress={() => app.setSheet("account")}
          style={{ width: 99, height: 99, alignSelf: "center" }}
        >
          <Art
            node="153:276"
            name="imgEllipse4"
            w={99}
            style={StyleSheet.absoluteFill}
          />
          <Art
            node="153:276"
            name="imgVector"
            w={62}
            h={62}
            style={{ position: "absolute", left: 18.5, top: 16 }}
          />
          <Art
            node="153:276"
            name="imgEllipse5"
            w={49.5}
            h={71.365}
            style={{ position: "absolute", right: 0, top: 0 }}
          />
          <Art
            node="153:276"
            name="imgEllipse9"
            w={34}
            h={32}
            style={{ position: "absolute", right: -7, bottom: -2 }}
          />
          <Art
            node="153:276"
            name="imgIcon1"
            w={24.9}
            h={18.5}
            style={{ position: "absolute", right: -2, bottom: 4 }}
          />
        </Pressable>
        <T
          weight="semibold"
          style={{
            color: "white",
            fontSize: 20,
            lineHeight: 24,
            letterSpacing: 1.8,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          {app.saved.profile.name}
        </T>
        <T
          weight="semibold"
          style={{
            color: "#c3c3c3",
            fontSize: 13,
            lineHeight: 17,
            letterSpacing: 1.17,
            textAlign: "center",
            marginTop: 7,
          }}
        >
          {app.saved.profile.email}
        </T>
      </LinearGradient>
      <View style={[s.whitePanel, { paddingTop: 10 }]}>
        {rows.map((row, i) => (
          <Pressable
            key={row.title}
            accessibilityRole="button"
            accessibilityLabel={row.title}
            onPress={() =>
              row.sheet ? app.setSheet(row.sheet) : app.go("garage")
            }
            style={[
              s.row,
              {
                height: i === 0 ? 55 : 62,
                paddingHorizontal: 16,
                gap: 17,
                borderBottomWidth: 1,
                borderColor: "#c3c3c3",
              },
            ]}
          >
            {row.icon === "settings" ? (
              <Art node="216:692" name="settings" w={30} />
            ) : (
              <Art
                node="153:276"
                name={row.icon}
                w={30}
                h={row.icon === "imgIcon2" ? 24 : 30}
              />
            )}
            <View style={{ flex: 1 }}>
              <T weight="semibold" style={{ color: "#000" }}>
                {row.title}
              </T>
              <T
                weight="medium"
                style={{
                  color: "#5c5c5c",
                  fontSize: 12,
                  lineHeight: 15,
                  letterSpacing: 1.08,
                }}
              >
                {row.subtitle}
              </T>
            </View>
            <Chevron />
          </Pressable>
        ))}
      </View>
    </Page>
  );
}
const m = StyleSheet.create({
  simulation: {
    height: 184,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
    backgroundColor: "white",
  },
  microLabel: {
    color: "#5c5c5c",
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.9,
  },
  station: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e4f2ff",
    borderRadius: 7,
    paddingHorizontal: 7,
    backgroundColor: "white",
  },
});
