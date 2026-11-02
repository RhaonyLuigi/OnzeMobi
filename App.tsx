import React from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { AppProvider, useApp } from "./src/state";
import { Stack } from "expo-router";
import { Sheets } from "./src/screens/Sheets";
import { TextLabel } from "./src/components";
import { colors } from "./src/design/theme";
import { LaunchVisual } from "./src/screens/Splash";
import { BatteryAlarmAlert } from "./src/screens/SessionSheets";
function Content() {
  const app = useApp();
  return (
    <>
      <StatusBar style={app.route === "map" ? "dark" : "light"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: colors.navy },
        }}
      />
      <Sheets />
      <BatteryAlarmAlert />
      {!!app.toast && (
        <View style={styles.toast} accessibilityRole="alert">
          <TextLabel
            style={{ color: "white", fontSize: 13, textAlign: "center" }}
          >
            {app.toast}
          </TextLabel>
        </View>
      )}
    </>
  );
}
export default function App() {
  const [loaded, error] = useFonts({
    Inter_400Regular: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    Inter_500Medium: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
    Inter_600SemiBold: require("@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf"),
    Inter_700Bold: require("@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf"),
    Inter_900Black: require("@expo-google-fonts/inter/900Black/Inter_900Black.ttf"),
  });
  const { height } = useWindowDimensions();
  return (
    <SafeAreaProvider>
      <View style={styles.outer}>
        <View style={[styles.phone, Platform.OS === "web" && { height }]}>
          {!loaded && !error ? (
            <LaunchVisual fontsReady={false} />
          ) : (
            <AppProvider>
              <Content />
            </AppProvider>
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#050e1c", alignItems: "center" },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 430 : undefined,
    backgroundColor: colors.navy,
    overflow: "hidden",
    position: "relative",
  },
  toast: {
    position: "absolute",
    bottom: 95,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#132f4f",
    borderWidth: 1,
    borderColor: colors.cyan,
    zIndex: 20,
  },
});
