import React, { useEffect, useId, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Svg, {
  Defs,
  Pattern,
  G,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { Art, GradientButton, Page, TextLabel as T, s } from "../components";
import { colors as C, fonts } from "../design/theme";
import { useApp, stations, money } from "../state";
import { BoltIcon, LocateIcon } from "../Icons";

function MapDrawing() {
  const gridId = `map-grid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <Svg
      width={1260}
      height={2040}
      viewBox="-420 -680 1260 2040"
      style={{ position: "absolute", left: -420, top: -680 }}
    >
      <Defs>
        <Pattern
          id={gridId}
          x={-62}
          y={-40}
          width={62}
          height={65}
          patternUnits="userSpaceOnUse"
        >
          <Rect width={62} height={65} fill="white" />
          <Rect width={48} height={51} rx={6} fill="#e4eae7" stroke="#dbe4df" />
        </Pattern>
      </Defs>
      <Rect x={-420} y={-680} width={1260} height={2040} fill="#edf2f0" />
      <G transform="rotate(-19 210 340)">
        <Rect
          x={-700}
          y={-900}
          width={1900}
          height={2700}
          fill={`url(#${gridId})`}
        />
      </G>
      <Path
        d="M345 0h75v680h-41c-38-56 16-105-18-153-30-42 20-91-3-130-27-45 34-115 0-158-30-37 23-96-13-139Z"
        fill="#cee5e9"
      />
      <G transform="rotate(-19 210 340)">
        {Array.from({ length: 12 }, (_, row) =>
          Array.from({ length: 9 }, (_, column) => (
            <Rect
              key={`${row}-${column}`}
              x={column * 62 - 62}
              y={row * 65 - 40}
              width={48}
              height={51}
              rx={6}
              fill={
                (row + column) % 7 === 0
                  ? "#cfe4d6"
                  : (row + column) % 4 === 0
                    ? "#e0e8e5"
                    : "#e4eae7"
              }
              stroke="#dbe4df"
              strokeWidth={1}
            />
          )),
        )}
        {Array.from({ length: 10 }, (_, i) => (
          <Path
            key={`h${i}`}
            d={`M-150 ${i * 65 + 18}H600`}
            stroke="white"
            strokeWidth={7}
          />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <Path
            key={`v${i}`}
            d={`M${i * 62 - 7} -150V850`}
            stroke="white"
            strokeWidth={7}
          />
        ))}
      </G>
      <Path
        d="M-50 490C70 435 160 410 240 310S343 158 440 135"
        stroke="#d8ded9"
        strokeWidth={24}
        fill="none"
      />
      <Path
        d="M-50 490C70 435 160 410 240 310S343 158 440 135"
        stroke="#fffef7"
        strokeWidth={18}
        fill="none"
      />
      <Path
        d="M-50 490C70 435 160 410 240 310S343 158 440 135"
        stroke="#e8dcb6"
        strokeWidth={2}
        strokeDasharray="7 6"
        fill="none"
      />
      <Path
        d="M-25 199c145 8 184 73 257 133S361 441 445 470"
        stroke="#d8ded9"
        strokeWidth={18}
        fill="none"
      />
      <Path
        d="M-25 199c145 8 184 73 257 133S361 441 445 470"
        stroke="white"
        strokeWidth={12}
        fill="none"
      />
      <Rect
        x={43}
        y={335}
        width={80}
        height={72}
        rx={18}
        fill="#c9e2d1"
        transform="rotate(-19 83 371)"
      />
      <Rect
        x={212}
        y={91}
        width={85}
        height={49}
        rx={12}
        fill="#d3e5d7"
        transform="rotate(-19 255 115)"
      />
      <SvgText
        x={35}
        y={153}
        fill="#899b95"
        fontSize={12}
        fontWeight="600"
        letterSpacing={1.5}
      >
        TAGUATINGA
      </SvgText>
      <SvgText x={205} y={531} fill="#899b95" fontSize={11} letterSpacing={1.5}>
        ÁGUAS CLARAS
      </SvgText>
      <SvgText
        x={153}
        y={360}
        fill="#a9a696"
        fontSize={9}
        transform="rotate(-49 153 360)"
      >
        AV. CENTRAL
      </SvgText>
    </Svg>
  );
}

export function MapScreen() {
  const app = useApp();
  const [search, setSearch] = useState("");
  const [size, setSize] = useState({ width: 402, height: 800 });
  const [expanded, setExpanded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const zoomLevel = useRef(1);
  const [pan] = useState(() => new Animated.ValueXY());
  const [zoom] = useState(() => new Animated.Value(1));
  const [slide] = useState(() => new Animated.Value(0));
  const selected = app.selectedStation;
  const normalized = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = stations.filter((station) =>
    normalized(`${station.name} ${station.area}`).includes(normalized(search)),
  );
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => listener.remove();
  }, []);
  const driver = Platform.OS !== "web";
  useEffect(() => {
    const scale = selected
      ? Math.max(1.1, (size.width / 420) * 1.45)
      : Math.max(0.86, size.width / 420);
    const focus = Math.max(135, (size.height - 355) / 2);
    const next = selected
      ? {
          x: -(selected.x - 210) * scale,
          y: focus - size.height / 2 - (selected.y - 340) * scale,
        }
      : { x: 0, y: -40 };
    zoomLevel.current = scale;
    slide.setValue(28);
    const animation = Animated.parallel([
      Animated.timing(pan, {
        toValue: next,
        duration: reduceMotion ? 0 : 650,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: driver,
      }),
      Animated.timing(zoom, {
        toValue: scale,
        duration: reduceMotion ? 0 : 650,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: driver,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: reduceMotion ? 0 : 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: driver,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [selected, size, pan, zoom, slide, reduceMotion, driver]);
  const [responder] = useState(() => {
    let dragStart = { x: 0, y: 0 };
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) + Math.abs(gesture.dy) > 9,
      onPanResponderGrant: () => {
        pan.stopAnimation((value) => {
          dragStart = value;
        });
      },
      onPanResponderMove: (_, gesture) => {
        const value = {
          x: Math.max(-360, Math.min(360, dragStart.x + gesture.dx)),
          y: Math.max(-430, Math.min(430, dragStart.y + gesture.dy)),
        };
        pan.setValue(value);
      },
    });
  });
  const changeZoom = (delta: number) => {
    const next = Math.max(0.85, Math.min(2.3, zoomLevel.current + delta));
    zoomLevel.current = next;
    Animated.timing(zoom, {
      toValue: next,
      duration: reduceMotion ? 0 : 250,
      useNativeDriver: driver,
    }).start();
  };
  const choose = (id: number) => {
    const station = stations[id];
    app.setStation(id);
    setSearch("");
    setExpanded(false);
    const compatible = station.connectors.filter(
      (c) =>
        !app.selected ||
        (c.type === "Tipo 2"
          ? (app.selected.maxAcKw ?? 7.4) > 0
          : (app.selected.maxDcKw ?? 60) > 0),
    );
    if (!compatible.some((c) => c.type === app.connector))
      app.setConnector(compatible[0]?.type ?? station.connectors[0].type);
  };
  return (
    <Page nav="map" scroll={false}>
      <View
        style={mp.map}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setSize((old) =>
            old.width === width && old.height === height
              ? old
              : { width, height },
          );
        }}
      >
        <View
          style={StyleSheet.absoluteFill}
          {...responder.panHandlers}
          testID="interactive-map"
        >
          <Animated.View
            style={{
              position: "absolute",
              width: 420,
              height: 680,
              left: (size.width - 420) / 2,
              top: (size.height - 680) / 2,
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { scale: zoom },
              ],
            }}
          >
            <MapDrawing />
            {stations.map((station) => (
              <Pressable
                key={station.id}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar ${station.name}`}
                accessibilityState={{ selected: selected?.id === station.id }}
                onPress={() => choose(station.id)}
                style={[
                  mp.marker,
                  { left: station.x - 24, top: station.y - 24 },
                  selected?.id === station.id && mp.activeMarker,
                ]}
              >
                <BoltIcon
                  color={selected?.id === station.id ? C.navy : "white"}
                  size={21}
                />
                <View style={mp.markerTip} />
              </Pressable>
            ))}
          </Animated.View>
        </View>
        <View style={[s.row, mp.search]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => (selected ? app.setStation(null) : app.go("home"))}
            style={{ padding: 9 }}
          >
            <T style={{ fontSize: 23, lineHeight: 26 }}>←</T>
          </Pressable>
          <TextInput
            accessibilityLabel="Pesquisar carregadores"
            placeholder="Buscar eletroposto ou região"
            placeholderTextColor="#8d9ca8"
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              if (selected) app.setStation(null);
            }}
            style={mp.input}
          />
          {!!search && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar pesquisa"
              onPress={() => setSearch("")}
              style={{ padding: 10 }}
            >
              <T>×</T>
            </Pressable>
          )}
        </View>
        <View style={mp.badge}>
          <View style={mp.dot} />
          <T style={{ fontSize: 9, color: "#52736b", lineHeight: 14 }}>
            MAPA ILUSTRATIVO · PRÉVIA
          </T>
        </View>
        <View style={mp.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aproximar mapa"
            onPress={() => changeZoom(0.25)}
            style={mp.control}
          >
            <T style={{ fontSize: 23 }}>+</T>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Afastar mapa"
            onPress={() => changeZoom(-0.25)}
            style={mp.control}
          >
            <T style={{ fontSize: 24 }}>−</T>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Centralizar mapa"
            onPress={() => {
              const value = selected
                ? {
                    x: -(selected.x - 210) * zoomLevel.current,
                    y:
                      Math.max(135, (size.height - 355) / 2) -
                      size.height / 2 -
                      (selected.y - 340) * zoomLevel.current,
                  }
                : { x: 0, y: -40 };
              Animated.timing(pan, {
                toValue: value,
                duration: reduceMotion ? 0 : 400,
                useNativeDriver: driver,
              }).start();
            }}
            style={[mp.control, { marginTop: 8 }]}
          >
            <LocateIcon />
          </Pressable>
        </View>
        <Animated.View
          style={[
            mp.panel,
            {
              maxHeight: Math.min(size.height * 0.59, 455),
              transform: [{ translateY: slide }],
            },
          ]}
          testID="station-panel"
        >
          <View style={mp.handle} />
          {selected ? (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingBottom: 4,
                }}
              >
                <View style={[s.row, { gap: 11 }]}>
                  <Art
                    node="139:426"
                    name={selected.image}
                    w={48}
                    h={52}
                    fit="cover"
                    style={{ borderRadius: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <T weight="bold" style={{ fontSize: 17, lineHeight: 23 }}>
                      {selected.name}
                    </T>
                    <T style={mp.caption}>{selected.area}</T>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Fechar detalhes do eletroposto"
                    onPress={() => app.setStation(null)}
                    style={{ padding: 6 }}
                  >
                    <T style={{ fontSize: 22 }}>×</T>
                  </Pressable>
                </View>
                <View style={[s.between, { marginVertical: 16 }]}>
                  <View>
                    <T style={mp.caption}>Tarifa da prévia</T>
                    <T weight="bold" style={{ color: C.ink }}>
                      {money(selected.price)}/kWh
                    </T>
                  </View>
                  <View>
                    <T style={mp.caption}>Disponíveis</T>
                    <T weight="semibold">{selected.available} conectores</T>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 9 }}>
                  {selected.connectors.map((connector) => {
                    const disabled =
                      !!app.selected &&
                      (connector.type === "Tipo 2"
                        ? (app.selected.maxAcKw ?? 7.4)
                        : (app.selected.maxDcKw ?? 60)) <= 0;
                    const checked = app.connector === connector.type;
                    return (
                      <Pressable
                        key={connector.type}
                        accessibilityRole="radio"
                        accessibilityLabel={connector.type}
                        accessibilityState={{ checked, disabled }}
                        aria-checked={checked}
                        disabled={disabled}
                        onPress={() => app.setConnector(connector.type)}
                        style={[
                          mp.connector,
                          {
                            borderColor: checked ? "#00b6c4" : "#dce6ed",
                            backgroundColor: checked ? "#edfbfa" : "#f8fafb",
                            opacity: disabled ? 0.45 : 1,
                          },
                        ]}
                      >
                        <View style={[s.row, { gap: 6 }]}>
                          <BoltIcon
                            size={16}
                            color={checked ? "#009a95" : "#79939e"}
                          />
                          <T weight="semibold" style={{ fontSize: 12 }}>
                            {connector.type}
                          </T>
                        </View>
                        <T style={mp.caption}>
                          Até {connector.powerKw} kW · {connector.available}{" "}
                          livres
                        </T>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Mais informações do eletroposto"
                  accessibilityState={{ expanded }}
                  onPress={() => setExpanded(!expanded)}
                  style={[s.between, { paddingVertical: 13 }]}
                >
                  <T style={{ fontSize: 12, color: C.ink }}>
                    {expanded ? "Menos informações" : "Horário e comodidades"}
                  </T>
                  <T style={{ color: C.ink }}>{expanded ? "−" : "+"}</T>
                </Pressable>
                {expanded && (
                  <View style={mp.more}>
                    <T style={{ fontSize: 12 }}>
                      Horário na prévia: {selected.hours}
                    </T>
                    <T style={mp.caption}>{selected.amenities.join(" · ")}</T>
                    <T style={mp.caption}>
                      Estacionamento sujeito às regras do local. Confirme
                      preços, horários e disponibilidade antes de ir.
                    </T>
                  </View>
                )}
                <T style={[mp.caption, { fontSize: 9 }]}>
                  Informações e posições ilustrativas; sem consulta de
                  disponibilidade em tempo real.
                </T>
              </ScrollView>
              <View style={{ padding: 16, paddingTop: 10 }}>
                <GradientButton
                  title="Recarregar"
                  onPress={() =>
                    app.selected
                      ? app.go("configure")
                      : app.setSheet("vehicle-picker")
                  }
                  round={13}
                  textStyle={{ color: C.navy }}
                />
              </View>
            </>
          ) : (
            <>
              <View
                style={[s.between, { paddingHorizontal: 20, marginBottom: 13 }]}
              >
                <View>
                  <T weight="bold" style={{ fontSize: 19, lineHeight: 25 }}>
                    Escolha onde recarregar
                  </T>
                  <T style={mp.caption}>
                    {filtered.length} eletropostos na demonstração
                  </T>
                </View>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 240 }}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 18,
                }}
              >
                {filtered.length ? (
                  filtered.map((station) => (
                    <Pressable
                      key={station.id}
                      accessibilityRole="button"
                      accessibilityLabel={station.name}
                      onPress={() => choose(station.id)}
                      style={mp.listItem}
                    >
                      <Art
                        node="139:426"
                        name={station.image}
                        w={42}
                        h={47}
                        fit="cover"
                        style={{ borderRadius: 9 }}
                      />
                      <View style={{ flex: 1 }}>
                        <T weight="semibold" style={{ fontSize: 12 }}>
                          {station.name}
                        </T>
                        <T style={mp.caption}>
                          {station.available} livres · até{" "}
                          {Math.max(
                            ...station.connectors.map((c) => c.powerKw),
                          )}{" "}
                          kW
                        </T>
                      </View>
                      <T
                        weight="semibold"
                        style={{ color: C.ink, fontSize: 12 }}
                      >
                        {money(station.price)}
                        <T style={{ color: "#8196a3", fontSize: 9 }}>/kWh</T>
                      </T>
                    </Pressable>
                  ))
                ) : (
                  <T style={{ padding: 20, textAlign: "center" }}>
                    Nenhum carregador encontrado.
                  </T>
                )}
              </ScrollView>
            </>
          )}
        </Animated.View>
      </View>
    </Page>
  );
}
const mp = StyleSheet.create({
  map: { flex: 1, overflow: "hidden", backgroundColor: "#edf2f0" },
  marker: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: "white",
    backgroundColor: "#008bc5",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 4px 12px #17394a30",
  },
  activeMarker: { backgroundColor: "#29e4b7", borderColor: "white", zIndex: 2 },
  markerTip: {
    position: "absolute",
    bottom: -4,
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: "white",
    transform: [{ rotate: "45deg" }],
  },
  search: {
    margin: 16,
    marginBottom: 9,
    backgroundColor: "white",
    borderRadius: 17,
    minHeight: 52,
    paddingHorizontal: 5,
    boxShadow: "0px 3px 16px #304a5a12",
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    paddingVertical: 14,
    paddingHorizontal: 3,
    outlineWidth: 0,
    color: C.navy,
  },
  badge: {
    alignSelf: "flex-start",
    marginLeft: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffffdc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#28ae8a" },
  controls: { position: "absolute", right: 17, top: 112, gap: 2 },
  control: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 3px 12px #304a5a16",
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: "white",
    paddingBottom: 7,
    boxShadow: "0px -5px 25px #28485812",
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 37,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#dbe5eb",
    marginTop: 10,
    marginBottom: 18,
  },
  caption: { fontSize: 10, lineHeight: 16, color: "#77909d", marginTop: 3 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e6edf2",
    borderRadius: 14,
    marginBottom: 8,
  },
  connector: { flex: 1, padding: 11, borderRadius: 12, borderWidth: 1 },
  more: {
    backgroundColor: "#f4f8fa",
    padding: 12,
    borderRadius: 12,
    marginBottom: 9,
  },
});
