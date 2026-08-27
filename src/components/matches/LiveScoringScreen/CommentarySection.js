import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Helper to map angles to standard cricket fielding positions
const getDirectionName = (angle) => {
  if (angle == null) return null;
  const a = (angle + 360) % 360;
  if (a >= 337.5 || a < 22.5) return "Fine Leg";
  if (a >= 22.5 && a < 67.5) return "Square Leg / Mid-Wicket";
  if (a >= 67.5 && a < 112.5) return "Long-On / Mid-On";
  if (a >= 112.5 && a < 157.5) return "Straight / Long-Off";
  if (a >= 157.5 && a < 202.5) return "Extra Cover / Cover";
  if (a >= 202.5 && a < 247.5) return "Point / Deep Point";
  if (a >= 247.5 && a < 292.5) return "Third Man";
  if (a >= 292.5 && a < 337.5) return "Short Fine Leg";
  return null;
};

// Returns Cricbuzz style badge styling based on ball outcome
const getBadgeStyle = (item) => {
  if (item.isWicket || item.wicketDetail) {
    return { bg: "#D32F2F", text: "#FFF", label: "W" };
  }
  if (item.extraType === "wide" || item.isWide) {
    return { bg: "#E65100", text: "#FFF", label: `${item.runs || 1}WD` };
  }
  if (item.extraType === "noBall" || item.isNoBall) {
    return { bg: "#EF6C00", text: "#FFF", label: `${item.runs || 1}NB` };
  }
  if (item.runs === 6) {
    return { bg: "#1B5E20", text: "#FFF", label: "6" };
  }
  if (item.runs === 4) {
    return { bg: "#2E7D32", text: "#FFF", label: "4" };
  }
  if (item.runs === 0) {
    return { bg: "#ECEFF1", text: "#455A64", label: "0" };
  }
  return { bg: "#E0E0E0", text: "#212121", label: `${item.runs}` };
};

export default function CommentarySection({ commentary = [] }) {
  if (!commentary || commentary.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Commentary</Text>
        <Text style={styles.emptyText}>No commentary available yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Commentary</Text>

      {commentary.map((item, index) => {
        const overStr = item.over ?? (item.overNumber != null && item.ballNumber != null ? `${item.overNumber}.${item.ballNumber}` : "");
        const badge = getBadgeStyle(item);
        const direction = getDirectionName(item.angle ?? item.shotAngle);

        // Build Cricbuzz style delivery text
        const bowlerName = item.bowlerName || item.bowler?.name || item.bowler || "Bowler";
        const batsmanName = item.batsmanName || item.striker?.name || item.batsman || "Batsman";

        let commentaryText = item.text;

        if (!commentaryText) {
          if (item.isWicket || item.wicketDetail) {
            const dismissal = item.wicketDetail?.type || item.dismissalType || "Wicket";
            const fielder = item.wicketDetail?.fielderName ? ` caught by ${item.wicketDetail.fielderName}` : "";
            commentaryText = `OUT! ${dismissal}${fielder}. ${batsmanName} departs.`;
          } else if (item.runs === 6) {
            commentaryText = `SIX! ${batsmanName} lofts it over ${direction || "the boundary"} for a huge maximum!`;
          } else if (item.runs === 4) {
            commentaryText = `FOUR! Beautifully struck by ${batsmanName} through ${direction || "the field"} for four runs.`;
          } else if (item.runs === 0) {
            commentaryText = `No run. Good delivery to ${batsmanName}, defended safely.`;
          } else {
            commentaryText = `${item.runs} run${item.runs > 1 ? "s" : ""}. Worked away towards ${direction || "the outfield"}.`;
          }
        }

        return (
          <View key={item._id || index} style={styles.card}>
            {/* Left Column: Over Number & Outcome Badge */}
            <View style={styles.leftCol}>
              <Text style={styles.overText}>{overStr}</Text>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>
                  {badge.label}
                </Text>
              </View>
            </View>

            {/* Right Column: Bowler vs Batsman & Detail */}
            <View style={styles.rightCol}>
              <Text style={styles.matchupText}>
                <Text style={styles.boldText}>{bowlerName}</Text> to{" "}
                <Text style={styles.boldText}>{batsmanName}</Text>
              </Text>

              <Text style={styles.commentaryDetail}>{commentaryText}</Text>

              {direction && item.runs > 0 && (
                <Text style={styles.directionTag}>
                  Shot direction: {direction} ({item.angle ?? item.shotAngle}°)
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  leftCol: {
    alignItems: "center",
    marginRight: 12,
    minWidth: 44,
  },
  overText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#00490E",
    marginBottom: 4,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  rightCol: {
    flex: 1,
  },
  matchupText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  boldText: {
    fontWeight: "700",
    color: "#111827",
  },
  commentaryDetail: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  directionTag: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    marginTop: 4,
  },
});