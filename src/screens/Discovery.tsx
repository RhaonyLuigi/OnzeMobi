import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Page, Art, TextLabel as T, s } from "../components";
import { colors as C } from "../design/theme";
import { useApp } from "../state";

export function ConnectorChoice({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={[s.row, { gap: 16 }]}>
      {["Tipo 2", "CCS 2"].map((v) => (
        <Pressable
          key={v}
          accessibilityRole="radio"
          accessibilityLabel={v}
          accessibilityState={{ checked: value === v }}
          aria-checked={value === v}
          onPress={() => onChange(v)}
          style={{
            height: 35,
            paddingHorizontal: 11,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: value === v ? "#00ff11" : "#bfbfbf",
            backgroundColor: "white",
            justifyContent: "center",
            boxShadow: "2px 3px 4px rgba(0,0,0,0.15)",
          }}
        >
          <T
            weight="medium"
            style={{ color: "#000", fontSize: 13, letterSpacing: 0.26 }}
          >
            {v}
          </T>
        </Pressable>
      ))}
    </View>
  );
}
export { MapScreen } from "./Map";
export function QRScreen() {
  const app = useApp();
  const [torch, setTorch] = useState(false);
  return (
    <Page dark style={{ minHeight: 797, paddingHorizontal: 20 }}>
      <View style={{ alignItems: "center", paddingTop: 36 }}>
        <T
          weight="black"
          style={{ color: "white", fontSize: 20, lineHeight: 24 }}
        >
          Escanear QR Code
        </T>
        <T
          style={{ color: C.muted, fontSize: 13, lineHeight: 16, marginTop: 7 }}
        >
          Aponte a câmera para o QR do carregador
        </T>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={app.back}
          style={{
            position: "absolute",
            top: 40,
            left: -4,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#ffffff21",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Art node="16:367" name="imgArrowLeft" w={20} />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir leitor demonstrativo de QR Code"
        onPress={() => app.setSheet("manual-code")}
        style={{ width: 281, height: 281, alignSelf: "center", marginTop: 45 }}
      >
        <View
          style={{
            position: "absolute",
            inset: 8,
            backgroundColor: torch ? "#ffffff12" : "#ffffff08",
            borderRadius: 4,
          }}
        />
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              borderColor: "#00c47a",
              borderTopWidth: i < 2 ? 4 : 0,
              borderBottomWidth: i >= 2 ? 4 : 0,
              borderLeftWidth: i % 2 === 0 ? 4 : 0,
              borderRightWidth: i % 2 === 1 ? 4 : 0,
              left: i % 2 === 0 ? 0 : undefined,
              right: i % 2 === 1 ? 0 : undefined,
              top: i < 2 ? 0 : undefined,
              bottom: i >= 2 ? 0 : undefined,
              borderRadius: 2,
            }}
          />
        ))}
        <View
          style={{
            position: "absolute",
            height: 2,
            backgroundColor: "#00c47ab3",
            top: 136,
            left: 8,
            right: 8,
          }}
        />
      </Pressable>
      <View style={[s.row, { gap: 12, marginTop: 37 }]}>
        {[
          {
            title: "QR do App",
            icon: "imgSmartphone",
            text: "Aponte para o QR Code do painel do carregador para iniciar a sessão diretamente no app.",
          },
          {
            title: "QR WhatsApp",
            icon: "imgMessageCircle",
            text: "Outro QR disponível no carregador inicia a sessão via WhatsApp, sem precisar do app.",
          },
        ].map((v) => (
          <View
            key={v.title}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 16,
              backgroundColor: "#ffffff0f",
              height: 140,
            }}
          >
            <View style={[s.row, { gap: 8 }]}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#00c47a21",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                }}
              >
                <Art node="16:367" name={v.icon} w={16} />
              </View>
              <T weight="bold" style={{ color: "white", fontSize: 13 }}>
                {v.title}
              </T>
            </View>
            <T
              style={{
                color: C.muted,
                fontSize: 12,
                lineHeight: 18,
                marginTop: 8,
              }}
            >
              {v.text}
            </T>
          </View>
        ))}
      </View>
      <View style={[s.row, { gap: 12, marginTop: 17 }]}>
        <View style={{ height: 1, backgroundColor: "#ffffff21", flex: 1 }} />
        <T style={{ color: "#6b7280", fontSize: 13, lineHeight: 16 }}>ou</T>
        <View style={{ height: 1, backgroundColor: "#ffffff21", flex: 1 }} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Digitar código do carregador"
        onPress={() => app.setSheet("manual-code")}
        style={[
          s.row,
          {
            height: 52,
            borderWidth: 1,
            borderColor: "#ffffff21",
            backgroundColor: "#ffffff0f",
            borderRadius: 14,
            paddingHorizontal: 16,
            marginTop: 17,
            gap: 12,
          },
        ]}
      >
        <Art node="16:367" name="imgHash" w={18} />
        <T style={{ color: "#6b7280", flex: 1 }}>
          Digitar código do carregador
        </T>
        <Art node="16:367" name="imgChevronRight" w={16} />
      </Pressable>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel="Lanterna demonstrativa"
        accessibilityState={{ checked: torch }}
        onPress={() => setTorch(!torch)}
        style={{
          width: 55,
          height: 55,
          backgroundColor: torch ? "#00c47a55" : "#ffffff21",
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
          marginTop: 17,
        }}
      >
        <Art node="16:367" name="imgFlashlight" w={24} />
      </Pressable>
    </Page>
  );
}
