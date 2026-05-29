import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Animated,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { TYPOGRAPHY } from "../../constants/typography";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      console.log("Navigate to Home");
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={{
        uri: "https://your-cricket-ground-image.jpg",
      }}
      style={styles.container}
    >
      <View style={styles.overlay} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.icon}>🏏</Text>

        <Text style={styles.title}>CricIn</Text>

        <Text style={styles.tagline}>Every Cricketer’s Identity</Text>

        <Text style={styles.subTagline}>Har Cricketer Ki Pehchaan</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>cricin.app</Text>

        <View style={styles.loaderRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, { opacity: 0.6 }]} />
          <View style={[styles.dot, { opacity: 0.3 }]} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },

  content: {
    alignItems: "center",
  },

  icon: {
    fontSize: 60,
    marginBottom: 20,
  },

  title: {
    fontSize: TYPOGRAPHY.display.fontSize,
    fontWeight: "800",
    color: "#fff",
  },

  tagline: {
    fontSize: 18,
    color: "#aef49a",
    marginTop: 10,
  },

  subTagline: {
    fontSize: 14,
    color: "#fff",
    fontStyle: "italic",
    marginTop: 5,
    opacity: 0.8,
  },

  footer: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },

  footerText: {
    color: "#fff",
    opacity: 0.6,
    letterSpacing: 3,
  },

  loaderRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    opacity: 0.2,
  },
});