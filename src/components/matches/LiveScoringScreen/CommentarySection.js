import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { regionName } from "../../../features/matches/utils/commentary";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Commentary
|--------------------------------------------------------------------------
|
| Rewritten around the server's commentary line rather than around a
| sentence built here.
|
| WHAT WAS WRONG
| The screen showed "Bowler to Batsman" above "1 run at 3.3", with an
| "undefined" badge. Three separate causes:
|
|   1. The server's commentary never contained any names - it was built
|      from runs and the over number alone.
|   2. This component printed a literal "Bowler to Batsman" line because
|      the ball objects it received carried no names to use.
|   3. LiveScoringScreen mapped every ball down to { over, text } before
|      passing it here, so runs and isWicket were gone - hence a badge
|      rendering "undefined".
|
| All three are fixed. The server now writes "Virat Kumar to Manoj Saxena,
| FOUR, cover drive through Cover" using the real names and the shot and
| direction the scorer entered, the full ball object is passed through, and
| this component just renders it.
|
| The badge is still derived here, because it is presentation: the same
| ball is "4" in a list and a blue disc on a timeline.
|
*/

const getBadge = (item) => {
  if (item.isWicket) {
    return { bg: COLORS.error, text: "#fff", label: "W" };
  }

  if (item.extraType === "wide") {
    return { bg: "#E65100", text: "#fff", label: `${item.runs || 0}wd` };
  }

  if (item.extraType === "noBall") {
    return { bg: "#EF6C00", text: "#fff", label: `${item.runs || 0}nb` };
  }

  if (item.extraType === "bye" || item.extraType === "legBye") {
    return {
      bg: COLORS.surfaceContainerHigh,
      text: COLORS.onSurface,
      label: `${item.runs || 0}${item.extraType === "bye" ? "b" : "lb"}`,
    };
  }

  if (item.runs === 6) {
    return { bg: "#6A1B9A", text: "#fff", label: "6" };
  }

  if (item.runs === 4) {
    return { bg: "#1565C0", text: "#fff", label: "4" };
  }

  /*
  | A dot is a dot, not "0" - and a ball with no runs recorded at all is
  | also a dot rather than the word "undefined", which is what used to
  | reach the screen.
  */
  if (!item.runs) {
    return { bg: COLORS.surfaceContainer, text: COLORS.onSurfaceVariant, label: "•" };
  }

  return {
    bg: COLORS.surfaceContainer,
    text: COLORS.onSurface,
    label: String(item.runs),
  };
};

/*
| The commentary lines use **double asterisks** around names and outcomes.
| React Native's Text has no markdown, so rendering the raw string printed
| the asterisks on screen - "**FOUR!** **Manoj Saxena**".
|
| Splitting on the markers and nesting a bold Text for the odd segments is
| all it takes, and it gives the names the emphasis they were written to
| have.
*/

const RichLine = ({ text, style, boldStyle }) => {
  const parts = String(text || "").split("**");

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Text key={index} style={boldStyle}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
};

export default function CommentarySection({ commentary }) {
  if (!commentary || commentary.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Commentary</Text>

        <Text style={styles.emptyText}>
          Commentary appears here as each ball is scored.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Commentary</Text>

      {commentary.map((item, index) => {
        const badge = getBadge(item);

        const over =
          item.over ??
          (item.overNumber != null && item.ballNumber != null
            ? `${item.overNumber}.${item.ballNumber}`
            : "");

        /*
        | `text` is the line the screen BUILT (with names, shot and
        | direction); `commentaryText` is what the server stored, which for
        | older balls is the name-less "1 run at 3.3" format.
        |
        | The built line therefore wins. Reading them the other way round is
        | the same mistake that made this component show "1 run at 3.3" in
        | the first place.
        */
        const line = item.text || item.commentaryText || "";

        /*
        | Shot and direction are also shown as their own small chips under
        | the sentence, not only inside it.
        |
        | They are the two fields the wagon wheel and shot statistics will
        | be built from - "where does this batter score most" - so they are
        | worth surfacing as data the eye can scan down a column, rather
        | than only as words buried mid-sentence.
        |
        | The region falls back to the stored angle, so a ball recorded
        | before the region name was saved still shows its direction.
        */

        const region =
          item.wagonWheel?.region || regionName(item.wagonWheel?.angle);

        const shot = item.shotType;

        const showTags = (!!shot || !!region) && !item.extraType;

        return (
          <View key={item._id || index} style={styles.row}>
            <View style={styles.leftCol}>
              <Text style={styles.overText}>{over}</Text>

              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>
                  {badge.label}
                </Text>
              </View>
            </View>

            <View style={styles.rightCol}>
              <RichLine
                text={line}
                style={styles.line}
                boldStyle={styles.lineBold}
              />

              {showTags && (
                <View style={styles.tagRow}>
                  {!!shot && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{shot}</Text>
                    </View>
                  )}

                  {!!region && (
                    <View style={[styles.tag, styles.tagDirection]}>
                      <Text style={[styles.tagText, styles.tagTextDirection]}>
                        {region}
                      </Text>
                    </View>
                  )}
                </View>
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  heading: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.onSurface,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },

  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  leftCol: {
    width: 46,
    alignItems: "center",
  },

  overText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    fontVariant: ["tabular-nums"],
  },

  badge: {
    marginTop: 5,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    fontSize: 11.5,
    fontWeight: "800",
  },

  rightCol: {
    flex: 1,
    marginLeft: 10,
  },

  line: {
    fontSize: 13.5,
    lineHeight: 19,
    color: COLORS.onSurface,
  },

  lineBold: {
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 6,
  },

  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceContainer,
  },

  tagDirection: {
    backgroundColor: "#E8F5E9",
  },

  tagText: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: COLORS.onSurfaceVariant,
  },

  tagTextDirection: {
    color: COLORS.primary,
  },
});
