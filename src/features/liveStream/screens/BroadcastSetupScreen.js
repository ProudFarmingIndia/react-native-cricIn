/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| BroadcastSetupScreen.js
|
| Description:
| What the person holding the camera sees. Their server URL, their stream
| key, and the four steps to get a picture on air.
|
| WHY THE APP DOES NOT BROADCAST ITSELF
| Encoding and pushing RTMP from inside a React Native app is 50-70 hours
| of work plus a custom dev build, and the result would be worse than what
| Larix already does for free: bitrate adaptation on a bad ground
| connection, background streaming when the screen locks, reconnects.
|
| So CricIn owns the part only CricIn can do - who is allowed to film,
| which match it belongs to, and the score overlay - and hands the actual
| encoding to a purpose-built app. Revisit after phase one if people find
| the two-app step confusing.
|
| SECURITY NOTE
| The key is fetched from its own endpoint, once, by request - never as a
| field on a list response. It is only issued to the assigned broadcaster
| AFTER they have accepted, and the server rotates it the moment the
| scorer hands the camera to somebody else.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";

import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import * as Clipboard from "expo-clipboard";

import { COLORS } from "../../../constants/colors";

import { getStreamKeyApi } from "../services/liveStream.service";

import useLiveStream from "../hooks/useLiveStream";

import { ANGLE_LABEL, ANGLE_HINT } from "../constants/streamConstants";

const LARIX_URL = Platform.select({
  ios: "https://apps.apple.com/app/larix-broadcaster/id1042474385",
  android:
    "https://play.google.com/store/apps/details?id=com.wmspanel.larix_broadcaster",
  default: "https://softvelum.com/larix/",
});

const Step = ({ number, title, children }) => (
  <View style={styles.step}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>

    <View style={styles.stepBody}>
      <Text style={styles.stepTitle}>{title}</Text>
      {children}
    </View>
  </View>
);

export default function BroadcastSetupScreen() {
  const route = useRoute();

  const navigation = useNavigation();

  const { matchId, angle } = route.params || {};

  const { angles, match, reload } = useLiveStream(matchId);

  const [credentials, setCredentials] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [revealed, setRevealed] = useState(false);

  const mine = angles.find((a) => a.angle === angle);

  const load = useCallback(async () => {
    if (!matchId || !angle) return;

    setLoading(true);

    try {
      const data = await getStreamKeyApi(matchId, angle);

      setCredentials(data);

      setError(null);
    } catch (err) {
      setCredentials(null);

      setError(
        err?.response?.data?.message ||
          "Stream key nahi mil paayi. Ho sakta hai scorer ne ye camera kisi aur ko de diya ho.",
      );
    } finally {
      setLoading(false);
    }
  }, [matchId, angle]);

  useFocusEffect(
    useCallback(() => {
      load();

      reload(true);
    }, [load, reload]),
  );

  const copy = async (value, label) => {
    await Clipboard.setStringAsync(String(value));

    Alert.alert("Copied", `${label} copy ho gaya.`);
  };

  /*
  | Server URL + "/" + stream key, joined here so a stray or missing
  | slash cannot happen. This is the single string Larix needs.
  */

  const larixUrl = credentials
    ? `${String(credentials.rtmpsUrl || "").replace(/\/+$/, "")}/${credentials.streamKey || ""}`
    : "";

  if (loading && !credentials) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="close-circle-outline"
          size={30}
          color={COLORS.error}
        />

        <Text style={styles.errorTitle}>Can't get the key</Text>

        <Text style={styles.errorBody}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* ── What you're filming ────────────────────────────────────── */}

      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View
            style={[styles.statusDot, mine?.live && styles.statusDotLive]}
          />

          <Text style={styles.statusText}>
            {mine?.live ? "YOU ARE LIVE" : "NOT LIVE YET"}
          </Text>
        </View>

        <Text style={styles.angleName}>
          {ANGLE_LABEL[angle] || angle} camera
        </Text>

        <Text style={styles.angleHint}>{ANGLE_HINT[angle] || ""}</Text>

        {!!match && (
          <Text style={styles.fixture} numberOfLines={2}>
            {(match.teamA?.teamName || "Team A") +
              "  vs  " +
              (match.teamB?.teamName || "Team B")}
          </Text>
        )}
      </View>

      {/* ── Steps ──────────────────────────────────────────────────── */}

      <View style={styles.stepsCard}>
        <Step number="1" title="Larix Broadcaster install karo">
          <Text style={styles.stepText}>
            Free app hai. CricIn khud encode nahi karta — Larix kharab
            network par bitrate adjust karta hai aur screen lock hone par
            bhi chalta rehta hai.
          </Text>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL(LARIX_URL)}
          >
            <Ionicons
              name="download-outline"
              size={15}
              color={COLORS.primary}
            />
            <Text style={styles.linkButtonText}>Get Larix Broadcaster</Text>
          </TouchableOpacity>
        </Step>

        <Step number="2" title="Larix → Settings → Connections → New">
          <Text style={styles.stepText}>
            Neeche "FOR LARIX" wali poori URL copy karke URL field mein
            paste karo — key usi ke andar hai. Naam kuch bhi rakh sakte
            ho, "CricIn" theek hai. Baaki sab default chhod do.
          </Text>
        </Step>

        <Step number="3" title="Phone landscape mein pakdo">
          <Text style={styles.stepText}>
            Tripod ya kisi cheez ka sahara le lo. 3 ghante haath se pakadna
            mushkil hai, aur hilti hui video dekhne layak nahi rehti.
          </Text>
        </Step>

        <Step number="4" title="Red button dabao">
          <Text style={styles.stepText}>
            10-15 second mein match sabko dikhne lagega. Yahi screen "YOU
            ARE LIVE" bata dega.
          </Text>
        </Step>
      </View>

      {/* ── Credentials ────────────────────────────────────────────── */}

      {/*
      |--------------------------------------------------------------------------
      | The One Field Larix Actually Wants
      |--------------------------------------------------------------------------
      |
      | Larix has NO separate stream-key field for RTMP. Its own hint on
      | the connection screen says so:
      |
      |     "RTMP URL schema is rtmp://server/application/streamkey"
      |
      | So the key goes on the END OF THE URL. Handing someone the server
      | URL and the key as two separate values - which is right for OBS -
      | means they paste only the server URL, Larix connects to /app with
      | no key, and Mux drops the connection with no useful error. The
      | phone shows "connected" for a second and then nothing appears.
      |
      | This card is therefore the primary one, and it is built here rather
      | than left to the person to join by hand: a missing or doubled "/"
      | fails exactly the same silent way.
      */}

      <View style={[styles.credCard, styles.credCardPrimary]}>
        <View style={styles.credBadge}>
          <Text style={styles.credBadgeText}>FOR LARIX — PASTE THIS ONE</Text>
        </View>

        <Text style={styles.credHelp}>
          Larix mein sirf ek URL field hai. Poora ye wala paste karo — key
          isi ke andar hai. Alag se key daalne ki zaroorat nahi.
        </Text>

        <View style={styles.credRow}>
          <Text style={styles.credValue} numberOfLines={1}>
            {revealed
              ? larixUrl
              : `${credentials?.rtmpsUrl || ""}/${"•".repeat(24)}`}
          </Text>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => setRevealed((v) => !v)}
          >
            <Ionicons
              name={revealed ? "eye-off-outline" : "eye-outline"}
              size={16}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copy(larixUrl, "Larix URL")}
          >
            <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/*
      | The split values, for OBS and anything else with two fields. Kept
      | second because the person on this screen is almost always on a
      | phone with Larix.
      */}

      <View style={styles.credCard}>
        <Text style={styles.credSectionTitle}>
          OBS / other encoders (two fields)
        </Text>

        <Text style={styles.credTitle}>SERVER URL</Text>

        <View style={styles.credRow}>
          <Text style={styles.credValue} numberOfLines={1}>
            {credentials?.rtmpsUrl}
          </Text>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copy(credentials?.rtmpsUrl, "Server URL")}
          >
            <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.credTitle, styles.credTitleSpaced]}>
          STREAM KEY
        </Text>

        {/*
        | Hidden until tapped. Not theatre - this screen gets opened at a
        | ground with people standing around, and the key is the one thing
        | that lets somebody else broadcast onto this match.
        */}

        <View style={styles.credRow}>
          <Text style={styles.credValue} numberOfLines={1}>
            {revealed
              ? credentials?.streamKey
              : "•".repeat(String(credentials?.streamKey || "").length || 24)}
          </Text>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => setRevealed((v) => !v)}
          >
            <Ionicons
              name={revealed ? "eye-off-outline" : "eye-outline"}
              size={16}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copy(credentials?.streamKey, "Stream key")}
          >
            <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.warnRow}>
          <Ionicons
            name="lock-closed-outline"
            size={13}
            color={COLORS.secondary}
          />

          <Text style={styles.warnText}>
            Ye key sirf tumhare liye hai. Kisi ko mat do — scorer camera
            kisi aur ko de dega toh ye apne aap band ho jayegi.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.watchButton}
        onPress={() => navigation.navigate("WatchLiveScreen", { matchId })}
        activeOpacity={0.85}
      >
        <Ionicons name="play-circle-outline" size={18} color={COLORS.primary} />

        <Text style={styles.watchButtonText}>
          Check how it looks to viewers
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 16,
    paddingBottom: 44,
    gap: 12,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 8,
    backgroundColor: COLORS.background,
  },

  errorTitle: {
    marginTop: 6,
    fontSize: 15.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  errorBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  retryButton: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },

  /* ── Header ───────────────────────────────────────────────────── */

  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.outline,
  },

  statusDotLive: {
    backgroundColor: COLORS.error,
  },

  statusText: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
  },

  angleName: {
    marginTop: 8,
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  angleHint: {
    marginTop: 3,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },

  fixture: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },

  /* ── Steps ────────────────────────────────────────────────────── */

  stepsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },

  step: {
    flexDirection: "row",
    gap: 12,
  },

  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  stepNumberText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },

  stepBody: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  stepText: {
    marginTop: 3,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.onSurfaceVariant,
  },

  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  linkButtonText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.primary,
  },

  /* ── Credentials ──────────────────────────────────────────────── */

  credCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  credCardPrimary: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },

  credBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
  },

  credBadgeText: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onPrimary,
  },

  credHelp: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
  },

  credSectionTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 14,
  },

  credTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
  },

  credTitleSpaced: {
    marginTop: 16,
  },

  credRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 7,
    padding: 11,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainer,
  },

  credValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  copyButton: {
    padding: 3,
  },

  warnRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 12,
  },

  warnText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.secondary,
    fontWeight: "600",
  },

  watchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  watchButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
});