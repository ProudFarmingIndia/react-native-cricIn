import React, { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuth from "../hooks/useAuth";
import { verifyOtp, sendOtp } from "../store/authSlice";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../../../constants/colors";
import { SPACING } from "../../../constants/spacing";
import { TYPOGRAPHY } from "../../../constants/typography";

import PrimaryButton from "../../../components/Button/PrimaryButton";

export default function OtpScreen({ navigation, route }) {
  const { verifyOTP, sendOTP, loading } = useAuth();
  const { phone = "00000 00000" } = route.params || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef([]);

  // TIMER
  useEffect(() => {
    if (seconds === 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  // OTP CHANGE
  const handleChange = (text, index) => {
    if (isNaN(text)) return;

    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  // BACKSPACE HANDLER
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");

    const result = await verifyOTP(phone, enteredOtp);

    console.log("VERIFY RESULT =>", JSON.stringify(result, null, 2));

    if (verifyOtp.fulfilled.match(result)) {
      console.log("LOGIN SUCCESS");

      const token = await AsyncStorage.getItem("accessToken");

      console.log("TOKEN SAVED =>", token);
    }
  };

  // RESEND OTP
  const resendOtp = async () => {
    const result = await sendOTP(phone);

    if (sendOtp.fulfilled.match(result)) {
      setSeconds(30);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>🏏</Text>
        </View>

        <Text style={styles.title}>Verify OTP</Text>

        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{" "}
          <Text style={{ fontWeight: "700" }}>+91 {phone}</Text>
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.replace("Login", {
              phone: phone, // optional prefill
            })
          }
        >
          <Text style={styles.edit}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* OTP INPUTS */}
      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            returnKeyType="done"
            blurOnSubmit={true}
            style={styles.otpBox}
          />
        ))}
      </View>

      {/* VERIFY BUTTON */}
      <PrimaryButton
        title={loading ? "Verifying..." : "Verify & Login"}
        onPress={handleVerifyOtp}
      />

      {/* RESEND */}
      <View style={styles.resendContainer}>
        {seconds > 0 ? (
          <Text style={styles.timerText}>Resend available in {seconds}s</Text>
        ) : (
          <TouchableOpacity onPress={resendOtp}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  logo: {
    fontSize: 28,
    color: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 10,
  },

  edit: {
    marginTop: 8,
    color: COLORS.primary,
    fontWeight: "600",
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  timerText: {
    color: COLORS.textSecondary,
  },

  resendText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
