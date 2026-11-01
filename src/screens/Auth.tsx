import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Art,
  TextLabel as T,
  GradientButton,
  Outline,
  StatusPreview,
  s,
} from "../components";
import { colors as C, fonts, gradient } from "../design/theme";
import { figmaAssets } from "../design/assets";
import { useApp } from "../state";

function AuthField({
  placeholder,
  value,
  onChange,
  icon,
  secure = false,
  keyboard = "default",
}: {
  placeholder: string;
  value: string;
  onChange: (s: string) => void;
  icon: "email" | "lock" | "person" | "phone";
  secure?: boolean;
  keyboard?: "default" | "email-address" | "phone-pad";
}) {
  const [show, setShow] = useState(false);
  return (
    <Outline
      style={{ height: 56 }}
      innerStyle={[s.row, { paddingHorizontal: 16 }]}
    >
      {icon === "email" ? (
        <Art node="216:141" name="imgImage22" w={35} />
      ) : icon === "lock" ? (
        <Art
          node="216:141"
          name="imgImage21"
          w={26}
          h={30}
          style={{ marginHorizontal: 5 }}
        />
      ) : (
        <Art
          node="216:182"
          name={icon === "person" ? "imgAvatarPlaceholder" : "imgIcon1"}
          w={icon === "person" ? 28.2 : 19.4}
          h={icon === "person" ? 25.6 : 19.4}
          style={{ marginHorizontal: icon === "person" ? 3.4 : 8 }}
        />
      )}
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor="#cfcfcf"
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure && !show}
        keyboardType={keyboard}
        autoCapitalize={icon === "person" ? "words" : "none"}
        autoComplete={
          icon === "email"
            ? "email"
            : icon === "lock"
              ? "current-password"
              : icon === "person"
                ? "name"
                : "tel"
        }
        style={a.input}
      />
      {secure && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={show ? "Ocultar senha" : "Mostrar senha"}
          onPress={() => setShow(!show)}
          hitSlop={10}
        >
          <Art node="216:141" name="imgIcon" w={20.33} h={15.33} />
        </Pressable>
      )}
    </Outline>
  );
}
export function AuthScreen() {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirm, setConfirm] = useState("");
  const [checked, setChecked] = useState(true);
  const signup = app.route === "signup",
    recovery = app.route === "recovery",
    splash = app.route === "splash";
  const enter = () => {
    if (!email.trim() || !password)
      return app.setToast("Preencha o e-mail ou telefone e a senha.");
    if (signup && (!name.trim() || !phone.trim()))
      return app.setToast("Preencha seu nome e telefone.");
    if (signup && password.length < 6)
      return app.setToast("Use uma senha com pelo menos 6 caracteres.");
    if (signup && password !== confirm)
      return app.setToast("As senhas precisam ser iguais.");
    if (signup && !checked)
      return app.setToast("Aceite os termos para criar sua conta.");
    app.update({
      profile: {
        name: name.trim() || app.saved.profile.name,
        email: email.trim(),
      },
    });
    app.go("home");
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: C.navy }}
    >
      <Image
        source={
          figmaAssets[
            splash
              ? "11:249"
              : signup
                ? "216:182"
                : recovery
                  ? "216:169"
                  : "216:141"
          ].imgImage5
        }
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={splash ? 0 : 6.4}
      />
      {!splash && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: "#00000040" }]}
        />
      )}
      <View style={{ height: Platform.OS === "web" ? 0 : insets.top }} />
      <StatusPreview />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          style={{
            minHeight: splash ? 797 : recovery ? 650 : 797,
            paddingHorizontal: 16,
          }}
        >
          <Art
            node={splash ? "11:249" : "216:141"}
            name="imgImage4"
            w={recovery ? 219 : 364}
            h={recovery ? 88 : 146}
            style={{
              alignSelf: "center",
              marginTop: recovery ? 9 : 20,
              maxWidth: "100%",
            }}
          />
          {splash ? (
            <>
              <T
                weight="semibold"
                style={{
                  color: "white",
                  fontSize: 18,
                  textAlign: "center",
                  marginTop: 14,
                  lineHeight: 23,
                }}
              >
                Carregando o seu futuro
              </T>
              <View style={{ flex: 1 }} />
              <T
                weight="medium"
                style={{
                  color: "white",
                  fontSize: 16,
                  lineHeight: 20,
                  textAlign: "center",
                }}
              >
                Mais mobilidade{"\n"}Um futuro mais limpo
              </T>
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: 222,
                  height: 6,
                  borderRadius: 4,
                  alignSelf: "center",
                  marginTop: 29,
                  marginBottom: 21,
                }}
              />
            </>
          ) : (
            <>
              <View
                style={{
                  marginTop: recovery ? 27 : signup ? -7 : 48,
                  alignItems: "center",
                }}
              >
                {(signup || recovery) && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    onPress={() => app.go("login")}
                    style={{
                      position: "absolute",
                      left: 32,
                      top: signup ? 12 : 0,
                    }}
                  >
                    <Art node="16:367" name="imgArrowLeft" w={22} />
                  </Pressable>
                )}
                <T
                  weight="semibold"
                  style={{ color: "white", fontSize: 20, lineHeight: 24 }}
                >
                  {recovery
                    ? "Recuperar senha"
                    : signup
                      ? "Criar conta"
                      : "Bem-vindo de volta!"}
                </T>
                <T
                  weight="medium"
                  style={{
                    color: "#cdcdcd",
                    fontSize: 14,
                    lineHeight: 22,
                    textAlign: "center",
                    width: 237,
                    marginTop: recovery ? 8 : signup ? 5 : 0,
                  }}
                >
                  {recovery
                    ? "Digite seu e-mail ou telefone para receber um código de recuperação"
                    : signup
                      ? "Comece sua jornada com a ONZE mobi"
                      : "Faça login para continuar"}
                </T>
              </View>
              <View
                style={{ marginTop: recovery ? 40 : signup ? 20 : 45, gap: 14 }}
              >
                {signup && (
                  <AuthField
                    placeholder="Nome completo"
                    icon="person"
                    value={name}
                    onChange={setName}
                  />
                )}
                <AuthField
                  placeholder={signup ? "E-mail" : "E-mail ou telefone"}
                  icon="email"
                  value={email}
                  onChange={setEmail}
                  keyboard="email-address"
                />
                {signup && (
                  <AuthField
                    placeholder="Telefone"
                    icon="phone"
                    value={phone}
                    onChange={setPhone}
                    keyboard="phone-pad"
                  />
                )}
                {!recovery && (
                  <AuthField
                    placeholder="Senha"
                    icon="lock"
                    value={password}
                    onChange={setPassword}
                    secure
                  />
                )}
                {signup && (
                  <AuthField
                    placeholder="Confirmar senha"
                    icon="lock"
                    value={confirm}
                    onChange={setConfirm}
                    secure
                  />
                )}
              </View>
              {!signup && !recovery && (
                <View style={[s.between, { marginTop: 11, paddingLeft: 14 }]}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel="Lembrar de mim"
                    onPress={() => setChecked(!checked)}
                    style={[s.row, { gap: 10 }]}
                  >
                    <View
                      style={{
                        width: 19,
                        height: 19,
                        borderWidth: 2,
                        borderColor: "#00ef9a",
                        borderRadius: 2,
                      }}
                    >
                      {checked && (
                        <T
                          weight="bold"
                          style={{
                            color: "#00ef9a",
                            fontSize: 22,
                            lineHeight: 18,
                            marginTop: -4,
                          }}
                        >
                          ✓
                        </T>
                      )}
                    </View>
                    <T style={{ color: "white", fontSize: 15 }}>
                      Lembrar de mim
                    </T>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => app.go("recovery")}
                  >
                    <T
                      style={{
                        color: C.blue,
                        textDecorationLine: "underline",
                        fontSize: 15,
                      }}
                    >
                      Esqueceu a senha ?
                    </T>
                  </Pressable>
                </View>
              )}
              {signup && (
                <View
                  style={[
                    s.row,
                    { marginTop: 28, paddingHorizontal: 14, gap: 10 },
                  ]}
                >
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel="Aceitar termos"
                    onPress={() => setChecked(!checked)}
                  >
                    <T style={{ color: "#00ef9a", fontSize: 25 }}>
                      {checked ? "☑" : "☐"}
                    </T>
                  </Pressable>
                  <T
                    style={{
                      color: "white",
                      fontSize: 14,
                      lineHeight: 18,
                      width: 230,
                    }}
                  >
                    Li e aceito os{" "}
                    <T
                      onPress={() => app.setSheet("terms")}
                      style={{ color: C.blue, textDecorationLine: "underline" }}
                    >
                      Termos de uso
                    </T>{" "}
                    e a{" "}
                    <T
                      onPress={() => app.setSheet("terms")}
                      style={{ color: C.blue, textDecorationLine: "underline" }}
                    >
                      Política de privacidade
                    </T>
                  </T>
                </View>
              )}
              <GradientButton
                round={29}
                title={
                  recovery ? "Enviar código" : signup ? "Criar conta" : "Entrar"
                }
                textStyle={{ color: "#000", fontSize: 18 }}
                style={{ marginTop: recovery ? 47 : signup ? 25 : 69 }}
                onPress={
                  recovery
                    ? () =>
                        email.trim()
                          ? app.setSheet("recovery-sent")
                          : app.setToast("Digite seu e-mail ou telefone.")
                    : enter
                }
              />
              {!signup && !recovery && (
                <>
                  <View
                    style={[
                      s.row,
                      { gap: 12, marginTop: 18, marginHorizontal: 4 },
                    ]}
                  >
                    <LinearGradient colors={gradient} style={a.divider} />
                    <T style={{ color: "white", fontSize: 13 }}>ou</T>
                    <LinearGradient colors={gradient} style={a.divider} />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Continuar com Google"
                    onPress={() => app.setSheet("google")}
                    style={{ marginTop: 19 }}
                  >
                    <Outline
                      style={{ height: 51 }}
                      innerStyle={[
                        s.row,
                        { justifyContent: "center", gap: 12 },
                      ]}
                    >
                      <Art node="216:141" name="imgImage20" w={33} />
                      <T
                        style={{ color: "white", fontSize: 18, lineHeight: 22 }}
                      >
                        Continuar com Google
                      </T>
                    </Outline>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Criar conta"
                    onPress={() => app.go("signup")}
                    style={{ alignSelf: "center", marginTop: 14 }}
                  >
                    <T
                      weight="medium"
                      style={{ color: "white", fontSize: 16, lineHeight: 22 }}
                    >
                      Não tem uma conta ?{" "}
                      <T
                        style={{
                          color: C.blue,
                          fontSize: 16,
                          textDecorationLine: "underline",
                        }}
                      >
                        Criar conta
                      </T>
                    </T>
                  </Pressable>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
      <View
        style={{
          height: Platform.OS === "web" ? 34 : Math.max(insets.bottom, 12),
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 8,
        }}
      >
        {Platform.OS === "web" && (
          <View
            style={{
              width: 144,
              height: 5,
              borderRadius: 4,
              backgroundColor: "white",
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
const a = StyleSheet.create({
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: 11,
    fontFamily: fonts.regular,
    fontSize: 18,
    color: "white",
    outlineWidth: 0,
  },
  divider: { flex: 1, height: 1, opacity: 0.5 },
});
