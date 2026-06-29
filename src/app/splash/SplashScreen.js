import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Animated,
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../constants/colors";
import { TYPOGRAPHY } from "../../constants/typography";

export default function SplashScreen({ navigation }) {
  const auth = useSelector((state) => state.auth);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const slideAnim = useRef(new Animated.Value(40)).current;

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),

      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),

      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 3500,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (auth?.token) {
        navigation.replace("Home");
      } else {
        navigation.replace("Login");
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const widthInterpolation = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <ImageBackground
      source={{
        uri: "https://your-cricket-ground-image.jpg",
      }}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.overlay} />

      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim,
              },
            ],
          },
        ]}
      >
        <Text style={styles.logoIcon}>🏏</Text>

        <Text style={styles.logo}>CricIn</Text>

        <Text style={styles.tagline}>Every Cricketer's Identity</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.quoteContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.badge}>CHASING GLORY</Text>

        <Text style={styles.quote}>
          "The pitch is my canvas, and the bat is my brush."
        </Text>
      </Animated.View>

      <View style={styles.bottomSection}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: widthInterpolation,
              },
            ]}
          />
        </View>

        <Text style={styles.loadingText}>Preparing the field...</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoIcon: {
    fontSize: 65,
    marginBottom: 15,
  },

  logo: {
    fontSize: 52,
    fontWeight: "800",
    color: "#A3F69C",
    letterSpacing: 1,
  },

  tagline: {
    color: "#fff",
    marginTop: 10,
    fontSize: 18,
    fontWeight: "500",
  },

  quoteContainer: {
    position: "absolute",
    bottom: 160,
    alignSelf: "center",
    alignItems: "center",
  },

  badge: {
    backgroundColor: "rgba(163,246,156,0.15)",
    color: "#A3F69C",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 30,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },

  quote: {
    marginTop: 15,
    color: "#fff",
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: 40,
    opacity: 0.85,
  },

  bottomSection: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },

  progressTrack: {
    width: 250,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#A3F69C",
  },

  loadingText: {
    marginTop: 15,
    color: "#fff",
    opacity: 0.7,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
