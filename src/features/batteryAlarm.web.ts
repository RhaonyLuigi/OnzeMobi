let audio: AudioContext | null = null;

export async function prepareBatteryAlarm() {
  try {
    audio ??= new AudioContext();
    await audio.resume();
    return audio.state === "running";
  } catch {
    return false;
  }
}

export function alarmSoundReady() {
  return audio?.state === "running";
}

export async function deliverBatteryAlarm(threshold: number) {
  if (audio?.state === "running") {
    const context = audio;
    for (let i = 0; i < 3; i++) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + i * 0.45;
      oscillator.frequency.value = i === 1 ? 1046.5 : 880;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.35);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    }
  }
  if (
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification("ONZE mobi · Alerta de bateria", {
        body: `A bateria da demonstração chegou a ${threshold}%.`,
      });
    } catch {}
  }
}
