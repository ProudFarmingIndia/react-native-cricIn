/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| TournamentInviteScreen.js
|
| Description:
| "Your team has been invited." Accept or decline.
|
| WHY THIS IS A SCREEN AND NOT TWO BUTTONS ON A NOTIFICATION
| A captain accepting is committing their side to weeks of weekends. Two
| buttons on a notification row give them a tournament name and nothing
| else to decide with. This shows the whole thing first: who is running
| it, the format, how many matches that works out to, the dates, the
| ground, the entry fee, the prizes, and who has already joined.
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
} from "react-native";

import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

import PrizeList from "../components/PrizeList";

import {
  getTournamentApi,
  previewFixturesApi,
  respondToTournamentInviteApi,
} from "../services/tournament.service";

import { FORMAT_LABEL } from "../constants/tournamentConstants";

const Row = ({ icon, label, value }) => {
  if (!value) return null;

  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={15} color={COLORS.onSurfaceVariant} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

export default function TournamentInviteScreen() {
  const navigation = useNavigation();

  const route = useRoute();

  const { tournamentId, teamId } = route.params || {};

  const [tournament, setTournament] = useState(null);

  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);

  const [answering, setAnswering] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getTournamentApi(tournamentId);

      setTournament(data);

      previewFixturesApi(data.format, data.maxTeams, data.playoffShape)
        .then(setPreview)
        .catch(() => undefined);
    } catch {
      setTournament(null);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const respond = async (accept) => {
    setAnswering(accept ? "accept" : "decline");

    try {
      await respondToTournamentInviteApi(
        tournamentId,
        teamId || tournament?.myInvite?.teamId,
        accept,
      );

      if (accept) {
        /*
        | Straight to the squad screen. A captain who has just accepted has
        | one job left, and making them find it themselves is how a
        | tournament reaches its first match with half the squads empty.
        */

        navigation.replace("TournamentSquadScreen", {
          tournamentId,
          teamId: teamId || tournament?.myInvite?.teamId,
        });

        return;
      }

      Alert.alert(
        "Declined",
        "Organizer ko bata diya gaya hai. Wo kisi aur team ko invite kar denge.",
      );

      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Failed",
        err?.response?.data?.message || "Jawab record nahi hua.",
      );
    } finally {
      setAnswering(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.centered}>
        <Ionicons name="close-circle-outline" size={30} color={COLORS.outline} />

        <Text style={styles.emptyTitle}>Ye invite ab active nahi hai</Text>

        <Text style={styles.emptyBody}>
          Ho sakta hai organizer ne invite hata diya ho, ya registration band
          ho gaya ho.
        </Text>
      </View>
    );
  }

  const invite = tournament.myInvite;

  const already = !invite;

  const matchesPerTeam =
    tournament.format === "Knockout"
      ? "1 se zyada nahi (haare toh bahar)"
      : `${Math.max(0, (tournament.maxTeams || 1) - 1)} league matches`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Ionicons name="trophy" size={14} color={COLORS.onPrimary} />
          <Text style={styles.badgeText}>TOURNAMENT INVITE</Text>
        </View>

        <Text style={styles.heading}>
          {invite?.teamName || "Tumhari team"} ko bulaya gaya hai
        </Text>

        <Text style={styles.tournamentName}>{tournament.tournamentName}</Text>

        <Row
          icon="person-outline"
          label="Organizer"
          value={tournament.userId?.name || tournament.userId?.phone}
        />
        <Row
          icon="trophy-outline"
          label="Format"
          value={FORMAT_LABEL[tournament.format] || tournament.format}
        />
        <Row
          icon="people-outline"
          label="Teams"
          value={`${tournament.acceptedCount ?? 0} joined of ${tournament.maxTeams}`}
        />
        <Row
          icon="baseball-outline"
          label="Match"
          value={`${tournament.overs} overs · ${tournament.ballType} ball`}
        />
        <Row
          icon="location-outline"
          label="Ground"
          value={tournament.grounds?.map((g) => g.name).join(", ")}
        />
        <Row
          icon="calendar-outline"
          label="Dates"
          value={
            tournament.startDate
              ? new Date(tournament.startDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Abhi tay nahi"
          }
        />
        {tournament.entryFee > 0 && (
          <Row
            icon="cash-outline"
            label="Entry"
            value={`₹${Number(tournament.entryFee).toLocaleString("en-IN")}`}
          />
        )}
      </View>

      {/*
      | The commitment, in plain numbers. "18 matches over 7 rounds" is
      | what a captain is actually being asked to agree to, and it is the
      | one thing a tournament name does not tell them.
      */}

      <View style={styles.commitCard}>
        <Text style={styles.commitTitle}>KITNA COMMITMENT HAI</Text>

        <Text style={styles.commitBig}>
          {preview ? `${preview.matches} matches` : "—"}
          {preview ? (
            <Text style={styles.commitSmall}>  ·  {preview.rounds} rounds</Text>
          ) : null}
        </Text>

        <Text style={styles.commitNote}>
          Tumhari team ke liye lagbhag {matchesPerTeam}.
        </Text>
      </View>

      <PrizeList prizes={tournament.prizes} prizePool={tournament.prizePool} />

      {!!tournament.description && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>RULES & DETAILS</Text>
          <Text style={styles.description}>{tournament.description}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ACCEPT KARNE KE BAAD</Text>

        <Text style={styles.bullet}>
          • 15 se 20 players ki squad register karni hogi — is tournament
          mein sirf wahi khel sakenge.
        </Text>

        <Text style={styles.bullet}>
          • Organizer teams lock karke schedule banayega. Uske baad team
          nikalna walkover ban jaata hai.
        </Text>

        <Text style={styles.bullet}>
          • Har match ke stats players ke career mein bhi jayenge.
        </Text>
      </View>

      {already ? (
        <View style={styles.doneCard}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
          <Text style={styles.doneText}>
            Is invite ka jawab de diya gaya hai.
          </Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => respond(true)}
            disabled={!!answering}
            activeOpacity={0.85}
          >
            {answering === "accept" ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <Text style={styles.acceptText}>Accept & register squad</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => respond(false)}
            disabled={!!answering}
            activeOpacity={0.85}
          >
            {answering === "decline" ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Text style={styles.declineText}>Nahi khel sakte</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  content: { padding: 16, paddingBottom: 44, gap: 13 },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 8,
    backgroundColor: COLORS.background,
  },

  emptyTitle: {
    marginTop: 6,
    fontSize: 15.5,
    fontWeight: "800",
    color: COLORS.onSurface,
    textAlign: "center",
  },

  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },

  cardTitle: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.onPrimary,
  },

  heading: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  tournamentName: {
    marginTop: 3,
    marginBottom: 12,
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  rowLabel: {
    width: 74,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  rowValue: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  commitCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 16,
    padding: 16,
  },

  commitTitle: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1,
    color: "rgba(255,255,255,0.75)",
  },

  commitBig: {
    marginTop: 6,
    fontSize: 23,
    fontWeight: "800",
    color: "#ffffff",
  },

  commitSmall: { fontSize: 14, fontWeight: "600" },

  commitNote: {
    marginTop: 5,
    fontSize: 12.5,
    color: "rgba(255,255,255,0.85)",
  },

  description: { fontSize: 13.5, lineHeight: 21, color: COLORS.onSurface },

  bullet: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.onSurface,
    marginBottom: 7,
  },

  actions: { gap: 10 },

  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  acceptText: { fontSize: 14.5, fontWeight: "800", color: COLORS.onPrimary },

  declineButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  declineText: { fontSize: 13.5, fontWeight: "700", color: COLORS.error },

  doneCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#F1F7EF",
    borderRadius: 13,
    padding: 15,
  },

  doneText: { flex: 1, fontSize: 13, fontWeight: "700", color: COLORS.primary },
});
