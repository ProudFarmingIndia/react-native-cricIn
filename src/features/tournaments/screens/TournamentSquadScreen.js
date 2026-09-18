/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| TournamentSquadScreen.js
|
| Description:
| The captain picks 15 to 20 players from their team roster. Only these
| players may appear in this tournament's matches.
|
| WHY SAVE AND SUBMIT ARE TWO DIFFERENT BUTTONS
| A captain rarely knows all fifteen names in one sitting - they are
| waiting on two people to confirm they are free for six weekends. If the
| only button enforced the minimum, the screen would refuse every
| intermediate state and the captain would have to hold the list in their
| head until it was complete.
|
| So "Save draft" writes whatever is ticked, and "Lock squad" is the
| commitment that enforces the floor. The server applies the same split:
| `final: false` skips the minimum check, `final: true` does not.
|
| LOCKING IS ONE-WAY
| Once locked the squad cannot be edited, which is the entire point - a
| club that can swap players mid-tournament does not have a squad. The
| confirm dialog says so in the words a captain will read.
|
|--------------------------------------------------------------------------
*/

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import { SQUAD_HINT } from "../constants/tournamentConstants";

import { getSquadApi, setSquadApi } from "../services/tournament.service";

/*
| Module scope, not inside the component - a new component type on every
| tick would make React unmount and remount all twenty rows each time a
| name is ticked, which is both slow and visibly janky on a mid-range
| Android.
*/

const PlayerRow = ({ player, selected, disabled, onPress }) => (
  <TouchableOpacity
    style={[styles.row, selected && styles.rowSelected]}
    activeOpacity={disabled ? 1 : 0.8}
    onPress={disabled ? undefined : onPress}
  >
    <View style={[styles.box, selected && styles.boxOn]}>
      {selected && (
        <Ionicons name="checkmark" size={15} color={COLORS.onPrimary} />
      )}
    </View>

    <View style={styles.rowInfo}>
      <Text
        style={[styles.rowName, selected && styles.rowNameSelected]}
        numberOfLines={1}
      >
        {player.playerName}
      </Text>

      {!!player.role && <Text style={styles.rowRole}>{player.role}</Text>}
    </View>
  </TouchableOpacity>
);

export default function TournamentSquadScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { tournamentId, teamId, tournamentName } = route.params || {};

  const [data, setData] = useState(null);

  const [selected, setSelected] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load = useCallback(async () => {
    try {
      const payload = await getSquadApi(tournamentId, teamId);

      setData(payload);

      setSelected(payload.squad || []);
    } catch (err) {
      Alert.alert(
        "Squad load nahi hui",
        err?.response?.data?.message || "Dobara try karo.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } finally {
      setLoading(false);
    }
  }, [tournamentId, teamId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Selection
  |--------------------------------------------------------------------------
  */

  const min = data?.min ?? 15;

  const max = data?.max ?? 20;

  const locked = !!data?.locked;

  const toggle = (playerId) => {
    setSelected((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      }

      /*
      | Blocked at the ceiling rather than silently dropping someone. The
      | captain has to decide who comes out, which is the actual decision.
      */

      if (prev.length >= max) {
        Alert.alert(
          "Squad bhar gayi",
          `Zyada se zyada ${max} players. Kisi ko hatao phir naya add karo.`,
        );

        return prev;
      }

      return [...prev, playerId];
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const save = async (final) => {
    setSaving(true);

    try {
      await setSquadApi(tournamentId, teamId, selected, final);

      if (final) {
        Alert.alert(
          "Squad lock ho gayi",
          `${selected.length} players register ho gaye. Ab yahi khelenge.`,
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );

        return;
      }

      Alert.alert("Draft save ho gaya", "Baad mein aa kar poori kar lena.");

      await load();
    } catch (err) {
      Alert.alert(
        "Save nahi hua",
        err?.response?.data?.message || "Dobara try karo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmLock = () => {
    Alert.alert(
      "Squad lock karein?",
      `${selected.length} players final ho jayenge. Iske baad koi badlav nahi ho sakta - poore tournament mein sirf yahi khelenge.`,
      [
        { text: "Abhi nahi", style: "cancel" },
        { text: "Lock karo", style: "destructive", onPress: () => save(true) },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Derived
  |--------------------------------------------------------------------------
  */

  const roster = data?.roster || [];

  const count = selected.length;

  const short = Math.max(0, min - count);

  /*
  | Selected players float to the top so the captain can see their squad as
  | a squad instead of hunting ticks through a forty-name roster.
  */

  const ordered = useMemo(() => {
    const inSquad = roster.filter((p) => selected.includes(p._id));

    const rest = roster.filter((p) => !selected.includes(p._id));

    return [...inSquad, ...rest];
  }, [roster, selected]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Counter ─────────────────────────────────────────────────── */}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.count}>
              {count}
              <Text style={styles.countMax}> / {max}</Text>
            </Text>

            <Text style={styles.countLabel}>
              {(data?.teamName || "TEAM").toUpperCase()}
            </Text>
          </View>

          {locked ? (
            <View style={styles.lockPill}>
              <Ionicons name="lock-closed" size={13} color={COLORS.primary} />

              <Text style={styles.lockPillText}>LOCKED</Text>
            </View>
          ) : (
            <View
              style={[
                styles.statusPill,
                short === 0 && styles.statusPillReady,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  short === 0 && styles.statusPillTextReady,
                ]}
              >
                {short === 0 ? "READY" : `${short} AUR CHAHIYE`}
              </Text>
            </View>
          )}
        </View>

        {/* Progress toward the floor, not the ceiling - 15 is the goal. */}

        <View style={styles.bar}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, (count / min) * 100)}%` },
              short === 0 && styles.barFillReady,
            ]}
          />
        </View>

        <Text style={styles.hint}>
          {locked
            ? `${tournamentName || "Is tournament"} ke liye squad final ho chuki hai.`
            : SQUAD_HINT}
        </Text>
      </View>

      {/* ── Roster ──────────────────────────────────────────────────── */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {roster.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={COLORS.outline} />

            <Text style={styles.emptyTitle}>Team mein koi player nahi</Text>

            <Text style={styles.emptyText}>
              Pehle apni team mein players add karo, phir squad register karna.
            </Text>
          </View>
        )}

        {ordered.map((player) => (
          <PlayerRow
            key={player._id}
            player={player}
            selected={selected.includes(player._id)}
            disabled={locked}
            onPress={() => toggle(player._id)}
          />
        ))}
      </ScrollView>

      {/* ── Actions ─────────────────────────────────────────────────── */}

      {!locked && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.draftBtn}
            activeOpacity={0.85}
            disabled={saving}
            onPress={() => save(false)}
          >
            <Text style={styles.draftText}>Save draft</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.lockBtn, short > 0 && styles.lockBtnOff]}
            activeOpacity={0.85}
            disabled={saving || short > 0}
            onPress={confirmLock}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <Text style={styles.lockText}>
                {short > 0 ? `${short} aur chahiye` : "Lock squad"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  /* ── Header ───────────────────────────────────────────────────── */

  header: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: { flex: 1 },

  count: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.primary,
  },

  countMax: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.outline,
  },

  countLabel: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },

  statusPill: {
    backgroundColor: "#FFF3E0",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  statusPillReady: { backgroundColor: "#E2EDE0" },

  statusPillText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: COLORS.secondary,
  },

  statusPillTextReady: { color: COLORS.primary },

  lockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E2EDE0",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  lockPillText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: COLORS.primary,
  },

  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainer,
    marginTop: 12,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.secondaryContainer,
  },

  barFillReady: { backgroundColor: COLORS.primary },

  hint: {
    marginTop: 10,
    fontSize: 11.5,
    lineHeight: 16.5,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Rows ─────────────────────────────────────────────────────── */

  scroll: { flex: 1 },

  content: { padding: 16, paddingBottom: 24 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 9,
  },

  rowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#F2F8F0",
  },

  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },

  boxOn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  rowInfo: { flex: 1, marginLeft: 12 },

  rowName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  rowNameSelected: { fontWeight: "800", color: COLORS.primary },

  rowRole: {
    marginTop: 2,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Empty ────────────────────────────────────────────────────── */

  empty: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 8,
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
  },

  /* ── Footer ───────────────────────────────────────────────────── */

  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  draftBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 13,
    alignItems: "center",
  },

  draftText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.primary,
  },

  lockBtn: {
    flex: 1.3,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  lockBtnOff: { backgroundColor: COLORS.outline },

  lockText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.onPrimary,
  },
});
