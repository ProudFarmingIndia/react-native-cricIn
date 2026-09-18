/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| AwardsList.js
|
| Description:
| The awards board. Shared by tournaments and series - both hand it the
| same payload, because the server builds both from the same counter.
|
| WHY THE WINNER IS SHOWN WHILE THE TOURNAMENT IS STILL RUNNING
| A countable award has a leader from the first completed match, and that
| is most of its value: a batter two sixes off the Most Sixes prize will
| play the next over differently for knowing it. So the card shows the
| current leader with a "LEADING" tag, and only calls it a winner once the
| tournament is over. Hiding the board until the end would turn a live
| incentive into a post-match announcement.
|
| WHY RUNNERS-UP ARE COLLAPSED
| Five names under every award is a wall. The top three are one tap away
| and closed by default, because the question people actually arrive with
| is "who is winning", not "who are all ten contenders".
|
| The organizer sees one extra thing: a "Winner chuno" button on the
| awards the app cannot count, and an override on the ones it can.
|
|--------------------------------------------------------------------------
*/

import React, { useState } from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import { awardIcon, formatMoney } from "../constants/tournamentConstants";

/*
| Module scope. Defined inside the component, expanding one card would give
| React a new type for every other card and remount the whole list.
*/

const ContenderRow = ({ rank, row, unit }) => (
  <View style={styles.contender}>
    <Text style={styles.contenderRank}>{rank}</Text>

    <Text style={styles.contenderName} numberOfLines={1}>
      {row.name}
    </Text>

    <Text style={styles.contenderValue}>
      {row.display}
      {unit ? ` ${unit}` : ""}
    </Text>
  </View>
);

const AwardCard = ({ award, canManage, finished, onPick, onClear }) => {
  const [open, setOpen] = useState(false);

  const { winner } = award;

  /*
  | The rest of the board minus whoever is already shown at the top - a
  | leader repeated as their own runner-up reads as a bug.
  */

  const rest = (award.contenders || []).filter(
    (c) => String(c.playerId) !== String(winner?.playerId),
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.cardIcon}>
          <Ionicons
            name={awardIcon(award.metric)}
            size={17}
            color={COLORS.secondary}
          />
        </View>

        <View style={styles.cardHeadText}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {award.label}
          </Text>

          {!!award.amount && (
            <Text style={styles.cardAmount}>{formatMoney(award.amount)}</Text>
          )}
        </View>

        {/*
        | Says who decided it, because "app ne nikala" and "organiser ne
        | chuna" are different claims and a player disputing an award
        | deserves to know which one they are arguing with.
        */}

        {award.decidedBy === "organizer" && (
          <View style={styles.byPill}>
            <Text style={styles.byPillText}>ORGANISER</Text>
          </View>
        )}
      </View>

      {winner ? (
        <View style={styles.winner}>
          <View style={styles.winnerAvatar}>
            <Ionicons name="person" size={17} color={COLORS.onPrimary} />
          </View>

          <View style={styles.winnerText}>
            <Text style={styles.winnerName} numberOfLines={1}>
              {winner.name}
            </Text>

            {!!winner.display && (
              <Text style={styles.winnerValue}>
                {winner.display}
                {award.unit ? ` ${award.unit}` : ""}
              </Text>
            )}
          </View>

          <View
            style={[styles.statePill, finished && styles.statePillDone]}
          >
            <Text
              style={[styles.statePillText, finished && styles.statePillTextDone]}
            >
              {finished ? "WINNER" : "LEADING"}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.pending}>
          <Ionicons name="hourglass-outline" size={15} color={COLORS.outline} />

          <Text style={styles.pendingText}>
            {award.computed
              ? "Abhi koi match complete nahi hua."
              : "Organiser abhi decide karega."}
          </Text>
        </View>
      )}

      {!!award.qualifierLabel && (
        <Text style={styles.qualifier}>Shart: {award.qualifierLabel}</Text>
      )}

      {rest.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.moreBtn}
            activeOpacity={0.8}
            onPress={() => setOpen((v) => !v)}
          >
            <Text style={styles.moreText}>
              {open ? "Chhupao" : `Aur ${Math.min(rest.length, 3)} contenders`}
            </Text>

            <Ionicons
              name={open ? "chevron-up" : "chevron-down"}
              size={14}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          {open &&
            rest.slice(0, 3).map((row, i) => (
              <ContenderRow
                key={String(row.playerId)}
                rank={i + 2}
                row={row}
                unit={award.unit}
              />
            ))}
        </>
      )}

      {canManage && (
        <View style={styles.manageRow}>
          <TouchableOpacity
            style={styles.manageBtn}
            activeOpacity={0.85}
            onPress={() => onPick?.(award)}
          >
            <Ionicons name="person-outline" size={15} color={COLORS.primary} />

            <Text style={styles.manageText}>
              {award.decidedBy === "organizer" ? "Winner badlo" : "Winner chuno"}
            </Text>
          </TouchableOpacity>

          {/*
          | Only on an award the app CAN count, and only when it has been
          | overridden - "hand it back to the counter" is meaningless for
          | Man of the Series, and offering it there would just be a
          | button that clears the winner with no replacement.
          */}

          {award.computed && award.decidedBy === "organizer" && (
            <TouchableOpacity
              style={styles.clearBtn}
              activeOpacity={0.85}
              onPress={() => onClear?.(award)}
            >
              <Text style={styles.clearText}>App par chhodo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default function AwardsList({
  awards = [],
  prizes = [],
  canManage = false,
  finished = false,
  onPick,
  onClear,
}) {
  if (!awards.length && !prizes.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="trophy-outline" size={30} color={COLORS.outline} />

        <Text style={styles.emptyText}>
          Is tournament mein koi prize ya award set nahi hai.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {awards.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>PLAYER AWARDS</Text>

          {awards.map((award) => (
            <AwardCard
              key={`${award.metric}-${award.label}`}
              award={award}
              canManage={canManage}
              finished={finished}
              onPick={onPick}
              onClear={onClear}
            />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.onSurfaceVariant,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    marginBottom: 11,
  },

  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cardIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
  },

  cardHeadText: { flex: 1 },

  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.onSurface,
  },

  cardAmount: {
    marginTop: 2,
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  byPill: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },

  byPillText: {
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Winner ───────────────────────────────────────────────────── */

  winner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    backgroundColor: "#F2F8F0",
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },

  winnerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  winnerText: { flex: 1 },

  winnerName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  winnerValue: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  statePill: {
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  statePillDone: { backgroundColor: COLORS.primary },

  statePillText: {
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: COLORS.onPrimary,
  },

  statePillTextDone: { color: COLORS.onPrimary },

  /* ── Pending ──────────────────────────────────────────────────── */

  pending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 11,
    paddingHorizontal: 4,
  },

  pendingText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  qualifier: {
    marginTop: 8,
    fontSize: 10.5,
    fontStyle: "italic",
    color: COLORS.outline,
  },

  /* ── Contenders ───────────────────────────────────────────────── */

  moreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },

  moreText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.primary,
  },

  contender: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  contenderRank: {
    width: 16,
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.outline,
  },

  contenderName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  contenderValue: {
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.onSurfaceVariant,
    fontVariant: ["tabular-nums"],
  },

  /* ── Manage ───────────────────────────────────────────────────── */

  manageRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  manageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 10,
  },

  manageText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: COLORS.primary,
  },

  clearBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 13,
    justifyContent: "center",
  },

  clearText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  /* ── Empty ────────────────────────────────────────────────────── */

  empty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },

  emptyText: {
    fontSize: 13,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },
});
