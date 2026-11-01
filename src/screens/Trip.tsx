import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Car, Header, Page, TextLabel as T, s } from "../components";
import { colors as C, fonts, gradient } from "../design/theme";
import { useApp, money, decimal } from "../state";
import {
  createDemoPlan,
  newTrip,
  readDestination,
  readJourney,
  readOrigin,
  samePlace,
  duration,
  priorities,
  type TripConversation,
  type TripPlan,
  type TripPriority,
} from "../features/trip";

function PlanCard({ plan }: { plan: TripPlan }) {
  const [expanded, setExpanded] = useState(false);
  const preference = priorities.find((p) => p.id === plan.priority)!;
  return (
    <View style={t.plan} testID="trip-plan">
      <View style={s.between}>
        <View style={[s.row, { gap: 6 }]}>
          <T style={{ color: C.ink, fontSize: 18 }}>✦</T>
          <T weight="bold" style={{ color: C.ink, fontSize: 14 }}>
            Seu plano de viagem
          </T>
        </View>
        <View style={t.demoPill}>
          <T
            weight="semibold"
            style={{ color: C.ink, fontSize: 10, lineHeight: 14 }}
          >
            EXEMPLO
          </T>
        </View>
      </View>
      <View style={{ marginTop: 16, gap: 10 }}>
        <View style={[s.row, { gap: 10 }]}>
          <View style={[t.point, { borderColor: C.cyan }]} />
          <T weight="medium" style={{ flex: 1 }}>
            {plan.origin}
          </T>
          <T style={t.smallGray}>Saída</T>
        </View>
        <View style={[s.row, { gap: 10 }]}>
          <View
            style={[t.point, { backgroundColor: C.blue, borderColor: C.blue }]}
          />
          <T weight="semibold" style={{ flex: 1 }}>
            {plan.destination}
          </T>
          <T style={t.smallGray}>Destino</T>
        </View>
      </View>
      <View style={t.summaryGrid}>
        {[
          { label: "Distância de exemplo", value: `${plan.distanceKm} km` },
          {
            label: "Tempo com recargas",
            value: duration(plan.driveMinutes + plan.chargeMinutes),
          },
          { label: "Paradas para recarga", value: String(plan.stops.length) },
          { label: "Custo das recargas", value: money(plan.cost) },
        ].map((metric) => (
          <View key={metric.label} style={{ width: "48%", paddingVertical: 4 }}>
            <T style={t.smallGray}>{metric.label}</T>
            <T
              weight="bold"
              style={{
                fontSize: 19,
                lineHeight: 25,
                color: C.ink,
                marginTop: 4,
              }}
            >
              {metric.value}
            </T>
          </View>
        ))}
      </View>
      <View style={[s.row, { gap: 7, marginTop: 12 }]}>
        <T style={{ color: "#009b73" }}>✓</T>
        <T style={{ color: "#356257", fontSize: 11, lineHeight: 16, flex: 1 }}>
          Reserva simulada de {plan.reserve}% · {preference.label.toLowerCase()}
        </T>
      </View>
      <T style={[t.smallGray, { marginTop: 6 }]}>
        {plan.vehicleName} · saída com {plan.initialBattery}%
      </T>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          expanded ? "Ocultar paradas" : "Ver paradas da viagem"
        }
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(!expanded)}
        style={[s.between, t.stopsButton]}
      >
        <T weight="semibold" style={{ color: C.ink, fontSize: 13 }}>
          {expanded
            ? "Ocultar paradas"
            : `Ver ${plan.stops.length} ${plan.stops.length === 1 ? "parada" : "paradas"} para recarga`}
        </T>
        <T style={{ color: C.blue, fontSize: 22 }}>{expanded ? "−" : "+"}</T>
      </Pressable>
      {expanded && (
        <View style={{ marginTop: 14 }}>
          {plan.stops.length === 0 ? (
            <T style={t.smallGray}>
              Este cenário não precisa de parada para recarga.
            </T>
          ) : (
            plan.stops.map((stop, i) => (
              <View
                key={stop.id}
                style={[s.row, { alignItems: "stretch", gap: 10 }]}
              >
                <View style={{ width: 24, alignItems: "center" }}>
                  <View style={t.stopNumber}>
                    <T
                      weight="bold"
                      style={{ color: C.ink, fontSize: 11, lineHeight: 18 }}
                    >
                      {i + 1}
                    </T>
                  </View>
                  {i < plan.stops.length - 1 && (
                    <View
                      style={{ flex: 1, width: 1, backgroundColor: C.border }}
                    />
                  )}
                </View>
                <View style={{ flex: 1, paddingBottom: 18 }}>
                  <T weight="semibold" style={{ fontSize: 12 }}>
                    {stop.name}
                  </T>
                  <T style={[t.smallGray, { marginTop: 4 }]}>
                    No km {stop.atKm} do trajeto ilustrativo
                  </T>
                  <T style={[t.smallGray, { marginTop: 4 }]}>
                    {stop.connector} · até {stop.powerKw} kW · {stop.minutes}{" "}
                    min
                  </T>
                  <T style={[t.smallGray, { marginTop: 4 }]}>
                    Bateria {stop.arrivalBattery}% → {stop.departureBattery}%
                  </T>
                  <T
                    weight="medium"
                    style={{ color: C.ink, fontSize: 12, marginTop: 5 }}
                  >
                    {decimal(stop.energyKwh)} kWh · {money(stop.cost)}
                  </T>
                </View>
              </View>
            ))
          )}
        </View>
      )}
      <View style={t.planNote}>
        <T style={{ color: "#607182", fontSize: 10, lineHeight: 15 }}>
          Trajeto hipotético de 420 km, independente das cidades informadas.
          Eletropostos, horários e tarifas são ilustrativos; não representam uma
          rota real.
        </T>
      </View>
    </View>
  );
}

export function TripScreen() {
  const app = useApp();
  const trip = app.saved.trip;
  const [draft, setDraft] = useState("");
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const send = (input = draft) => {
    const text = input.trim();
    if (!text) return;
    setDraft("");
    let next: TripConversation = {
      ...trip,
      messages: [
        ...trip.messages,
        {
          id: `user-${trip.messages.length}`,
          role: "user",
          text,
        },
      ],
    };
    const reply = (message: string) => {
      next = {
        ...next,
        messages: [
          ...next.messages,
          {
            id: `assistant-${next.messages.length}`,
            role: "assistant",
            text: message,
          },
        ],
      };
    };
    const build = () => {
      if (samePlace(next.origin, next.destination)) {
        next = { ...next, stage: "origin", plan: null };
        reply(
          "A origem e o destino são iguais. De qual outra cidade você vai sair?",
        );
        return;
      }
      next = {
        ...next,
        stage: "ready",
        plan: createDemoPlan({
          origin: next.origin,
          destination: next.destination,
          priority: next.priority,
          vehicle: app.vehicle,
        }),
      };
      reply(
        `Preparei uma prévia de ${next.origin} para ${next.destination}. Você pode comparar as prioridades e conferir as paradas abaixo. Os dados desta conversa são demonstrativos.`,
      );
    };
    const journey = readJourney(text);
    if (journey) {
      next = { ...next, ...journey };
      build();
    } else if (
      /^(oi|olá|ola|bom dia|boa tarde|boa noite)[!. ]*$/iu.test(text)
    ) {
      reply(
        next.stage === "origin"
          ? "Olá! De qual cidade você vai sair?"
          : "Olá! Me diga para onde você quer viajar. Você também pode escrever: de Brasília para Goiânia.",
      );
    } else if (trip.stage === "destination") {
      const destination = readDestination(text);
      if (destination.length < 2)
        reply("Me diga o nome da cidade ou do local de destino.");
      else {
        next = { ...next, destination, stage: "origin" };
        reply(
          `Vamos planejar sua viagem para ${destination}! De qual cidade você vai sair?`,
        );
      }
    } else if (trip.stage === "origin") {
      const origin = readOrigin(text);
      if (origin.length < 2) reply("Qual é a sua cidade de saída?");
      else {
        next = { ...next, origin };
        build();
      }
    } else if (/custo|econ[oô]m|economiz/iu.test(text)) {
      next = { ...next, priority: "cheapest" };
      build();
    } else if (/menos paradas|poucas paradas/iu.test(text)) {
      next = { ...next, priority: "fewest" };
      build();
    } else if (/tempo|r[aá]pid/iu.test(text)) {
      next = { ...next, priority: "fastest" };
      build();
    } else if (/paradas|eletropostos|postos|carregadores/iu.test(text)) {
      reply(
        "Toque em Ver paradas da viagem para conferir as recargas do cenário. Na versão conectada, o assistente consultará os eletropostos reais no caminho e a disponibilidade de cada um.",
      );
    } else {
      reply(
        "Nesta prévia, posso mudar a prioridade para menor tempo, menor custo ou menos paradas. Para trocar o trajeto, escreva de [origem] para [destino] ou toque em Nova conversa.",
      );
    }
    app.update({ trip: next });
  };
  const setPriority = (priority: TripPriority) => {
    const next = { ...trip, priority };
    if (trip.plan)
      next.plan = createDemoPlan({
        origin: trip.origin,
        destination: trip.destination,
        priority,
        vehicle: app.vehicle,
      });
    app.update({ trip: next });
  };
  const suggestions =
    trip.stage === "destination"
      ? ["Quero ir para Goiânia", "De Brasília para São Paulo"]
      : trip.stage === "origin"
        ? ["Brasília", "São Paulo", "Curitiba"]
        : [];
  return (
    <Page dark nav="trip" scroll={false}>
      <View style={{ position: "relative" }}>
        <Header title="Assistente ONZE" onBack={() => app.go("home")} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nova conversa"
          onPress={() => {
            app.update({ trip: newTrip() });
            setDraft("");
          }}
          style={{
            position: "absolute",
            right: 16,
            top: 20,
            height: 30,
            width: 30,
            borderWidth: 1,
            borderColor: "#2a4564",
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <T style={{ color: C.cyan, fontSize: 22 }}>+</T>
        </Pressable>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: "#f3f7fb",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflow: "hidden",
        }}
      >
        <View
          style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12 }}
        >
          <View style={[s.row, { gap: 12 }]}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={t.avatar}
            >
              <T style={{ color: C.navy, fontSize: 27, lineHeight: 33 }}>✦</T>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <T weight="bold" style={{ fontSize: 20, lineHeight: 25 }}>
                Sua próxima viagem.
              </T>
              <T style={{ color: "#64758a", fontSize: 12, marginTop: 3 }}>
                Mais planejamento. Mais tranquilidade.
              </T>
            </View>
          </View>
          <View style={[s.row, { gap: 6, marginTop: 12 }]}>
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: C.blue,
              }}
            />
            <T style={{ color: "#6a7d90", fontSize: 10, lineHeight: 14 }}>
              Modo demonstração · conversa e rota simuladas
            </T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Selecionar veículo da viagem"
            onPress={() => app.setSheet("vehicle-picker")}
            style={[s.row, t.vehicle]}
          >
            <Car w={37} />
            <View style={{ flex: 1 }}>
              <T weight="semibold" style={{ fontSize: 11, lineHeight: 15 }}>
                {app.selected
                  ? `${app.vehicle.brand} ${app.vehicle.model}`
                  : "Veículo de exemplo"}
              </T>
              <T style={{ color: "#758293", fontSize: 10, lineHeight: 14 }}>
                {app.vehicle.battery}% de bateria · {app.vehicle.connector}
              </T>
            </View>
            <T style={{ color: C.ink, fontSize: 11 }}>Trocar ›</T>
          </Pressable>
        </View>
        <ScrollView
          ref={scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 16,
            paddingTop: 2,
            gap: 16,
            paddingBottom: 20,
          }}
          onContentSizeChange={() =>
            scroll.current?.scrollToEnd({ animated: true })
          }
        >
          {trip.messages.map((message) => (
            <View
              key={message.id}
              style={{
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "94%",
              }}
            >
              {message.role === "assistant" && (
                <T
                  weight="semibold"
                  style={{
                    color: C.ink,
                    fontSize: 10,
                    lineHeight: 15,
                    marginBottom: 5,
                  }}
                >
                  ✦ ONZE assistente
                </T>
              )}
              <View
                style={[
                  t.bubble,
                  message.role === "user" ? t.userBubble : t.assistantBubble,
                ]}
              >
                <T
                  style={{
                    color: message.role === "user" ? "white" : "#3f536b",
                    fontSize: 13,
                    lineHeight: 20,
                  }}
                >
                  {message.text}
                </T>
              </View>
            </View>
          ))}
          {!!suggestions.length && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
              {suggestions.map((text) => (
                <Pressable
                  key={text}
                  accessibilityRole="button"
                  accessibilityLabel={text}
                  onPress={() => send(text)}
                  style={t.suggestion}
                >
                  <T style={{ color: C.ink, fontSize: 11, lineHeight: 16 }}>
                    {text} ↗
                  </T>
                </Pressable>
              ))}
            </View>
          )}
          {trip.stage === "ready" && (
            <View>
              <T weight="semibold" style={{ fontSize: 12, marginBottom: 9 }}>
                O que importa mais para você?
              </T>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {priorities.map((priority) => (
                  <Pressable
                    key={priority.id}
                    accessibilityRole="radio"
                    accessibilityLabel={priority.label}
                    aria-checked={trip.priority === priority.id}
                    onPress={() => setPriority(priority.id)}
                    style={[
                      t.priority,
                      trip.priority === priority.id && t.priorityActive,
                    ]}
                  >
                    <T
                      weight="semibold"
                      style={{
                        color:
                          trip.priority === priority.id ? C.ink : "#6a7d90",
                        fontSize: 10,
                        lineHeight: 15,
                        textAlign: "center",
                      }}
                    >
                      {priority.label}
                    </T>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {trip.plan && <PlanCard plan={trip.plan} />}
        </ScrollView>
        <View style={t.composer}>
          <View style={[s.row, { gap: 8 }]}>
            <TextInput
              accessibilityLabel="Mensagem para o assistente de viagem"
              placeholder={
                trip.stage === "origin"
                  ? "De onde você vai sair?"
                  : trip.stage === "ready"
                    ? "Pergunte sobre sua viagem..."
                    : "Para onde você quer viajar?"
              }
              placeholderTextColor="#8a99ab"
              value={draft}
              onChangeText={setDraft}
              maxLength={300}
              onSubmitEditing={() => send()}
              returnKeyType="send"
              style={t.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar mensagem"
              disabled={!draft.trim()}
              onPress={() => send()}
              style={({ pressed }) => ({
                opacity: pressed ? 0.65 : draft.trim() ? 1 : 0.4,
              })}
            >
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={t.send}
              >
                <T
                  weight="bold"
                  style={{ color: C.navy, fontSize: 22, lineHeight: 27 }}
                >
                  ↑
                </T>
              </LinearGradient>
            </Pressable>
          </View>
          <T
            style={{
              color: "#8a99ab",
              fontSize: 9,
              lineHeight: 13,
              textAlign: "center",
              marginTop: 7,
            }}
          >
            Prévia sem IA conectada. Não use como rota real.
          </T>
        </View>
      </KeyboardAvoidingView>
    </Page>
  );
}

const t = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicle: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e9f3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
    gap: 10,
  },
  bubble: { padding: 13, borderRadius: 16 },
  assistantBubble: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e3ebf3",
    borderTopLeftRadius: 3,
  },
  userBubble: { backgroundColor: "#12365f", borderBottomRightRadius: 3 },
  suggestion: {
    borderWidth: 1,
    borderColor: "#c9dff2",
    backgroundColor: "#eaf4ff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  composer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 37,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e3ebf3",
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: "#f3f7fb",
    borderWidth: 1,
    borderColor: "#e0e9f3",
    borderRadius: 14,
    paddingHorizontal: 13,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: C.navy,
    outlineWidth: 0,
  },
  send: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  priority: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#dce5ef",
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  priorityActive: { backgroundColor: "#e2f7f4", borderColor: "#00c9a6" },
  plan: {
    borderWidth: 1,
    borderColor: "#c2dff4",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
  },
  demoPill: {
    backgroundColor: C.light,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  point: { width: 9, height: 9, borderWidth: 2, borderRadius: 5 },
  smallGray: { color: "#7b8898", fontSize: 11, lineHeight: 16 },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 9,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eaf0f7",
    paddingVertical: 12,
    marginTop: 16,
  },
  stopsButton: {
    backgroundColor: C.light,
    paddingHorizontal: 12,
    minHeight: 41,
    borderRadius: 10,
    marginTop: 14,
  },
  stopNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#dff7ed",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a4e6d3",
  },
  planNote: {
    backgroundColor: "#f5f8fc",
    borderRadius: 9,
    padding: 10,
    marginTop: 12,
  },
});
