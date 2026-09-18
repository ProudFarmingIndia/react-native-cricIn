/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| LiveScoreOverlay.js
|
| Description:
| The broadcast furniture: the score strip under the video, and the
| player card that appears when a wicket falls or someone new comes on.
|
| THE ONE RULE THIS COMPONENT LIVES BY
| It renders ONLY what it is given. It never reads "the current score"
| from anywhere, because the current score is 12-20 seconds ahead of the
| picture. Everything here comes from the overlay state fetched at the
| video's own timestamp - see useOverlayState.
|
| Getting that wrong does not look like a bug, it looks like the app
| spoiling the match: the strip announces the wicket while the screen
| still shows the bowler running in. Every time.
|
|--------------------------------------------------------------------------
*/

import React from "react";

import { View, Text, Image, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

/*
| A ball's outcome as one character. Colour carries the meaning faster
| than the text does - the eye finds the red W and the amber 6 without
| reading the row.
*/

const outcomeStyle = (value) => {
  const v = String(value).toUpperCase();

  if (v === "W") return [styles.ballChip, styles.ballWicket];

  if (v === "6") return [styles.ballChip, styles.ballSix];

  if (v === "4") return [styles.ballChip, styles.ballFour];

  if (v === "0") return [styles.ballChip, styles.ballDot];

  return [styles.ballChip];
};

const outcomeTextStyle = (value) => {
  const v = String(value).toUpperCase();

  if (v === "W" || v === "6" || v === "4") return styles.ballTextStrong;

  return styles.ballText;
};

/*
|--------------------------------------------------------------------------
| Score Strip
|--------------------------------------------------------------------------
|
| Sits directly under the video, the way a broadcast lower-third does.
| Batting side and score on top, the two batters and the bowler beneath,
| last six balls on the right.
|
*/

const ScoreStrip = ({ state }) => {
  const score = state?.score;

  if (!score) return null;

  return (
    <View style={styles.strip}>
      <View style={styles.stripTop}>
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTagText}>LIVE</Text>
        </View>

        <Text style={styles.scoreText}>
          {score.runs}
          <Text style={styles.scoreSlash}>/</Text>
          {score.wickets}
        </Text>

        <Text style={styles.oversText}>({score.overs} ov)</Text>

        <View style={styles.stripSpacer} />

        {!!state?.inningsNumber && (
          <Text style={styles.inningsText}>
            {state.inningsNumber === 1 ? "1st Inn" : "2nd Inn"}
          </Text>
        )}
      </View>

      <View style={styles.stripBottom}>
        <View style={styles.battersBlock}>
          {!!state?.striker && (
            <Text style={styles.playerLine} numberOfLines={1}>
              <Text style={styles.strikerName}>
                {state.striker.name}*{" "}
              </Text>
              <Text style={styles.playerFigures}>
                {state.striker.runs} ({state.striker.balls})
              </Text>
            </Text>
          )}

          {!!state?.nonStriker && (
            <Text style={styles.playerLine} numberOfLines={1}>
              <Text style={styles.playerName}>{state.nonStriker.name} </Text>
              <Text style={styles.playerFigures}>
                {state.nonStriker.runs} ({state.nonStriker.balls})
              </Text>
            </Text>
          )}
        </View>

        <View style={styles.bowlerBlock}>
          {!!state?.bowler && (
            <>
              <Text style={styles.playerLine} numberOfLines={1}>
                <Text style={styles.playerName}>{state.bowler.name}</Text>
              </Text>

              <Text style={styles.playerFigures} numberOfLines={1}>
                {state.bowler.wickets}-{state.bowler.runs} ({state.bowler.overs})
              </Text>
            </>
          )}
        </View>
      </View>

      {/*
      | The last six balls. This is the single most-read thing on a
      | cricket broadcast - it answers "what did I just miss" without
      | anyone having to say it.
      */}

      {Array.isArray(state?.lastSix) && state.lastSix.length > 0 && (
        <View style={styles.ballsRow}>
          <Text style={styles.ballsLabel}>THIS OVER</Text>

          {state.lastSix.map((ball, index) => (
            <View key={`${ball}-${index}`} style={outcomeStyle(ball)}>
              <Text style={outcomeTextStyle(ball)}>{ball}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Player Card
|--------------------------------------------------------------------------
|
| The thing that makes this look like a broadcast rather than a scorecard
| with a video on top: when a batsman walks out, his career numbers slide
| in for six seconds. Same for a new bowler, and for the man who has just
| been dismissed.
|
| WHY IT SITS OVER THE VIDEO AND NOT UNDER IT
| It is a moment, not a permanent readout. Over the picture it reads as
| broadcast graphics; below the video it would push the whole layout
| around every few overs.
|
| The card is BUILT BY THE SERVER (overlay.service buildCard) - including
| which of the three kinds wins when two happen on the same ball. A wicket
| beats a new batsman: reversing that makes the app look like it missed
| the wicket entirely.
|
*/

const CareerRow = ({ label, value }) => {
  if (value === null || value === undefined || value === "") return null;

  return (
    <View style={styles.careerItem}>
      <Text style={styles.careerValue}>{value}</Text>
      <Text style={styles.careerLabel}>{label}</Text>
    </View>
  );
};

const PlayerCard = ({ card }) => {
  if (!card) return null;

  const career = card.career || {};

  const isBowler = card.role === "bowler";

  const heading =
    card.type === "wicket"
      ? "OUT"
      : card.type === "new_bowler"
        ? "NEW BOWLER"
        : "NEW BATSMAN";

  return (
    <View
      style={[
        styles.card,
        card.type === "wicket" && styles.cardWicket,
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <Text
          style={[
            styles.cardHeading,
            card.type === "wicket" && styles.cardHeadingWicket,
          ]}
        >
          {heading}
        </Text>
      </View>

      <View style={styles.cardBody}>
        {career.image ? (
          <Image source={{ uri: career.image }} style={styles.cardAvatar} />
        ) : (
          <View style={[styles.cardAvatar, styles.cardAvatarEmpty]}>
            <Text style={styles.cardAvatarInitial}>
              {(career.name || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {career.name || "Player"}
            {career.jersey ? (
              <Text style={styles.cardJersey}>  #{career.jersey}</Text>
            ) : null}
          </Text>

          {/*
          | This match first, career second. A viewer who just tuned in
          | wants to know what this player has done TODAY; the career line
          | is context under it.
          */}

          {!!card.thisMatch && !isBowler && (
            <Text style={styles.cardThisMatch}>
              This match: {card.thisMatch.runs} ({card.thisMatch.balls}) ·{" "}
              {card.thisMatch.fours}x4 · {card.thisMatch.sixes}x6
            </Text>
          )}

          <View style={styles.careerRow}>
            {isBowler ? (
              <>
                <CareerRow label="MAT" value={career.matches} />
                <CareerRow label="WKTS" value={career.wickets} />
                <CareerRow label="ECON" value={career.economy} />
                <CareerRow label="BEST" value={career.bestBowling} />
              </>
            ) : (
              <>
                <CareerRow label="MAT" value={career.matches} />
                <CareerRow label="RUNS" value={career.runs} />
                <CareerRow label="AVG" value={career.average} />
                <CareerRow label="SR" value={career.strikeRate} />
                <CareerRow label="HS" value={career.highestScore} />
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Overlay
|--------------------------------------------------------------------------
|
| `card` is passed separately from `state` because the two have different
| lifetimes: the strip is always on, the card appears for six seconds. The
| hook owns that timer, not this component - a component that manages its
| own dismissal timer re-renders the whole overlay every time it ticks.
|
*/

export default function LiveScoreOverlay({ state, card, compact = false }) {
  if (!state?.hasData) return null;

  return (
    <>
      {!!card && (
        <View
          style={[styles.cardLayer, compact && styles.cardLayerCompact]}
          pointerEvents="none"
        >
          <PlayerCard card={card} />
        </View>
      )}

      <ScoreStrip state={state} />
    </>
  );
}

const styles = StyleSheet.create({
  /* ── Score strip ──────────────────────────────────────────────── */

  strip: {
    backgroundColor: "#101710",
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 10,
    borderTopWidth: 2,
    borderTopColor: COLORS.secondaryContainer,
  },

  stripTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.error,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },

  liveTagText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.8,
  },

  scoreText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.5,
  },

  scoreSlash: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
  },

  oversText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
  },

  stripSpacer: {
    flex: 1,
  },

  inningsText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: COLORS.secondaryContainer,
  },

  stripBottom: {
    flexDirection: "row",
    marginTop: 7,
    gap: 12,
  },

  battersBlock: {
    flex: 1.2,
  },

  bowlerBlock: {
    flex: 1,
    alignItems: "flex-end",
  },

  playerLine: {
    fontSize: 12,
    marginBottom: 1,
  },

  strikerName: {
    color: "#ffffff",
    fontWeight: "800",
  },

  playerName: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },

  playerFigures: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11.5,
    fontWeight: "600",
  },

  ballsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 9,
  },

  ballsLabel: {
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "rgba(255,255,255,0.45)",
    marginRight: 3,
  },

  ballChip: {
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  ballDot: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  ballFour: {
    backgroundColor: COLORS.primaryContainer,
  },

  ballSix: {
    backgroundColor: COLORS.secondaryContainer,
  },

  ballWicket: {
    backgroundColor: COLORS.error,
  },

  ballText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },

  ballTextStrong: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#ffffff",
  },

  /* ── Player card ──────────────────────────────────────────────── */

  cardLayer: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 12,
    zIndex: 20,
  },

  cardLayerCompact: {
    left: 8,
    right: 8,
    bottom: 8,
  },

  card: {
    backgroundColor: "rgba(9,14,9,0.94)",
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondaryContainer,
  },

  cardWicket: {
    borderLeftColor: COLORS.error,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardHeading: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: COLORS.secondaryContainer,
  },

  cardHeadingWicket: {
    color: COLORS.error,
  },

  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginRight: 11,
  },

  cardAvatarEmpty: {
    alignItems: "center",
    justifyContent: "center",
  },

  cardAvatarInitial: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },

  cardInfo: {
    flex: 1,
  },

  cardName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#ffffff",
  },

  cardJersey: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
  },

  cardThisMatch: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.secondaryContainer,
  },

  careerRow: {
    flexDirection: "row",
    marginTop: 7,
    gap: 14,
  },

  careerItem: {
    alignItems: "flex-start",
  },

  careerValue: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#ffffff",
  },

  careerLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.45)",
    marginTop: 1,
  },
});