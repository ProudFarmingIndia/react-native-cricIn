/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| PlayerPickerModal.js
|
| Description:
| Picks a player for an award the app cannot count. Shared by tournaments
| and series.
|
| WHY IT OFFERS THE CONTENDERS FIRST
| An organizer choosing Man of the Series has a shortlist in their head,
| and it is almost always somebody already near the top of a board. So the
| leaderboard leaders are shown as one-tap options before the search box
| is touched at all - the common case needs no typing.
|
| Search is the fallback, and it has to exist: the best fielder of a
| tournament may have scored 40 runs across six weeks and appear on no
| board anywhere.
|
| WHY IT SEARCHES PLAYERS AND NOT USERS
| An award belongs to a player record, which is what the scorecards, the
| career stats and the boards are all keyed by. Awarding it to a user id
| would leave the winner unable to see it on their own profile.
|
|--------------------------------------------------------------------------
*/

import React, { useMemo, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import useSearch from "../../search/hooks/useSearch";

const PlayerRow = ({ name, subtitle, onPress }) => (
  <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={onPress}>
    <View style={styles.avatar}>
      <Ionicons name="person" size={16} color={COLORS.onPrimary} />
    </View>

    <View style={styles.rowText}>
      <Text style={styles.rowName} numberOfLines={1}>
        {name}
      </Text>

      {!!subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
    </View>

    <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
  </TouchableOpacity>
);

export default function PlayerPickerModal({
  visible,
  award,
  leaderboards = {},
  saving = false,
  onSelect,
  onClose,
}) {
  const { players, loading, searchPlayers, clearSearchResults } = useSearch();

  const [keyword, setKeyword] = useState("");

  const timeout = useRef(null);

  const onType = (text) => {
    setKeyword(text);

    if (timeout.current) clearTimeout(timeout.current);

    if (text.trim().length < 3) {
      clearSearchResults();

      return;
    }

    timeout.current = setTimeout(() => searchPlayers(text.trim()), 400);
  };

  /*
  | The shortlist: the top of every board, deduplicated, best first.
  |
  | Deduplication matters because the same person tops three boards in a
  | small tournament, and offering their name three times reads as a bug.
  | The label keeps whichever board they led first, in BOARD priority, so
  | it says something useful next to their name.
  */

  const suggestions = useMemo(() => {
    const seen = new Map();

    for (const [metric, rows] of Object.entries(leaderboards)) {
      (rows || []).slice(0, 3).forEach((r) => {
        if (seen.has(String(r.playerId))) return;

        seen.set(String(r.playerId), {
          playerId: String(r.playerId),
          name: r.name,
          note: `${metric.replace(/_/g, " ")} — ${r.display}`,
        });
      });
    }

    return [...seen.values()].slice(0, 8);
  }, [leaderboards]);

  const close = () => {
    setKeyword("");

    clearSearchResults();

    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <View style={styles.wrap}>
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.title} numberOfLines={1}>
              {award?.label || "Winner chuno"}
            </Text>

            <TouchableOpacity onPress={close}>
              <Ionicons name="close" size={22} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {!!award?.hint && <Text style={styles.hint}>{award.hint}</Text>}

          {saving ? (
            <View style={styles.saving}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={keyword}
                placeholder="Player ka naam ya mobile"
                placeholderTextColor={COLORS.outline}
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={onType}
              />

              <ScrollView
                style={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {keyword.trim().length < 3 && suggestions.length > 0 && (
                  <>
                    <Text style={styles.section}>TOURNAMENT KE TOP PLAYERS</Text>

                    {suggestions.map((s) => (
                      <PlayerRow
                        key={s.playerId}
                        name={s.name}
                        subtitle={s.note}
                        onPress={() => onSelect?.(s.playerId, s.name)}
                      />
                    ))}
                  </>
                )}

                {loading && (
                  <ActivityIndicator
                    style={styles.spin}
                    color={COLORS.primary}
                  />
                )}

                {!loading && keyword.trim().length >= 3 && (
                  <>
                    <Text style={styles.section}>SEARCH RESULTS</Text>

                    {players.length === 0 ? (
                      <Text style={styles.none}>Koi player nahi mila.</Text>
                    ) : (
                      players.map((p) => (
                        <PlayerRow
                          key={String(p._id)}
                          name={p.playerName}
                          subtitle={p.userId?.phone || p.role || ""}
                          onPress={() => onSelect?.(String(p._id), p.playerName)}
                        />
                      ))
                    )}
                  </>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    maxHeight: "85%",
  },

  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.onSurface,
  },

  hint: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 11.5,
    lineHeight: 16.5,
    color: COLORS.onSurfaceVariant,
  },

  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    color: COLORS.onSurface,
  },

  scroll: { maxHeight: 400, marginTop: 6 },

  section: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  rowText: { flex: 1 },

  rowName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  rowSub: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    textTransform: "capitalize",
  },

  spin: { marginVertical: 24 },

  none: {
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
    paddingVertical: 12,
  },

  saving: { paddingVertical: 50, alignItems: "center" },
});
