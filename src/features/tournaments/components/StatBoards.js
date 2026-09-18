/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| StatBoards.js
|
| Description:
| Every leaderboard the server counted, drawn as collapsible cards.
| Shared by tournaments and series.
|
| WHY THESE ARE THE SAME NUMBERS AS THE AWARDS
| They come from the same server call chain - one counter over the same
| deliveries. Two separate counters would disagree eventually (one credits
| a run out to the bowler, the other does not), and then the Most Wickets
| award names a player the stats tab has in second place. That kind of
| contradiction destroys trust in both screens at once.
|
| WHY ONLY THE TOP THREE SHOW
| Ten rows across ten boards is a hundred rows, and nobody scrolls a
| hundred rows. Three is the podium; the rest is one tap away on the board
| somebody actually cares about.
|
| Empty boards are dropped entirely rather than shown with "no data" -
| before the first match every board is empty, and ten empty cards is a
| worse answer than one honest empty state.
|
|--------------------------------------------------------------------------
*/

import React, { useState } from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import {
  BOARD_TITLE,
  BOARD_ORDER,
  awardIcon,
} from "../constants/tournamentConstants";

const Row = ({ rank, row }) => (
  <View style={styles.row}>
    <View style={[styles.rank, rank === 1 && styles.rankTop]}>
      <Text style={[styles.rankText, rank === 1 && styles.rankTextTop]}>
        {rank}
      </Text>
    </View>

    <Text style={styles.name} numberOfLines={1}>
      {row.name}
    </Text>

    <Text style={styles.value}>{row.display}</Text>
  </View>
);

const Board = ({ metric, rows }) => {
  const [open, setOpen] = useState(false);

  const shown = open ? rows.slice(0, 10) : rows.slice(0, 3);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Ionicons name={awardIcon(metric)} size={15} color={COLORS.primary} />

        <Text style={styles.title}>
          {BOARD_TITLE[metric] || metric.replace(/_/g, " ")}
        </Text>
      </View>

      {shown.map((row, i) => (
        <Row key={String(row.playerId)} rank={i + 1} row={row} />
      ))}

      {rows.length > 3 && (
        <TouchableOpacity
          style={styles.more}
          activeOpacity={0.8}
          onPress={() => setOpen((v) => !v)}
        >
          <Text style={styles.moreText}>
            {open ? "Kam dikhao" : `Poori list (${Math.min(rows.length, 10)})`}
          </Text>

          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={13}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function StatBoards({ boards = {}, emptyText }) {
  /*
  | Ordered by BOARD_ORDER so runs and wickets lead - that is what anyone
  | opening a stats page came for. A metric the server added but this app
  | does not know about is appended rather than dropped, so a new
  | leaderboard appears without an app release.
  */

  const known = BOARD_ORDER.filter((k) => (boards[k] || []).length > 0);

  const extra = Object.keys(boards).filter(
    (k) => !BOARD_ORDER.includes(k) && (boards[k] || []).length > 0,
  );

  const keys = [...known, ...extra];

  if (!keys.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="stats-chart-outline" size={30} color={COLORS.outline} />

        <Text style={styles.emptyText}>
          {emptyText || "Abhi koi match complete nahi hua."}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {keys.map((metric) => (
        <Board key={metric} metric={metric} rows={boards[metric]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 13,
    marginBottom: 11,
  },

  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },

  title: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  rank: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceContainer,
  },

  rankTop: { backgroundColor: COLORS.primary },

  rankText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.onSurfaceVariant,
  },

  rankTextTop: { color: COLORS.onPrimary },

  name: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  value: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
    fontVariant: ["tabular-nums"],
  },

  more: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 9,
  },

  moreText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: COLORS.primary,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 44,
    gap: 10,
  },

  emptyText: {
    fontSize: 13,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },
});
