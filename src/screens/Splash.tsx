import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { figmaAssets } from "../design/assets";
import { colors as C, fonts } from "../design/theme";
import { useApp } from "../state";

export function LaunchVisual({
  fontsReady = true,
  onImageReady,
}: {
  fontsReady?: boolean;
  onImageReady?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const compact = height < 720;
  return (
    <View style={styles.screen} testID="launch-screen">
      <Image
        source={figmaAssets["11:249"].imgImage5}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        cachePolicy="memory-disk"
        accessibilityLabel="Carro elétrico conectado a um eletroposto à noite"
        onDisplay={onImageReady}
        onError={onImageReady}
      />
      <LinearGradient
        colors={["#04101f80", "#04101f00", "#04101fe6", "#04101f"]}
        locations={[0, 0.47, 0.82, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: (Platform.OS === "web" ? 0 : insets.top) + 28,
            paddingBottom:
              (Platform.OS === "web" ? 0 : insets.bottom) + (compact ? 24 : 36),
          },
        ]}
      >
        <Image
          source={figmaAssets["11:249"].imgImage4}
          style={{ width: 208, height: 84, alignSelf: "center" }}
          contentFit="contain"
          accessibilityLabel="ONZE mobi"
        />
        <View style={styles.intro}>
          <Text
            style={[
              styles.eyebrow,
              fontsReady && { fontFamily: fonts.semibold },
            ]}
          >
            MOVA-SE COM O FUTURO
          </Text>
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              compact && { fontSize: 30, lineHeight: 36 },
              fontsReady && { fontFamily: fonts.bold },
            ]}
          >
            Mais energia.{"\n"}Novos caminhos.
          </Text>
          <Text
            style={[
              styles.description,
              fontsReady && { fontFamily: fonts.regular },
            ]}
          >
            Conecte seu carro. Explore novos destinos.{"\n"}A próxima jornada
            começa com a ONZE.
          </Text>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Preparando o aplicativo"
            style={[styles.loading, compact && { marginTop: 24 }]}
          >
            <ActivityIndicator size="small" color={C.cyan} />
            <Text
              style={[
                styles.loadingText,
                fontsReady && { fontFamily: fonts.medium },
              ]}
            >
              Preparando sua experiência
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function SplashScreen() {
  const { ready, route } = useApp();
  const router = useRouter();
  const [imageReady, setImageReady] = useState(false);
  useEffect(() => {
    if (!ready || !imageReady || route !== "splash") return;
    // Let the opening photograph display before leaving, including on a cold cache.
    const timer = setTimeout(() => router.replace("/login"), 2400);
    return () => clearTimeout(timer);
  }, [ready, imageReady, route, router]);
  return <LaunchVisual onImageReady={() => setImageReady(true)} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#04101f" },
  content: { flex: 1, paddingHorizontal: 28 },
  intro: { marginTop: "auto" },
  eyebrow: {
    color: "#5ce5d4",
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 2.4,
    marginBottom: 14,
  },
  title: {
    color: "white",
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -1.1,
  },
  description: {
    color: "#c0d1dd",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 16,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 36,
  },
  loadingText: { color: "#91aaba", fontSize: 11, lineHeight: 17 },
});
