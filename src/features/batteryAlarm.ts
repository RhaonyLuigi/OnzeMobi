import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";

let permitted = false;
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function prepareBatteryAlarm() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("battery", {
      name: "Alerta de bateria",
      importance: AndroidImportance.HIGH,
      sound: "default",
    });
  }
  const result = await Notifications.requestPermissionsAsync();
  permitted = result.granted;
  return permitted;
}

export function alarmSoundReady() {
  return permitted;
}

export async function deliverBatteryAlarm(threshold: number) {
  if (!permitted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "ONZE mobi · Alerta de bateria",
      body: `A bateria da demonstração chegou a ${threshold}%.`,
      sound: "default",
    },
    trigger: Platform.OS === "android" ? { channelId: "battery" } : null,
  }).catch(() => {});
}
