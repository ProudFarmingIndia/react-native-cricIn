/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| PrizeList.js
|
| Description:
| The prize breakdown, and the strip that sits on the banner.
|
| WHY TWO COMPONENTS IN ONE FILE
| They render the same data at two sizes and must never disagree. On the
| banner it is one line - "₹25,000 prize pool" - and in the Overview tab it
| is the full ladder. Splitting them across files is how the pool total on
| the card ends up computed differently from the sum of the rows below it.
|
| The list is open-ended on purpose: 1st and 2nd, or four places plus Man
| of the Series. `position` is a number the organizer sets and `label` is
| their own words, so this component never assumes how many rows there are.
|
|--------------------------------------------------------------------------
*/

import React from "react";

import { View, Text, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import { formatMoney, positionSuffix } from "../constants/tournamentConstants";

/*
| Gold, silver, bronze for the top three and the app's own green after
| that. Colour is doing real work here - on a five-row ladder it is what
| lets somebody find first place without reading.
*/

const MEDAL = ["#C9A227", "#98A2A8", "#A9713B"];

const medalColor = (position) => MEDAL[position - 1] || COLORS.primary;

/*
|--------------------------------------------------------------------------
| Banner strip
|--------------------------------------------------------------------------
|
| Sits over the tournament banner image. Shows the pool if there is money,
| and the top prize label when there is not - "Trophy + kit bag" is still
| worth advertising.
|
*/

export const PrizeBanner = ({ prizes = [], prizePool = 0 }) => {
  if (!prizes.length && !prizePool) return null;

  const top = [...prizes].sort((a, b) => a.position - b.position)[0];

  return (
    <View style={styles.bannerStrip}>
      <Ionicons name="trophy" size={14} color="#FFD770" />

      <Text style={styles.bannerText} numberOfLines={1}>
        {prizePool > 0
          ? `${formatMoney(prizePool)} prize pool`
          : top?.description || top?.label || "Prizes"}
        {prizes.length > 1 ? ` · ${prizes.length} prizes` : ""}
      </Text>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Full ladder
|--------------------------------------------------------------------------
*/

export default function PrizeList({ prizes = [], prizePool = 0, compact = false }) {
  if (!prizes.length) return null;

  const sorted = [...prizes].sort((a, b) => a.position - b.position);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.head}>
        <Text style={styles.title}>PRIZES</Text>

        {prizePool > 0 && (
          <Text style={styles.pool}>{formatMoney(prizePool)} total</Text>
        )}
      </View>

      {sorted.map((prize) => (
        <View key={`${prize.position}-${prize.label}`} style={styles.row}>
          <View
            style={[styles.badge, { backgroundColor: medalColor(prize.position) }]}
          >
            <Text style={styles.badgeText}>
              {positionSuffix(prize.position)}
            </Text>
          </View>

          <View style={styles.rowText}>
            <Text style={styles.label} numberOfLines={1}>
              {prize.label}
            </Text>

            {!!prize.description && (
              <Text style={styles.desc} numberOfLines={2}>
                {prize.description}
              </Text>
            )}
          </View>

          {prize.amount > 0 && (
            <Text style={styles.amount}>{formatMoney(prize.amount)}</Text>
          )}
        </View>
      ))}

      {/*
      | Said plainly, because somebody WILL assume the app is holding the
      | money. It is not, and finding that out later is worse than reading
      | it here.
      */}

      <Text style={styles.note}>
        Prize organizer deta hai — CricIn ke through koi payment nahi hoti.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  bannerText: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: "#ffffff",
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardCompact: { padding: 13, borderRadius: 12 },

  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
  },

  pool: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  badge: {
    minWidth: 38,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    alignItems: "center",
  },

  badgeText: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.4,
  },

  rowText: { flex: 1 },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  desc: {
    marginTop: 2,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  amount: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },

  note: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    fontSize: 11,
    fontStyle: "italic",
    color: COLORS.onSurfaceVariant,
  },
});
