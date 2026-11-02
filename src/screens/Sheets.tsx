import React, { useState } from "react";
import {
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import {
  Art,
  Car,
  Chevron,
  GradientButton,
  Range,
  TextLabel as T,
  s,
} from "../components";
import { colors as C, fonts } from "../design/theme";
import {
  useApp,
  Vehicle,
  sampleVehicle,
  money,
  decimal,
  Sheet,
} from "../state";
import { VehicleRow } from "./Main";
import { ConnectorChoice } from "./Discovery";
import { vehicleCatalog } from "../features/vehicles";
import { AlarmSettings, ReceiptSheet } from "./SessionSheets";
function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard = "default",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: "default" | "numeric" | "email-address";
  maxLength?: number;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <T style={{ color: "#000", fontSize: 13, lineHeight: 17, marginLeft: 3 }}>
        {label}
      </T>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder ?? label}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        maxLength={maxLength}
        placeholderTextColor="#bfbfbf"
        style={sh.input}
      />
    </View>
  );
}
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 12 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
      >
        <View style={s.between}>
          <T
            style={{
              color: "#000",
              fontSize: 13,
              lineHeight: 17,
              marginLeft: 3,
            }}
          >
            {label}
          </T>
          <Chevron color="#000" down />
        </View>
        <View style={[sh.input, { justifyContent: "center" }]}>
          <T style={{ color: "#000", fontSize: 13 }}>{value}</T>
        </View>
      </Pressable>
      {open && (
        <View
          style={{
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 6,
            marginTop: 3,
          }}
        >
          {options.map((v) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={v}
              key={v}
              onPress={() => {
                onChange(v);
                setOpen(false);
              }}
              style={{ padding: 9, borderBottomWidth: 1, borderColor: "#eee" }}
            >
              <T style={{ fontSize: 13 }}>{v}</T>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
function VehicleForm() {
  const app = useApp();
  const editing = app.editing;
  const [brand, setBrand] = useState(
    editing?.brand === "Marca" ? "" : (editing?.brand ?? ""),
  );
  const [model, setModel] = useState(
    editing?.model === "Modelo" ? "" : (editing?.model ?? ""),
  );
  const [year, setYear] = useState(editing?.year ?? "2026");
  const [plate, setPlate] = useState(editing?.plate ?? "");
  const [connector, setConnector] = useState(editing?.connector ?? "Tipo 2");
  const [battery, setBattery] = useState(editing?.battery ?? 50);
  const [capacity, setCapacity] = useState(String(editing?.capacity ?? 60));
  const [range, setRange] = useState(String(editing?.range ?? 300));
  const [ac, setAc] = useState(String(editing?.maxAcKw ?? 7.4));
  const [dc, setDc] = useState(String(editing?.maxDcKw ?? 60));
  const [technical, setTechnical] = useState(false);
  const [error, setError] = useState("");
  const save = () => {
    if (!brand || !model) return setError("Selecione a marca e o modelo.");
    const numeric = (value: string) => Number(value.replace(",", "."));
    if (
      ![capacity, range, ac, dc].every(
        (v) => v.trim() !== "" && Number.isFinite(numeric(v)),
      ) ||
      numeric(capacity) <= 0 ||
      numeric(capacity) > 250 ||
      numeric(range) <= 0 ||
      numeric(range) > 1500 ||
      numeric(ac) <= 0 ||
      numeric(dc) < 0
    )
      return setError(
        "Confira a capacidade, a autonomia e as potências do veículo.",
      );
    if (connector === "CCS 2" && numeric(dc) === 0)
      return setError(
        "Este veículo não tem potência DC informada. Selecione Tipo 2 ou ajuste os dados técnicos.",
      );
    if (
      !/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(
        plate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      )
    )
      return setError("Informe uma placa válida, como AAA1A23.");
    const v: Vehicle = {
      ...sampleVehicle,
      id: editing?.id ?? Date.now().toString(),
      brand,
      model,
      year,
      plate: plate.toUpperCase(),
      connector,
      capacity: numeric(capacity),
      range: numeric(range),
      maxAcKw: numeric(ac),
      maxDcKw: numeric(dc),
      battery,
    };
    app.saveVehicle(v);
    app.setToast(editing ? "Veículo atualizado." : "Veículo cadastrado.");
  };
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 }}>
      <View style={[s.row, { gap: 20, marginBottom: 18 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => app.setSheet(app.vehicleFormReturn)}
        >
          <T style={{ color: "#000", fontSize: 28 }}>←</T>
        </Pressable>
        <View>
          <T weight="semibold" style={{ color: "#000", fontSize: 15 }}>
            {editing ? "Editar veículo" : "Cadastrar veículo"}
          </T>
          <T style={{ color: "#5c5c5c", fontSize: 12, letterSpacing: 1.08 }}>
            Cadastre seu veículo para recarga
          </T>
        </View>
      </View>
      <Select
        label="Marca do veículo"
        value={brand || "Marca"}
        options={Object.keys(vehicleCatalog)}
        onChange={(v) => {
          setBrand(v);
          setModel("");
          setError("");
        }}
      />
      <Select
        label="Modelo do veículo"
        value={model || "Modelo"}
        options={
          Object.keys(vehicleCatalog[brand] ?? {}).length
            ? Object.keys(vehicleCatalog[brand])
            : ["Selecione a marca"]
        }
        onChange={(v) => {
          if (brand) {
            setModel(v);
            const data = vehicleCatalog[brand][v];
            if (data) {
              setCapacity(String(data.capacity));
              setRange(String(data.range));
              setAc(String(data.maxAcKw));
              setDc(String(data.maxDcKw));
            }
          }
        }}
      />
      <Select
        label="Ano de Fabricação"
        value={year}
        options={["2023", "2024", "2025", "2026"]}
        onChange={setYear}
      />
      <Field
        label="Placa do veículo"
        placeholder="AAA1A23"
        value={plate}
        maxLength={7}
        onChange={(v) => setPlate(v.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
      />
      <T
        style={{ color: "#000", fontSize: 13, marginTop: 13, marginBottom: 14 }}
      >
        Tipo de Conector
      </T>
      <ConnectorChoice value={connector} onChange={setConnector} />
      <View
        style={{
          backgroundColor: C.light,
          padding: 14,
          borderRadius: 12,
          marginTop: 20,
        }}
      >
        <View style={s.between}>
          <T weight="semibold" style={{ fontSize: 13 }}>
            Bateria atual do veículo
          </T>
          <T weight="bold" style={{ color: C.ink }}>
            {battery}%
          </T>
        </View>
        <Range
          label="Bateria atual do veículo"
          value={battery}
          onChange={setBattery}
          gradientTrack
        />
        <T style={{ fontSize: 11, lineHeight: 16, color: C.gray }}>
          Informe a porcentagem que aparece no painel do carro.
        </T>
      </View>
      {!!model && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajustar dados técnicos"
            accessibilityState={{ expanded: technical }}
            onPress={() => setTechnical(!technical)}
            style={[s.between, { marginTop: 18, paddingVertical: 8 }]}
          >
            <View>
              <T weight="semibold" style={{ fontSize: 13 }}>
                Dados para a simulação
              </T>
              <T style={{ fontSize: 11, color: C.gray, marginTop: 4 }}>
                {capacity} kWh · {range} km de autonomia
              </T>
            </View>
            <Chevron down={!technical} />
          </Pressable>
          {technical && (
            <>
              <Field
                label="Capacidade da bateria (kWh)"
                value={capacity}
                onChange={setCapacity}
                keyboard="numeric"
              />
              <Field
                label="Autonomia com carga completa (km)"
                value={range}
                onChange={setRange}
                keyboard="numeric"
              />
              <Field
                label="Potência máxima AC (kW)"
                value={ac}
                onChange={setAc}
                keyboard="numeric"
              />
              <Field
                label="Potência máxima DC (kW)"
                value={dc}
                onChange={setDc}
                keyboard="numeric"
              />
            </>
          )}
          <T
            style={{
              fontSize: 11,
              lineHeight: 17,
              color: C.gray,
              marginTop: 7,
            }}
          >
            Valores de referência da prévia. Ajuste conforme a versão do seu
            veículo; use 0 em DC se não houver recarga rápida.
          </T>
        </>
      )}
      {!!error && (
        <T
          accessibilityRole="alert"
          style={{ color: "#b3261e", fontSize: 12, marginTop: 9 }}
        >
          {error}
        </T>
      )}
      <GradientButton
        title={editing ? "Salvar veículo" : "Cadastrar Veículo"}
        onPress={save}
        style={{ width: 243, alignSelf: "center", marginTop: 28 }}
      />
      {editing && editing.id !== "preview" && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            app.update({
              vehicles: app.saved.vehicles.filter((v) => v.id !== editing.id),
              selected:
                app.saved.selected === editing.id ? null : app.saved.selected,
            });
            app.setSheet(app.vehicleFormReturn);
          }}
          style={{ alignSelf: "center", padding: 12 }}
        >
          <T style={{ color: "#b3261e", fontSize: 13 }}>Remover veículo</T>
        </Pressable>
      )}
    </View>
  );
}
function GarageContent() {
  const app = useApp();
  const origin = app.sheet === "garage" ? "garage" : "vehicle-picker";
  return (
    <View style={sh.body}>
      {!app.saved.vehicles.length && (
        <View style={{ alignItems: "center", paddingVertical: 28 }}>
          <Car w={120} />
          <T weight="semibold" style={{ marginTop: 22 }}>
            Sua garagem começa aqui
          </T>
          <T style={[sh.description, { textAlign: "center" }]}>
            Cadastre um veículo para personalizar a simulação e escolher onde
            recarregar.
          </T>
        </View>
      )}
      <View style={{ gap: 16 }}>
        {app.saved.vehicles.map((v) => (
          <VehicleRow
            key={v.id}
            vehicle={v}
            checked={app.selected?.id === v.id}
            onPress={() => app.choose(v, origin !== "garage")}
            onEdit={() => app.openVehicleForm(v, origin)}
          />
        ))}
      </View>
      <GradientButton
        title="Adicionar veículo"
        onPress={() => app.openVehicleForm(null, origin)}
        style={{ marginTop: 22 }}
      />
      {app.selected && origin === "garage" && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recarregar veículo"
          onPress={() => app.go("map")}
          style={{ padding: 15, alignItems: "center", marginTop: 8 }}
        >
          <T weight="semibold" style={{ color: C.ink }}>
            Recarregar veículo →
          </T>
        </Pressable>
      )}
    </View>
  );
}
function SheetContent() {
  const app = useApp();
  const [value, setValue] = useState("");
  const [second, setSecond] = useState("");
  const [checked, setChecked] = useState(app.saved.notifications);
  switch (app.sheet) {
    case "alarm":
      return <AlarmSettings />;
    case "receipt":
      return <ReceiptSheet />;
    case "garage":
    case "vehicle-form":
      if (app.sheet === "vehicle-form") return <VehicleForm />;
      return <GarageContent />;
    case "vehicle-picker":
      return <GarageContent />;
    case "manual-code":
      return (
        <View style={sh.body}>
          <T style={sh.description}>Digite o código exibido no carregador.</T>
          <Field
            label="Código do carregador"
            value={value}
            onChange={setValue}
            placeholder="Ex.: ONZE001"
            maxLength={20}
          />
          <T style={sh.note}>
            Use um código de exemplo para explorar a recarga.
          </T>
          <GradientButton
            title="Continuar"
            style={sh.button}
            onPress={() => {
              if (value.trim().length < 3)
                return app.setToast(
                  "Digite um código com pelo menos 3 caracteres.",
                );
              app.setStation(0);
              app.go("configure");
            }}
          />
        </View>
      );
    case "account":
      return (
        <View style={sh.body}>
          <Field
            label="Nome completo"
            value={value || app.saved.profile.name}
            onChange={setValue}
          />
          <Field
            label="E-mail"
            value={second || app.saved.profile.email}
            onChange={setSecond}
            keyboard="email-address"
          />
          <GradientButton
            title="Salvar alterações"
            style={sh.button}
            onPress={() => {
              app.update({
                profile: {
                  name: value.trim() || app.saved.profile.name,
                  email: second.trim() || app.saved.profile.email,
                },
              });
              app.setSheet(null);
              app.setToast("Dados atualizados.");
            }}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => app.go("login")}
            style={{ padding: 16, alignItems: "center" }}
          >
            <T style={{ color: "#b3261e" }}>Sair da conta</T>
          </Pressable>
        </View>
      );
    case "payment":
      return (
        <View style={sh.body}>
          <View
            style={[
              s.row,
              {
                gap: 20,
                padding: 12,
                backgroundColor: C.light,
                borderRadius: 12,
              },
            ]}
          >
            <Art node="92:685" name="imgImage13" w={45} h={28} />
            <View>
              <T weight="semibold">.... {app.saved.card}</T>
              <T>Mastercard</T>
            </View>
          </View>
          <Field
            label="Últimos 4 dígitos do cartão de exemplo"
            value={value}
            onChange={setValue}
            keyboard="numeric"
            maxLength={4}
            placeholder="1234"
          />
          <T style={sh.note}>
            Esta prévia usa apenas cartões de exemplo. Nenhuma cobrança será
            feita.
          </T>
          <GradientButton
            title="Salvar forma de pagamento"
            style={sh.button}
            onPress={() => {
              if (!/^\d{4}$/.test(value))
                return app.setToast(
                  "Digite os 4 últimos dígitos do cartão de exemplo.",
                );
              app.update({ card: value });
              app.setSheet(null);
            }}
          />
        </View>
      );
    case "details":
      return (
        <View style={sh.body}>
          <T weight="semibold">
            {app.session?.station ?? "Taguatinga Shopping"}
          </T>
          <T style={sh.description}>
            Energia adicionada: {decimal(app.liveCharge.addedEnergy)} kWh{"\n"}
            Tempo decorrido: {app.liveCharge.elapsed} min{"\n"}
            Tempo restante: {app.liveCharge.remainingMinutes} min{"\n"}
            Meta de bateria: {app.liveCharge.target}%{"\n"}
            Valor estimado: {money(app.liveCharge.runningCost)}
          </T>
          <T style={sh.note}>
            Sessão de demonstração. Nenhum carregador real está conectado.
          </T>
          <GradientButton
            title="Concluir recarga de exemplo"
            style={sh.button}
            onPress={app.finish}
          />
        </View>
      );
    case "history":
      return (
        <View style={sh.body}>
          {app.saved.history.length ? (
            app.saved.history.map((c) => (
              <View
                key={c.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: C.light,
                  marginBottom: 12,
                }}
              >
                <T weight="semibold">{c.station}</T>
                <T style={sh.description}>
                  {new Date(c.date).toLocaleDateString("pt-BR")} ·{" "}
                  {decimal(c.energy)} kWh · {c.minutes} min
                </T>
                <T
                  weight="bold"
                  style={{ color: C.ink, fontSize: 20, lineHeight: 26 }}
                >
                  {money(c.cost)}
                </T>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ver extrato ${c.id}`}
                  onPress={() => app.openReceipt(c)}
                  style={{ paddingTop: 13 }}
                >
                  <T weight="semibold" style={{ color: C.ink, fontSize: 12 }}>
                    Ver extrato e baixar PDF →
                  </T>
                </Pressable>
              </View>
            ))
          ) : (
            <T style={sh.description}>
              Suas recargas concluídas aparecerão aqui.
            </T>
          )}
        </View>
      );
    case "google":
      return (
        <View style={sh.body}>
          <T style={sh.description}>
            Explore a prévia da ONZE mobi. O acesso com sua conta Google estará
            disponível quando o serviço de login for conectado.
          </T>
          <GradientButton
            title="Explorar prévia"
            style={sh.button}
            onPress={() => app.go("home")}
          />
        </View>
      );
    case "recovery-sent":
      return (
        <View style={sh.body}>
          <T style={sh.description}>
            Na versão conectada, você receberá um código para redefinir sua
            senha. Nesta prévia, nenhum e-mail ou SMS é enviado.
          </T>
          <GradientButton
            title="Voltar ao login"
            style={sh.button}
            onPress={() => app.go("login")}
          />
        </View>
      );
    case "plans":
      return (
        <View style={sh.body}>
          <T style={sh.description}>Você ainda não possui um plano ativo.</T>
          <GradientButton
            title="Simular uma recarga"
            style={sh.button}
            onPress={() => app.go("simulation")}
          />
        </View>
      );
    case "notifications":
      return (
        <View style={sh.body}>
          <T style={sh.description}>
            {app.saved.active
              ? "Sua recarga está em andamento. Acompanhe os detalhes da sessão."
              : "Você está em dia! Novas notificações aparecerão aqui."}
          </T>
          {app.saved.active && (
            <GradientButton
              title="Acompanhar recarga"
              style={sh.button}
              onPress={() => app.go("charging")}
            />
          )}
        </View>
      );
    case "settings":
      return (
        <View style={sh.body}>
          <View style={s.between}>
            <T>Notificações no app</T>
            <Switch
              accessibilityLabel="Notificações no app"
              value={checked}
              onValueChange={setChecked}
              trackColor={{ true: C.cyan }}
            />
          </View>
          <T style={sh.description}>Idioma: Português (Brasil)</T>
          <T style={sh.description}>Tema: ONZE mobi</T>
          <GradientButton
            title="Salvar preferências"
            style={sh.button}
            onPress={() => {
              app.setSheet(null);
              app.update({ notifications: checked });
              app.setToast("Preferências salvas.");
            }}
          />
        </View>
      );
    case "help":
      return (
        <View style={sh.body}>
          <T weight="semibold">Como iniciar uma recarga?</T>
          <T style={sh.description}>
            Selecione um carregador no mapa ou digite seu código. Escolha o
            veículo, ajuste a carga e confira o resumo antes de iniciar.
          </T>
          <T weight="semibold" style={{ marginTop: 14 }}>
            Como cadastrar um veículo?
          </T>
          <T style={sh.description}>
            Acesse Minha Garagem e toque em Adicionar veículo.
          </T>
          <Pressable
            accessibilityRole="button"
            onPress={() => app.setSheet("terms")}
            style={{ paddingVertical: 15 }}
          >
            <T style={{ color: C.ink, textDecorationLine: "underline" }}>
              Termos de uso e privacidade
            </T>
          </Pressable>
        </View>
      );
    case "terms":
      return (
        <View style={sh.body}>
          <T style={sh.description}>
            Esta é uma prévia interativa da ONZE mobi. Os dados são armazenados
            apenas neste dispositivo. Não há autenticação real, envio de
            mensagens ou cobrança. Não informe senhas ou dados de cartão reais.
          </T>
        </View>
      );
    default:
      return null;
  }
}
const titles: Partial<Record<NonNullable<Sheet>, string>> = {
  garage: "Minha Garagem",
  "vehicle-picker": "Escolha seu veículo",
  alarm: "Alerta de bateria",
  receipt: "Extrato da recarga",
  "manual-code": "Código do carregador",
  account: "Minha Conta",
  payment: "Formas de pagamento",
  plans: "Meus Planos",
  history: "Histórico",
  settings: "Configurações",
  help: "Ajuda e suporte",
  notifications: "Notificações",
  details: "Detalhes da recarga",
  google: "Continuar com Google",
  terms: "Termos de uso e privacidade",
  "recovery-sent": "Recuperar senha",
};
export function Sheets() {
  const app = useApp();
  return (
    <Modal
      visible={app.sheet !== null}
      transparent
      animationType="fade"
      onRequestClose={() => app.setSheet(null)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#00000066",
          padding: 9,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar janela"
          onPress={() => app.setSheet(null)}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={{
            backgroundColor: "white",
            width: "100%",
            maxWidth: 384,
            maxHeight: "90%",
            borderRadius: 8,
            overflow: "hidden",
          }}
          accessibilityViewIsModal
        >
          {app.sheet && titles[app.sheet] && (
            <View
              style={[s.between, { paddingHorizontal: 20, paddingTop: 18 }]}
            >
              <T
                weight="semibold"
                style={{ fontSize: 17, lineHeight: 22, flex: 1 }}
              >
                {titles[app.sheet]}
              </T>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                onPress={() => app.setSheet(null)}
                style={{ padding: 4 }}
              >
                <T style={{ fontSize: 25 }}>×</T>
              </Pressable>
            </View>
          )}
          <ScrollView keyboardShouldPersistTaps="handled">
            <SheetContent key={app.sheet} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const sh = StyleSheet.create({
  body: { padding: 20 },
  description: {
    fontSize: 14,
    lineHeight: 23,
    marginTop: 12,
    color: "#465366",
  },
  note: { fontSize: 12, lineHeight: 18, color: "#6b7280", marginTop: 12 },
  button: { marginTop: 24 },
  input: {
    height: 35,
    borderRadius: 9,
    backgroundColor: "white",
    boxShadow: "0px 3px 4px rgba(0,0,0,0.10)",
    paddingHorizontal: 12,
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#000",
    outlineWidth: 0,
  },
});
