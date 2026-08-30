import React from "react";

import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Highlight Card
|--------------------------------------------------------------------------
|
| One moment. The server sends the type and the raw numbers; the phrasing
| happens here, because the client is the thing that knows how much room it
| has and what reads naturally.
|
| Every type gets its own icon and accent so the feed is scannable without
| reading - a century and a six should not look alike at a glance.
|
*/

const PRESETS = {
  HAT_TRICK: {
    icon: "flame",
    accent: "#BA1A1A",
    tint: "#FFDAD6",
    label: "Hat-trick",
  },

  DOUBLE_HUNDRED: {
    icon: "trophy",
    accent: "#8f4e00",
    tint: "#FFEDD5",
    label: "Double century",
  },

  HUNDRED: {
    icon: "trophy",
    accent: "#8f4e00",
    tint: "#FFEDD5",
    label: "Century",
  },

  FIVE_WICKET: {
    icon: "medal",
    accent: "#BA1A1A",
    tint: "#FFDAD6",
    label: "Five-wicket haul",
  },

  FOUR_WICKET: {
    icon: "medal",
    accent: "#8f4e00",
    tint: "#FFEDD5",
    label: "Four wickets",
  },

  FIFTY: {
    icon: "star",
    accent: "#0d631b",
    tint: "#DCFCE7",
    label: "Half-century",
  },

  MATCH_RESULT: {
    icon: "flag",
    accent: "#0d631b",
    tint: "#DCFCE7",
    label: "Result",
  },

  WICKET: {
    icon: "close-circle",
    accent: "#BA1A1A",
    tint: "#FFDAD6",
    label: "Wicket",
  },

  SIX: {
    icon: "arrow-up-circle",
    accent: "#0d631b",
    tint: "#DCFCE7",
    label: "Six",
  },
};

const FALLBACK = {
  icon: "ellipse",
  accent: COLORS.onSurfaceVariant,
  tint: COLORS.surfaceContainer,
  label: "Moment",
};

/*
| The headline number for each type. Built here rather than server-side so
| the same payload can be phrased differently in a compact row later
| without a backend change.
*/

const describe = (item) => {
  const s = item?.stats || {};

  const name = item?.player?.playerName || "";

  switch (item?.type) {
    case "DOUBLE_HUNDRED":
    case "HUNDRED":
    case "FIFTY": {
      const balls = s.balls ? ` (${s.balls}b)` : "";

      const boundaries = [
        s.fours ? `${s.fours}x4` : null,
        s.sixes ? `${s.sixes}x6` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        headline: `${name} — ${s.runs}${balls}`,
        detail: boundaries,
      };
    }

    case "FIVE_WICKET":
    case "FOUR_WICKET": {
      const overs = s.balls ? `${Math.floor(s.balls / 6)}.${s.balls % 6} ov` : "";

      return {
        headline: `${name} — ${s.wickets}/${s.runsConceded ?? 0}`,
        detail: overs,
      };
    }

    case "HAT_TRICK":
      return {
        headline: `${name} — three in three`,
        detail: "",
      };

    case "WICKET":
      return {
        headline: `${name || "Wicket"}${s.wicketType ? ` — ${s.wicketType}` : ""}`,
        detail:
          s.over != null ? `Over ${s.over}.${s.ballNumber ?? 0}` : "",
      };

    case "SIX":
      return {
        headline: `${name} hit a six`,
        detail: s.over != null ? `Over ${s.over}.${s.ballNumber ?? 0}` : "",
      };

    case "MATCH_RESULT":
      return {
        headline: s.result || "Match completed",
        detail: "",
      };

    default:
      return { headline: name, detail: "" };
  }
};

export default function HighlightCard({ item, onPress, showMatch = true }) {
  const preset = PRESETS[item?.type] || FALLBACK;

  const { headline, detail } = describe(item);

  const fixture = item?.match
    ? `${item.match.teamA?.teamName || "Team A"} vs ${
        item.match.teamB?.teamName || "Team B"
      }`
    : "";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.75 : 1}
      onPress={() => onPress?.(item)}
      disabled={!onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: preset.tint }]}>
        <Ionicons name={preset.icon} size={20} color={preset.accent} />
      </View>

      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: preset.accent }]}>
            {preset.label}
          </Text>

          {/*
          | Rank is only meaningful in the ranked global feed. A match feed
          | is the story of one game, where "#3" would imply an ordering
          | that isn't chronological and isn't useful.
          */}
          {showMatch && !!item?.rank && (
            <Text style={styles.rank}>#{item.rank}</Text>
          )}
        </View>

        <Text style={styles.headline} numberOfLines={2}>
          {headline}
        </Text>

        {!!detail && <Text style={styles.detail}>{detail}</Text>}

        {showMatch && !!fixture && (
          <Text style={styles.fixture} numberOfLines={1}>
            {fixture}
          </Text>
        )}

        {!!item?.commentary && (
          <Text style={styles.commentary} numberOfLines={2}>
            {item.commentary}
          </Text>
        )}
      </View>

      {!!item?.player?.profileImage?.url && (
        <Image
          source={{ uri: item.player.profileImage.url }}
          style={styles.avatar}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  rank: {
    fontSize: 10.5,
    fontWeight: "800",
    color: COLORS.outline,
  },

  headline: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  detail: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  fixture: {
    marginTop: 5,
    fontSize: 11.5,
    color: COLORS.outline,
  },

  commentary: {
    marginTop: 5,
    fontSize: 12,
    fontStyle: "italic",
    color: COLORS.onSurfaceVariant,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginLeft: 10,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
});
