import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import SliderInput from "./SliderInput";
import { colors as C, fonts, gradient } from "./design/theme";
import { figmaAssets } from "./design/assets";
import { useApp, Route } from "./state";
export const TextLabel = ({
  children,
  style,
  weight = "regular",
  ...props
}: React.ComponentProps<typeof Text> & { weight?: keyof typeof fonts }) => (
  <Text
    {...props}
    style={[
      {
        fontFamily: fonts[weight],
        color: C.navy,
        fontSize: 15,
        lineHeight: 18,
        includeFontPadding: false,
      },
      style,
    ]}
  >
    {children}
  </Text>
);
export function Art({
  node = "168:2271",
  name,
  w,
  h = w,
  style,
  fit = "fill",
  label,
  blur = 0,
}: {
  node?: string;
  name: string;
  w: number | `${number}%`;
  h?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
  fit?: "fill" | "contain" | "cover";
  label?: string;
  blur?: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={[{ width: w, height: h, overflow: "hidden" }, style]}
      testID={`asset:${node}/${name}`}
    >
      <Image
        source={figmaAssets[node]?.[name]}
        style={StyleSheet.absoluteFill}
        contentFit={fit}
        accessibilityLabel={label}
        blurRadius={blur}
      />
    </View>
  );
}
export function Car({
  w = 92,
  gray = false,
  node = "168:2271",
}: {
  w?: number;
  gray?: boolean;
  node?: string;
}) {
  if (gray) return <Art node="92:685" name="imgCarro" w={w} h={w * 0.36842} />;
  return (
    <View style={{ width: w, height: w * 0.359375, overflow: "hidden" }}>
      <Art
        node={node}
        name="imgCarro"
        w={w * 1.3061}
        h={w * 0.359375 * 3.6056}
        style={{
          position: "absolute",
          top: -w * 0.359375 * 1.3239,
          left: -w * 0.1543,
        }}
      />
    </View>
  );
}
export const Chevron = ({
  color = C.ink,
  down = false,
}: {
  color?: string;
  down?: boolean;
}) => (
  <TextLabel
    style={{
      color,
      fontSize: 25,
      lineHeight: 28,
      transform: [{ rotate: down ? "90deg" : "0deg" }],
    }}
  >
    ›
  </TextLabel>
);
export function Range({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  thumb = "white",
  gradientTrack = false,
  onStart,
  size = 18,
  height = 12,
  dark = false,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  min?: number;
  max?: number;
  thumb?: string;
  gradientTrack?: boolean;
  onStart?: () => void;
  size?: number;
  height?: number;
  dark?: boolean;
}) {
  const [width, setWidth] = React.useState(0);
  const p = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height: 28, justifyContent: "center", width: "100%" }}
    >
      <View
        pointerEvents="none"
        style={{
          height,
          backgroundColor: dark ? C.navy : C.light,
          borderWidth: dark ? 1 : 0,
          borderColor: C.blue,
          borderRadius: 13,
          overflow: "hidden",
        }}
      >
        {gradientTrack && (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${p * 100}%`, height: "100%" }}
          />
        )}
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: size,
          height: size,
          left: p * Math.max(0, width - size),
          top: (28 - size) / 2,
          borderRadius: size / 2,
          backgroundColor: thumb,
          boxShadow: thumb === "white" ? "0px 1px 4px #00000040" : undefined,
        }}
      />
      <SliderInput
        label={label}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        onStart={onStart}
      />
    </View>
  );
}
export function Clock({ size = 25 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Art node="84:434" name="imgVector" w={size} />
      <Art
        node="84:434"
        name="imgVector1"
        w={size * 0.37}
        h={size * 0.5}
        style={{ position: "absolute", left: size * 0.4, top: size * 0.26 }}
      />
    </View>
  );
}
export function GradientButton({
  title,
  onPress,
  style,
  textStyle,
  testID,
  round = 9,
}: {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  testID?: string;
  round?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: pressed ? 0.75 : 1 }]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          minHeight: 51,
          borderRadius: round,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <TextLabel
          weight="semibold"
          style={[{ color: "white", textAlign: "center" }, textStyle]}
        >
          {title}
        </TextLabel>
      </LinearGradient>
    </Pressable>
  );
}
export function Outline({
  children,
  style,
  innerStyle,
  radius = 15,
}: React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  radius?: number;
}>) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius, padding: 1 }, style]}
    >
      <View
        style={[
          { backgroundColor: C.navy, borderRadius: radius - 1, flex: 1 },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}
export function Header({
  title,
  logo = false,
  onBack,
}: {
  title?: string;
  logo?: boolean;
  onBack?: () => void;
}) {
  const app = useApp();
  return (
    <View
      style={{
        height: 69,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <Pressable
        onPress={onBack ?? app.back}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        style={{ position: "absolute", left: 10, padding: 6, zIndex: 1 }}
      >
        <Art
          node="84:434"
          name="imgArrowUp"
          w={24}
          style={{ transform: [{ rotate: "-90deg" }] }}
        />
      </Pressable>
      {logo ? (
        <Art name="imgImage4" w={172} h={69} />
      ) : (
        <TextLabel
          weight="black"
          style={{
            color: "white",
            fontSize: 20,
            lineHeight: 25,
            letterSpacing: 1.8,
          }}
        >
          {title}
        </TextLabel>
      )}
    </View>
  );
}
export function StatusPreview({ dark = false }: { dark?: boolean }) {
  if (Platform.OS !== "web") return null;
  const color = dark ? "#000" : "#fff";
  return (
    <View
      style={{
        height: 43,
        paddingHorizontal: 42,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      accessibilityElementsHidden
    >
      <TextLabel
        weight="semibold"
        style={{ color, fontSize: 17, lineHeight: 22 }}
      >
        9:41
      </TextLabel>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <View style={{ flexDirection: "row", gap: 2, alignItems: "flex-end" }}>
          {[4, 7, 10, 13].map((h) => (
            <View
              key={h}
              style={{
                width: 3,
                height: h,
                borderRadius: 1,
                backgroundColor: color,
              }}
            />
          ))}
        </View>
        <Svg width={17} height={14} viewBox="0 0 17 14">
          <Path
            d="M1 4.5C5 1 12 1 16 4.5M4 7.5C7 5.3 10 5.3 13 7.5M7 10.5C8 9.8 9 9.8 10 10.5"
            stroke={color}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
        <View
          style={{
            width: 25,
            height: 12,
            borderWidth: 1,
            borderColor: `${color}99`,
            borderRadius: 3,
            padding: 1,
          }}
        >
          <View style={{ backgroundColor: color, flex: 1, borderRadius: 2 }} />
          <View
            style={{
              position: "absolute",
              right: -3,
              top: 3,
              width: 2,
              height: 4,
              borderRadius: 1,
              backgroundColor: color,
            }}
          />
        </View>
      </View>
    </View>
  );
}
export function BottomBar({ active = "home" }: { active?: Route }) {
  const { go } = useApp();
  const navNode =
    active === "profile"
      ? "153:276"
      : active === "map"
        ? "139:426"
        : "168:2271";
  const items = [
    { label: "Inicio", icon: "imgHome", route: "home" },
    { label: "Mapa", icon: "imgMapPin", route: "map" },
    { label: "QR Code", icon: "imgScan", route: "qr" },
    {
      label: "Viagem",
      icon: "imgCompass",
      route: "trip",
    },
    { label: "Perfil", icon: "imgAccountCircle", route: "profile" },
  ];
  return (
    <View style={s.nav}>
      {items.map((item, i) => (
        <Pressable
          key={item.label}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === item.route }}
          aria-selected={active === item.route}
          accessibilityLabel={item.label}
          onPress={() => go(item.route as Route)}
          style={[
            s.navItem,
            {
              position: "absolute",
              width: 64,
              height: 45,
              left: `${[10.7, 27.9, 50, 73.1, 90.8][i]}%`,
              marginLeft: -32,
            },
            i === 2 && { paddingTop: 30 },
          ]}
        >
          {i === 2 ? (
            <View style={s.qrBubble}>
              <Art node={navNode} name="imgScan" w={22.5} h={19.54} />
            </View>
          ) : (
            <Art
              node={i === 3 ? "168:2271" : navNode}
              name={item.icon}
              w={i === 4 ? 24 : 20}
              h={i === 1 ? 22 : i === 4 ? 24 : 20}
            />
          )}
          <TextLabel
            style={{
              color: active === item.route ? "#00b0ed" : "white",
              fontSize: 12,
              lineHeight: 15,
              marginTop: i === 2 ? 1 : 0,
            }}
          >
            {item.label}
          </TextLabel>
        </Pressable>
      ))}
    </View>
  );
}
export function Page({
  children,
  nav,
  dark = false,
  style,
  scroll = true,
  map = false,
}: React.PropsWithChildren<{
  nav?: Route;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  scroll?: boolean;
  map?: boolean;
}>) {
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === "web" ? 34 : Math.max(insets.bottom, 12);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: dark ? C.navy : "white",
        paddingTop: Platform.OS === "web" ? 0 : insets.top,
      }}
    >
      {!map && (
        <View style={{ backgroundColor: C.navy }}>
          <StatusPreview />
        </View>
      )}
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            { flexGrow: 1, backgroundColor: C.navy },
            style,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, style]}>{children}</View>
      )}
      {nav && <BottomBar active={nav} />}
      <View
        style={{
          height: bottom,
          backgroundColor: nav || dark ? C.navy : "white",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: Platform.OS === "web" ? 8 : 0,
        }}
      >
        {Platform.OS === "web" && (
          <View
            style={{
              width: 144,
              height: 5,
              borderRadius: 4,
              backgroundColor: dark || nav ? "white" : "black",
            }}
          />
        )}
      </View>
    </View>
  );
}
export function SmallHeading({
  children,
  style,
}: React.PropsWithChildren<{ style?: TextStyle }>) {
  return (
    <TextLabel weight="semibold" style={style}>
      {children}
    </TextLabel>
  );
}
export const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  whitePanel: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexGrow: 1,
  },
  darkPanel: {
    backgroundColor: C.navy,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexGrow: 1,
    borderTopWidth: 1,
    borderColor: C.blue,
  },
  pad: { paddingHorizontal: 16 },
  nav: {
    height: 46,
    flexDirection: "row",
    backgroundColor: C.navy,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    overflow: "visible",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  qrBubble: {
    width: 61,
    height: 58,
    borderRadius: 57,
    borderWidth: 4,
    borderColor: "white",
    backgroundColor: C.navy,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -34,
    boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
  },
});
