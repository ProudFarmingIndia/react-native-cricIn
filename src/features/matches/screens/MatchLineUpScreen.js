import React, { useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import { createInningsApi } from "../../scoring/services/scoring.service";
import { startMatchApi, getMatchByIdApi } from "../services/matches.services";

import MatchPinGate from "../../../components/matches/MatchPinGate";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Match Line-Up Screen (Opening Pair + Bowler Selection)
|--------------------------------------------------------------------------
|
| Expects via route.params: matchId, battingTeam, bowlingTeam (each with
| a .squad array of the selected Playing XI, from TossScreen).
|
| NOTHING FROM THE SETUP HAS BEEN SAVED YET. Squad Selection and Toss
| carry their choices forward in params rather than writing them, so this
| screen holds the entire setup and hands it to startMatch with the PIN.
|
| On the correct PIN the server writes the squads, the toss and the live
| status in one operation, and only then is the first Innings created with
| the chosen openers. A wrong PIN writes nothing at all, so the opposing
| captain starting later gets a genuinely clean slate.
|
| HOW MANY PINs
| One per team the starter does NOT captain. The server decides that and
| sends the list as `pinsRequired` on the match; this screen renders it.
|
|   Captain of one side    one PIN - the opponent's
|   Captain of neither     TWO PINs, one from each captain
|
| The second case is the TOURNAMENT AND SERIES ORGANIZER. They run the
| fixture and captain neither side, so starting it means collecting a PIN
| from each captain - which is right: an organizer who could start a match
| alone could start it while one team was still travelling.
|
| This screen used to collect exactly one PIN and send it as a flat `pin`.
| For an organizer that could never succeed - the server wanted two and was
| handed one - so a tournament match could not be started at all.
*/

export default function MatchLineupScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  /*
  | The setup arrives in params rather than from the Match record, because
  | none of it has been saved yet - Squad Selection and Toss deliberately
  | write nothing. It is handed to startMatch below, behind the PIN.
  */

  const {
    matchId,
    battingTeam,
    bowlingTeam,
    teamASquad = [],
    teamBSquad = [],
    tossWinner,
    tossDecision,
  } = route.params || {};

  const battingSquad = battingTeam?.squad || [];
  const bowlingSquad = bowlingTeam?.squad || [];

  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [openingBowler, setOpeningBowler] = useState(null);
  const [starting, setStarting] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState("");

  /*
  | Which PINs to ask for, from the server. Never derived here - the rule
  | lives in one place on the server and this screen renders its answer, so
  | what is asked for and what is checked cannot disagree.
  |
  | Empty array is a real answer too: somebody who captains BOTH teams owes
  | nobody a PIN, and the gate is skipped entirely.
  */

  const [pinSides, setPinSides] = useState(null);

  const handleSelectBatter = (player) => {
    if (striker?._id === player._id) {
      setStriker(null);
      return;
    }

    if (nonStriker?._id === player._id) {
      setNonStriker(null);
      return;
    }

    if (!striker) {
      setStriker(player);
    } else if (!nonStriker) {
      setNonStriker(player);
    } else {
      Alert.alert("Both openers already selected. Tap one to change it.");
    }
  };

  const handleStartScoring = async () => {
    if (!striker) {
      Alert.alert("Select Striker");
      return;
    }
    if (!nonStriker) {
      Alert.alert("Select Non-Striker");
      return;
    }
    if (!openingBowler) {
      Alert.alert("Select Opening Bowler");
      return;
    }

    /*
    | Ask the server which PINs are needed, THEN open the gate. Nothing is
    | created until they are accepted, so a cancel or a wrong PIN leaves no
    | orphaned innings behind.
    |
    | Fetched at this moment rather than carried in route params because
    | the setup screens are slow - squads, then the toss - and a captain
    | can be added to a team in between. The answer has to be current at
    | the moment it is used.
    */

    setPinError("");

    try {
      setStarting(true);

      const match = await getMatchByIdApi(matchId);

      const sides = match?.pinsRequired || [];

      setPinSides(sides);

      /*
      | Nobody to prove anything to - they captain both sides. Start
      | straight away rather than opening an empty modal with a Start
      | button in it.
      */

      if (sides.length === 0) {
        await beginMatch({});

        return;
      }

      setShowPinModal(true);
    } catch (error) {
      Alert.alert(
        "Match load nahi hua",
        error.response?.data?.message ||
          error.message ||
          "Dobara try karo.",
      );
    } finally {
      setStarting(false);
    }
  };

  /*
  | `pins` is { teamA: "1234", teamB: "5678" } - only the keys the server
  | asked for. An empty object is the both-teams-captain case.
  */

  const beginMatch = async (pins) => {
    try {
      setStarting(true);

      /*
      | 1) THE PIN FIRST.
      |
      | This was the other way round, and the comment claimed it was
      | deliberate. It is the wrong order: a mistyped PIN - the most common
      | thing that happens on this screen - left a real innings behind in
      | the database for a match that never started.
      |
      | Nothing is written until the opponent's PIN is accepted.
      */

      await startMatchApi(
        matchId,
        /*
        | The flat `pin` is only meaningful when exactly one is required,
        | and the server ignores it otherwise. Sent for the single-PIN case
        | so older backends keep working; `pins` is what actually gates.
        */
        Object.keys(pins).length === 1 ? Object.values(pins)[0] : undefined,
        {
          teamASquad,
          teamBSquad,
          tossWinner,
          tossDecision,
        },
        pins,
      );

      /*
      | 2) Then the innings, with THIS captain's openers.
      |
      | Safe to call after: startMatch is idempotent for a match that is
      | already live, and createInnings updates the openers on an innings
      | that has not been bowled at yet rather than returning somebody
      | else's abandoned lineup.
      */

      const innings = await createInningsApi({
        matchId,
        battingTeam: battingTeam._id,
        bowlingTeam: bowlingTeam._id,
        inningsNumber: 1,
        currentStrikerId: striker._id,
        currentNonStrikerId: nonStriker._id,
        currentBowlerId: openingBowler._id,
      });

      setShowPinModal(false);
      navigation.replace("LiveScoringScreen", {
        matchId,
        inningsId: innings._id,
        battingSquad,
        bowlingSquad,
      });
    } catch (error) {
      /*
      | The server's message is the useful one - it NAMES the team whose
      | PIN was wrong ("Incorrect PIN for Sharma XI"), which is the whole
      | point when two PINs were typed. The generic line is only a
      | fallback.
      */

      const message =
        error.response?.data?.message ||
        error.message ||
        "Could not start the match. Try again.";

      setPinError(message);

      /*
      | With no PINs required the gate never opened, so there is nothing on
      | screen to show the error in. An Alert is the only way this person
      | hears about it.
      */

      if (Object.keys(pins).length === 0) {
        Alert.alert("Match start nahi hua", message);
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Match Setup</Text>

        <View style={styles.tossCard}>
          <Text style={styles.tossText}>
            {battingTeam?.teamName} to bat first
          </Text>

          <Text style={styles.tossSubtext}>vs {bowlingTeam?.teamName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Select Openers</Text>

          <View style={styles.slotRow}>
            <View style={styles.slot}>
              <Text style={styles.slotLabel}>STRIKER</Text>
              <Text style={styles.slotValue}>
                {striker?.playerName || "Not Selected"}
              </Text>
            </View>

            <View style={styles.slot}>
              <Text style={styles.slotLabel}>NON-STRIKER</Text>
              <Text style={styles.slotValue}>
                {nonStriker?.playerName || "Not Selected"}
              </Text>
            </View>
          </View>

          <Text style={styles.subheading}>Available Batters</Text>

          {battingSquad.map((player) => {
            const isSelected =
              striker?._id === player._id || nonStriker?._id === player._id;

            return (
              <TouchableOpacity
                key={player._id}
                style={[
                  styles.playerCard,
                  isSelected && styles.playerCardSelected,
                ]}
                onPress={() => handleSelectBatter(player)}
              >
                <Text style={styles.playerName}>{player.playerName}</Text>

                {isSelected && (
                  <Text style={styles.playerTag}>
                    {striker?._id === player._id ? "Striker" : "Non-Striker"}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Select Opening Bowler</Text>

          <Text style={styles.selectedText}>
            {openingBowler?.playerName || "Not Selected"}
          </Text>

          {bowlingSquad.map((player) => (
            <TouchableOpacity
              key={player._id}
              style={[
                styles.playerCard,
                openingBowler?._id === player._id && styles.playerCardSelected,
              ]}
              onPress={() => setOpeningBowler(player)}
            >
              <Text style={styles.playerName}>{player.playerName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={handleStartScoring}
        disabled={starting}
      >
        {starting ? (
          <ActivityIndicator size="small" color={COLORS.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Start Scoring</Text>
        )}
      </TouchableOpacity>

      {/*
      | The PIN gate. One input per team this person does not captain,
      | labelled with that team's real name - see MatchPinGate.
      |
      | `pinSides` comes from the server and is rendered as-is. For a
      | tournament or series organizer it holds BOTH teams, which is the
      | case this replaced: the old modal collected a single PIN and could
      | never satisfy a two-PIN gate.
      */}

      <MatchPinGate
        visible={showPinModal}
        sides={pinSides || []}
        loading={starting}
        error={pinError}
        onCancel={() => {
          setShowPinModal(false);

          setPinError("");
        }}
        onSubmit={beginMatch}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 140,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 16,
  },

  tossCard: {
    backgroundColor: COLORS.primaryContainer,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  tossText: {
    color: COLORS.onPrimaryContainer,
    fontWeight: "700",
  },

  tossSubtext: {
    color: COLORS.onPrimaryContainer,
    marginTop: 2,
  },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 12,
  },

  slotRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  slot: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 10,
    marginRight: 8,
  },

  slotLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  slotValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
    marginTop: 4,
  },

  subheading: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },

  playerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  playerCardSelected: {
    backgroundColor: COLORS.surfaceContainer,
  },

  playerName: {
    color: COLORS.onSurface,
    fontWeight: "600",
  },

  playerTag: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  selectedText: {
    marginBottom: 12,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  button: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 16,
  }
});
