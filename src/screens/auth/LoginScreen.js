import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { COLORS } from "../../constants/colors";
import { TYPOGRAPHY } from "../../constants/typography";
import { SPACING } from "../../constants/spacing";

import PrimaryButton from "../../components/Button/PrimaryButton";
import TextInput from "../../components/Input/TextInput";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 10);
    setPhone(cleaned);
  };

  const sendOTP = () => {
    if (phone.length < 10) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);

      navigation.navigate("OtpScreen", {
        phone: phone,
      });
    }, 1500);
  };

  return (
    <ImageBackground
      source={{
        uri: "https://your-cricket-background-image.jpg",
      }}
      style={styles.container}
    >
      {/* Overlay */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏟 CricIn</Text>

          <Text style={styles.tagline}>Every Cricketer’s Identity</Text>

          <Text style={styles.subTagline}>Har Cricketer Ki Pehchaan</Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>MOBILE NUMBER</Text>

          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.codeText}>+91</Text>
            </View>

            <View style={{ flex: 1 }}>
              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="numeric"
                placeholder="00000 00000"
              />
            </View>
          </View>

          {/* BUTTON */}
          <PrimaryButton
            title={loading ? "Sending OTP..." : sent ? "OTP Sent" : "Get OTP"}
            onPress={sendOTP}
          />

          {/* LOADING DOTS */}
          <View style={styles.statusRow}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>SYSTEMS LIVE</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.linksRow}>
            <Text style={styles.link}>Privacy</Text>
            <Text style={styles.dotSep}>•</Text>
            <Text style={styles.link}>Terms</Text>
            <Text style={styles.dotSep}>•</Text>
            <Text style={styles.link}>Help</Text>
          </View>

          <Text style={styles.copy}>© 2024 CRICIN.APP</Text>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  inner: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
  },

  tagline: {
    fontSize: 16,
    color: "#aef49a",
    marginTop: 8,
    fontWeight: "600",
  },

  subTagline: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.8,
    marginTop: 4,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 20,
  },

  label: {
    fontSize: 12,
    letterSpacing: 2,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: "600",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  countryCode: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    marginRight: 10,
  },

  codeText: {
    fontWeight: "700",
    color: COLORS.primary,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },

  statusText: {
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.primary,
    fontWeight: "600",
  },

  footer: {
    marginTop: 30,
    alignItems: "center",
  },

  linksRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  link: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.7,
  },

  dotSep: {
    marginHorizontal: 6,
    color: "#fff",
    opacity: 0.4,
  },

  copy: {
    marginTop: 10,
    fontSize: 10,
    letterSpacing: 2,
    color: "#fff",
    opacity: 0.5,
  },
});
