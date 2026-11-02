import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { GradientButton, Range, TextLabel as T, s } from "../components";
import { colors as C } from "../design/theme";
import { useApp, money } from "../state";
import {
  alarmSoundReady,
  deliverBatteryAlarm,
  prepareBatteryAlarm,
} from "../features/batteryAlarm";
import { downloadReceipt } from "../features/downloadReceipt";
import { receiptRows } from "../features/receiptPdf";
import { BellIcon } from "../Icons";

export function AlarmSettings() {
  const app = useApp();
  const charge = app.liveCharge;
  const [threshold, setThreshold] = useState(
    Math.min(
      charge.target,
      Math.max(
        charge.battery + 1,
        app.saved.alarm?.threshold ?? Math.min(90, charge.target),
      ),
    ),
  );
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const active =
    app.saved.alarm?.sessionId === app.session?.id && app.saved.alarm;
  if (!app.saved.active || !app.session)
    return (
      <View style={ss.body}>
        <T style={ss.description}>
          Inicie uma recarga para definir um alerta de bateria.
        </T>
      </View>
    );
  if (charge.battery >= charge.target)
    return (
      <View style={ss.body}>
        <T style={ss.description}>
          A demonstração já atingiu a meta de {charge.target}%. Você pode
          concluir a sessão em Detalhes da recarga.
        </T>
      </View>
    );
  return (
    <View style={ss.body}>
      <View style={[s.row, { gap: 12 }]}>
        <View style={ss.icon}>
          <BellIcon color={C.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <T weight="semibold">Avise quando chegar a</T>
          <T style={{ color: C.gray, fontSize: 12, marginTop: 4 }}>
            Bateria atual: {charge.battery}% · meta: {charge.target}%
          </T>
        </View>
      </View>
      <T
        weight="bold"
        style={{
          color: C.ink,
          fontSize: 42,
          lineHeight: 52,
          textAlign: "center",
          marginTop: 22,
        }}
      >
        {threshold}%
      </T>
      <Range
        label="Porcentagem do alerta"
        min={charge.battery + 1}
        max={charge.target}
        value={Math.max(charge.battery + 1, threshold)}
        onChange={setThreshold}
        gradientTrack
      />
      <View style={s.between}>
        <T style={ss.small}>{charge.battery + 1}%</T>
        <T style={ss.small}>{charge.target}%</T>
      </View>
      <T style={ss.description}>
        O som toca uma vez quando a bateria da demonstração atinge a porcentagem
        escolhida. O alerta não interrompe a recarga.
      </T>
      <View style={ss.note}>
        <T style={ss.small}>
          Mantenha o app aberto e o volume ligado. Ao recarregar a página,
          reative o som aqui. Sem conexão com o carro, esta prévia acompanha
          somente a sessão simulada.
        </T>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Testar som do alarme"
        onPress={async () => {
          try {
            const ready = await prepareBatteryAlarm();
            setNotice(
              ready
                ? "Som de teste reproduzido. Confira o volume do aparelho."
                : "Som bloqueado. Libere o áudio ou as notificações do aplicativo; o aviso na tela continua disponível.",
            );
            if (ready) await deliverBatteryAlarm(threshold);
          } catch {
            setNotice(
              "Não foi possível tocar o som neste aparelho. O aviso na tela continua disponível.",
            );
          }
        }}
        style={ss.secondary}
      >
        <BellIcon color={C.ink} size={18} />
        <T weight="semibold" style={{ color: C.ink }}>
          Testar som
        </T>
      </Pressable>
      {!!notice && (
        <T accessibilityRole="status" style={[ss.small, { marginTop: 10 }]}>
          {notice}
        </T>
      )}
      <GradientButton
        title={busy ? "Salvando..." : "Salvar alerta"}
        onPress={async () => {
          if (busy) return;
          if (threshold <= charge.battery || threshold > charge.target) {
            setNotice(
              `Escolha uma porcentagem acima de ${charge.battery}% e até ${charge.target}%.`,
            );
            return;
          }
          setBusy(true);
          let sound = false;
          try {
            sound = await prepareBatteryAlarm();
          } catch {}
          app.update({
            alarm: { sessionId: app.session!.id, threshold, triggered: false },
          });
          app.setSheet(null);
          app.setToast(
            sound
              ? `Alerta salvo para ${threshold}%. Mantenha o app aberto.`
              : `Aviso visual salvo para ${threshold}%. O som está bloqueado.`,
          );
          setBusy(false);
        }}
        style={{ marginTop: 18 }}
        round={13}
      />
      {active && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Avançar demonstração até o alerta"
            onPress={() => {
              app.advanceDemo(active.threshold);
              app.setSheet(null);
            }}
            style={ss.secondary}
          >
            <T style={{ color: C.ink, fontSize: 12 }}>
              Avançar demonstração até {active.threshold}%
            </T>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remover alerta"
            onPress={() => {
              app.update({ alarm: null });
              app.setSheet(null);
            }}
            style={{ padding: 15, alignItems: "center" }}
          >
            <T style={{ color: "#b3261e", fontSize: 12 }}>Remover alerta</T>
          </Pressable>
        </>
      )}
      {active && !alarmSoundReady() && (
        <T style={ss.small}>
          Toque em Testar som para reativar o áudio nesta sessão.
        </T>
      )}
    </View>
  );
}

export function ReceiptSheet() {
  const app = useApp();
  const charge = app.receipt ?? app.session;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!charge)
    return (
      <View style={ss.body}>
        <T style={ss.description}>
          Conclua uma recarga para consultar seu extrato.
        </T>
      </View>
    );
  return (
    <View style={ss.body} testID="charge-receipt">
      <View style={{ padding: 18, borderRadius: 15, backgroundColor: C.navy }}>
        <T style={{ color: "#b8d5e7", fontSize: 12 }}>
          Total da recarga demonstrativa
        </T>
        <T
          weight="bold"
          style={{ color: "white", fontSize: 30, lineHeight: 39, marginTop: 8 }}
        >
          {money(charge.cost)}
        </T>
      </View>
      <View style={{ marginTop: 16 }}>
        {receiptRows(charge).map(([label, value]) => (
          <View
            key={label}
            style={[
              s.between,
              {
                alignItems: "flex-start",
                gap: 16,
                paddingVertical: 11,
                borderBottomWidth: 1,
                borderColor: "#e8eff5",
              },
            ]}
          >
            <T style={[ss.small, { flex: 1 }]}>{label}</T>
            <T
              weight="medium"
              style={{
                flex: 1.45,
                textAlign: "right",
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              {value}
            </T>
          </View>
        ))}
      </View>
      <T style={[ss.small, { marginTop: 14 }]}>
        Documento de demonstração, sem cobrança real. Não é nota fiscal nem
        comprovante de pagamento.
      </T>
      {!!error && (
        <T
          accessibilityRole="alert"
          style={{ fontSize: 12, color: "#b3261e", marginTop: 12 }}
        >
          {error}
        </T>
      )}
      <GradientButton
        title={busy ? "Preparando PDF..." : "Baixar extrato em PDF"}
        onPress={async () => {
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            await downloadReceipt(charge);
          } catch (error) {
            console.error("Não foi possível gerar o extrato", error);
            setError("Não foi possível baixar o PDF. Tente novamente.");
          } finally {
            setBusy(false);
          }
        }}
        style={{ marginTop: 20 }}
        round={13}
      />
    </View>
  );
}

export function BatteryAlarmAlert() {
  const app = useApp();
  return (
    <Modal
      visible={app.alarmRinging}
      transparent
      animationType="fade"
      onRequestClose={() => app.setAlarmRinging(false)}
    >
      <View style={ss.overlay}>
        <View
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={ss.alert}
        >
          <View
            style={[
              ss.icon,
              { alignSelf: "center", width: 64, height: 64, borderRadius: 32 },
            ]}
          >
            <BellIcon color={C.ink} size={28} />
          </View>
          <T
            weight="bold"
            style={{
              fontSize: 22,
              lineHeight: 29,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            Bateria em {app.saved.alarm?.threshold}%
          </T>
          <T style={[ss.description, { textAlign: "center" }]}>
            Sua recarga de demonstração atingiu a porcentagem do alerta.
          </T>
          <GradientButton
            title="Entendi"
            onPress={() => app.setAlarmRinging(false)}
            style={{ marginTop: 24 }}
            round={13}
          />
        </View>
      </View>
    </Modal>
  );
}
const ss = StyleSheet.create({
  body: { padding: 20 },
  description: {
    color: "#526477",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 16,
  },
  small: { color: "#62758a", fontSize: 11, lineHeight: 17 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.light,
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    padding: 13,
    borderRadius: 12,
    backgroundColor: C.light,
    marginTop: 16,
  },
  secondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    padding: 15,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    marginTop: 16,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#020e22aa",
  },
  alert: {
    width: "100%",
    maxWidth: 360,
    padding: 26,
    borderRadius: 24,
    backgroundColor: "white",
  },
});
