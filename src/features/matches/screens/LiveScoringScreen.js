import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";

import {
  ScrollView,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";

import MatchHeader from "../../../components/matches/LiveScoringScreen/MatchHeader";
import ChaseStats from "../../../components/matches/LiveScoringScreen/ChaseStats";
import PlayerStats from "../../../components/matches/LiveScoringScreen/PlayerStats";
import ScoringPad from "../../../components/matches/LiveScoringScreen/ScoringPad";
import MatchControls from "../../../components/matches/LiveScoringScreen/MatchControls";
import CommentarySection from "../../../components/matches/LiveScoringScreen/CommentarySection";
import { consumePendingBallResult } from "./WagonWheelModal";
import useScoring from "../../scoring/hooks/useScoring";
import {
  getMatchByIdApi,
  transferScoringApi,
} from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

const normalizePlayer = (p) =>
  p?.player && typeof p.player === "object" ? p.player : p;

export default function LiveScoringScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    matchId,
    inningsId,
    battingSquad = [],
    bowlingSquad = [],
    target,
  } = route.params || {};

  const {
    currentInnings,
    balls,
    loading,
    getInningsScorecard,
    addBall,
    setNextBowler,
    undoLastBall,
    endInnings,
  } = useScoring();

  /*
  |--------------------------------------------------------------------------
  | Local State
  |--------------------------------------------------------------------------
  */

  const [extraPicker, setExtraPicker] = useState(null);
  const [nextBowlerPicker, setNextBowlerPicker] = useState(false);
  const [pendingBowlerId, setPendingBowlerId] = useState(null);
  const [totalOvers, setTotalOvers] = useState(20);
  const [transferPicker, setTransferPicker] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [match, setMatch] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | FIX: ballsRef — always the freshest ball list
  |--------------------------------------------------------------------------
  */

  const ballsRef = useRef(balls);

  useEffect(() => {
    ballsRef.current = balls;
  }, [balls]);

  /*
  |--------------------------------------------------------------------------
  | FIX: consumedBallResultRef — guards against re-processing the same
  | __ballResult handed back via route params (WagonWheelModal /
  | WicketDismissalModal navigate back to this screen by name).
  |--------------------------------------------------------------------------
  */

  const consumedBallResultRef = useRef(null);

  useEffect(() => {
    if (!matchId) return;

    getMatchByIdApi(matchId)
      .then((data) => {
        console.log("[LiveScoring] getMatchByIdApi resolved", {
          overs: data?.overs,
          teamA: data?.teamA?.teamName,
          teamB: data?.teamB?.teamName,
          teamASquadLen: data?.teamASquad?.length,
          teamBSquadLen: data?.teamBSquad?.length,
        });
        setMatch(data);
        setTotalOvers(data?.overs || 20);
      })
      .catch((e) => {
        console.log("[LiveScoring] getMatchByIdApi FAILED", e?.message);
      });
  }, [matchId]);

  const loadInnings = useCallback(() => {
    console.log("[LiveScoring] loadInnings called", { inningsId });
    if (inningsId) getInningsScorecard(inningsId);
  }, [inningsId, getInningsScorecard]);

  useFocusEffect(
    useCallback(() => {
      loadInnings();
    }, [loadInnings]),
  );

  /*
  |--------------------------------------------------------------------------
  | Derived Display State
  |--------------------------------------------------------------------------
  */

  const regionName = (angle) => {
    if (angle == null) return "";
    const REGIONS = [
      { max: 22.5, name: "Long On" },
      { max: 67.5, name: "Mid Wicket" },
      { max: 112.5, name: "Square Leg" },
      { max: 157.5, name: "Fine Leg" },
      { max: 202.5, name: "Third Man" },
      { max: 247.5, name: "Point" },
      { max: 292.5, name: "Cover" },
      { max: 337.5, name: "Long Off" },
      { max: 360.01, name: "Long On" },
    ];
    const r = REGIONS.find((x) => angle <= x.max);
    return r ? r.name : "Long On";
  };

  const commentaryText = (b) => {
    if (b.commentaryText) return b.commentaryText;

    const batsman = resolvePlayerName(b.batsmanId, battingSquad);
    const bowler = resolvePlayerName(b.bowlerId, bowlingSquad);
    const region = regionName(b.wagonWheel?.angle);
    const shot = b.shotType || "plays a shot";

    // ── Wickets ───────────────────────────────────────────────────
    if (b.isWicket) {
      const rawType = b.wicketType || "Dismissal";
      // Normalize: "Caught (Name)" / "Run Out (Name)" / "LBW" → "caught" / "runout" / "lbw"
      const type = rawType
        .toLowerCase()
        .replace(/\(.*?\)/g, "")
        .replace(/\s+/g, "");

      // FIX: the fielder is a member of the FIELDING (bowling) team.
      const fielder = b.fielderId
        ? resolvePlayerName(b.fielderId, bowlingSquad)
        : null;

      if (type === "caught" && fielder) {
        return `OUT! **${batsman}** is caught by **${fielder}** off the bowling of **${bowler}**.`;
      }
      if (type === "runout" && fielder) {
        return `OUT! **${batsman}** is run out by **${fielder}**. What a direct hit!`;
      }
      if (type === "stumped" && fielder) {
        return `OUT! **${batsman}** is stumped by **${fielder}** off **${bowler}**.`;
      }
      if (type === "lbw") {
        return `OUT! **${batsman}** is trapped LBW by **${bowler}**.`;
      }
      if (type === "bowled") {
        return `OUT! **${bowler}** bowls **${batsman}**! Timber!`;
      }
      return `OUT! **${batsman}** is dismissed — ${rawType}. Bowled by **${bowler}**.`;
    }

    // ── Extras ────────────────────────────────────────────────────
    if (b.extraType === "wide") {
      return `**WIDE** bowled by **${bowler}**${b.runs ? `, ${b.runs} run${b.runs !== 1 ? "s" : ""} added` : ""}.`;
    }
    if (b.extraType === "noBall") {
      return `**NO BALL** by **${bowler}**${b.runs ? `, **${batsman}** helps himself to ${b.runs} run${b.runs !== 1 ? "s" : ""}` : ""}. Free hit coming up!`;
    }
    if (b.extraType === "bye") {
      return `**BYE** — ${b.runs} run${b.runs !== 1 ? "s" : ""} taken. The keeper misses it.`;
    }
    if (b.extraType === "legBye") {
      return `**LEG BYE** — ${b.runs} run${b.runs !== 1 ? "s" : ""} off the pads.`;
    }

    // ── Runs off the bat ──────────────────────────────────────────
    if (b.runs === 0) {
      return `Dot ball. **${bowler}** to **${batsman}**, no run.`;
    }
    if (b.runs === 4) {
      return `**FOUR!** **${batsman}** ${shot} to ${region}. Lovely timing!`;
    }
    if (b.runs === 6) {
      return `**SIX!** **${batsman}** launches it over ${region}. That's huge!`;
    }
    return `**${b.runs} run${b.runs !== 1 ? "s" : ""}** — **${batsman}** ${shot} to ${region}.`;
  };

  const overs = currentInnings
    ? `${Math.floor(currentInnings.balls / 6)}.${currentInnings.balls % 6}`
    : "0.0";

  const currentRunRate =
    currentInnings?.balls > 0
      ? (currentInnings.totalRuns / (currentInnings.balls / 6)).toFixed(2)
      : 0;

  // Combined pool from route params + the match squads LiveScoringScreen loads itself.
  const squadPool = useMemo(
    () => [
      ...battingSquad,
      ...bowlingSquad,
      ...(match?.teamASquad || []).map(normalizePlayer),
      ...(match?.teamBSquad || []).map(normalizePlayer),
    ],
    [battingSquad, bowlingSquad, match],
  );

  const resolvePlayerName = useCallback(
    (player, squad) => {
      if (!player) return "Select Player";

      // Populated object from the backend — has playerName directly.
      if (typeof player === "object" && player.playerName) {
        return player.playerName;
      }

      // Raw ObjectId string — look it up in the squad, then the match pool.
      const id = player?._id || player;
      const pool = squad?.length ? squad : squadPool;
      return (
        pool.find((p) => String(p._id) === String(id))?.playerName ||
        "Select Player"
      );
    },
    [squadPool],
  );

  const strikerName = resolvePlayerName(
    currentInnings?.currentStrikerId,
    battingSquad,
  );
  const nonStrikerName = resolvePlayerName(
    currentInnings?.currentNonStrikerId,
    battingSquad,
  );
  const bowlerName = resolvePlayerName(
    currentInnings?.currentBowlerId,
    bowlingSquad,
  );

  /*
  |--------------------------------------------------------------------------
  | FIX: transferTargets — robust + deduped
  |--------------------------------------------------------------------------
  */

  const transferTargets = (() => {
    const seen = new Set();
    const all = [
      ...(match?.teamASquad || []),
      ...(match?.teamBSquad || []),
      ...battingSquad,
      ...bowlingSquad,
    ];

    return all.filter((p) => {
      if (!p?.userId) return false;
      const key = String(p.userId);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  /*
  |--------------------------------------------------------------------------
  | Live Player Figures (derived from ball log)
  |--------------------------------------------------------------------------
  */

  const battingFigures = (playerId) => {
    const playerBalls = ballsRef.current.filter(
      (b) => (b.batsmanId?._id || b.batsmanId) === playerId,
    );

    return {
      runs: playerBalls.reduce(
        (sum, b) =>
          sum +
          (b.extraType === "bye" || b.extraType === "legBye" ? 0 : b.runs || 0),
        0,
      ),
      balls: playerBalls.filter((b) => b.extraType !== "wide").length,
    };
  };

  const bowlingFigures = (playerId) => {
    const playerBalls = ballsRef.current.filter(
      (b) => (b.bowlerId?._id || b.bowlerId) === playerId,
    );

    const legalBalls = playerBalls.filter(
      (b) => b.isLegalDelivery !== false,
    ).length;
    const runsConceded = playerBalls.reduce(
      (sum, b) => sum + (b.teamRuns ?? b.runs ?? 0),
      0,
    );
    const wicketsTaken = playerBalls.filter((b) => b.isWicket).length;

    return {
      figures: `${Math.floor(legalBalls / 6)}.${legalBalls % 6}-${runsConceded}-${wicketsTaken}`,
    };
  };

  const commentary = ballsRef.current
    .slice()
    .reverse()
    .map((b) => ({ over: `${b.over}.${b.ball}`, text: commentaryText(b) }));

  /*
  |--------------------------------------------------------------------------
  | ID Helpers
  |--------------------------------------------------------------------------
  */

  const strikerId = () =>
    currentInnings?.currentStrikerId?._id || currentInnings?.currentStrikerId;

  const nonStrikerId = () =>
    currentInnings?.currentNonStrikerId?._id ||
    currentInnings?.currentNonStrikerId;

  const bowlerId = () =>
    currentInnings?.currentBowlerId?._id || currentInnings?.currentBowlerId;

  /*
  |--------------------------------------------------------------------------
  | Bowler quota helpers (cricket rule: max overs per bowler)
  |--------------------------------------------------------------------------
  */

  const oversBowledBy = (playerId) => {
    const bowlerBalls = ballsRef.current.filter(
      (b) =>
        (b.bowlerId?._id || b.bowlerId) === playerId &&
        b.isLegalDelivery !== false,
    );
    return bowlerBalls.length / 6;
  };

  const maxOversPerBowler = Math.floor(totalOvers / 5); // 4 in T20, 10 in 50-over

  /*
  |--------------------------------------------------------------------------
  | afterBall — runs after EVERY delivered ball
  |--------------------------------------------------------------------------
  */

  const afterBall = useCallback(
    async (result) => {
      console.log("[afterBall] ENTERED", {
        success: result?.success,
        error: result?.error,
        data: result?.data,
      });

      if (!result.success) {
        Alert.alert("Failed", result.error || "Could not record that ball.");
        return;
      }

      const updatedInnings = result.data.innings;
      const lastBall = result.data.ball;

      const totalBalls = totalOvers * 6;

      // ── Condition 1: Target achieved (2nd innings only) ────────────────
      const isTargetAchieved =
        target != null && updatedInnings.totalRuns >= target;

      console.log("[afterBall] conditions", {
        isTargetAchieved,
        target,
        totalRuns: updatedInnings.totalRuns,
        wickets: updatedInnings.wickets,
        balls: updatedInnings.balls,
        totalBalls,
        overCompleted: result.data.overCompleted,
        battingSquadLen: battingSquad.length,
      });

      if (isTargetAchieved) {
        await endInnings(inningsId);
        navigation.navigate("MatchResultScreen", { matchId });
        return;
      }

      // ── Condition 2 & 3: All out or overs complete ────────────────────
      const isAllOut =
        battingSquad.length > 0 &&
        updatedInnings.wickets >= battingSquad.length - 1;
      const isOversComplete = updatedInnings.balls >= totalBalls;

      if (isAllOut || isOversComplete) {
        await endInnings(inningsId);

        navigation.navigate("InningsSummaryScreen", {
          matchId,
          inningsId,
          battingSquad,
          bowlingSquad,
          target,
          battingTeamId: updatedInnings.battingTeam,
          bowlingTeamId: updatedInnings.bowlingTeam,
        });

        return;
      }

      // ── Over completed (not innings-end) ─────────────────────────────
      if (result.data.overCompleted) {
        console.log(
          "[afterBall] OVER COMPLETED — navigating to OverSummaryScreen",
        );

        const overBalls = (() => {
          const current = ballsRef.current;
          const inOver = current.filter((b) => b.over === lastBall.over);
          const hasLast = inOver.some((b) => b._id === lastBall._id);
          return hasLast ? inOver : [...inOver, lastBall];
        })();

        const figuresFor = (player) => {
          const playerId = player?._id || player;
          const playerBalls = ballsRef.current.filter(
            (b) => (b.batsmanId?._id || b.batsmanId) === playerId,
          );

          return {
            playerName: resolvePlayerName(player, battingSquad),
            runs: playerBalls.reduce(
              (sum, b) =>
                sum +
                (b.extraType === "bye" || b.extraType === "legBye"
                  ? 0
                  : b.runs || 0),
              0,
            ),
            balls: playerBalls.filter((b) => b.extraType !== "wide").length,
          };
        };

        const bowlerFigures = (() => {
          const currentBowler = updatedInnings.currentBowlerId;
          const currentBowlerId = currentBowler?._id || currentBowler;
          const bowlerBalls = ballsRef.current.filter(
            (b) => (b.bowlerId?._id || b.bowlerId) === currentBowlerId,
          );
          const legalBalls = bowlerBalls.filter(
            (b) => b.isLegalDelivery !== false,
          ).length;

          const maidenOvers = (() => {
            const byOver = {};
            bowlerBalls.forEach((b) => {
              byOver[b.over] =
                (byOver[b.over] || 0) + (b.teamRuns ?? b.runs ?? 0);
            });
            return Object.values(byOver).filter((r) => r === 0).length;
          })();

          return {
            playerName: resolvePlayerName(currentBowler, bowlingSquad),
            overs: `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`,
            maidens: maidenOvers,
            runs: bowlerBalls.reduce(
              (sum, b) => sum + (b.teamRuns ?? b.runs ?? 0),
              0,
            ),
            wickets: bowlerBalls.filter((b) => b.isWicket).length,
          };
        })();

        const ballsUsed = updatedInnings.balls;
        const ballsLeft = Math.max(0, totalBalls - ballsUsed);

        // ── Bowling team squad for the next-bowler picker ─────────────
        const bowlingTeamId =
          updatedInnings.bowlingTeam?._id || updatedInnings.bowlingTeam;
        const teamAId = match?.teamA?._id;
        const rawPool =
          bowlingTeamId && teamAId && String(bowlingTeamId) === String(teamAId)
            ? match?.teamASquad || []
            : match?.teamBSquad || [];
        const bowlingPool = (rawPool.length ? rawPool : bowlingSquad).map(
          normalizePlayer,
        );

        console.log("[afterBall] bowlingPool for picker", {
          bowlingTeamId,
          teamAId,
          rawPoolLen: rawPool.length,
          bowlingPoolLen: bowlingPool.length,
          bowlingPoolNames: bowlingPool.map((p) => p.playerName),
        });

        // Bowler who just finished the over (from the last ball).
        const lastBowlerId = lastBall.bowlerId?._id || lastBall.bowlerId;

        // Overs bowled by each player (in balls), for quota filtering.
        const oversBowledByMap = {};
        ballsRef.current.forEach((b) => {
          const pid = b.bowlerId?._id || b.bowlerId;
          if (pid && b.isLegalDelivery !== false) {
            oversBowledByMap[pid] = (oversBowledByMap[pid] || 0) + 1;
          }
        });

        navigation.navigate("OverSummaryScreen", {
          score: updatedInnings.totalRuns,
          wickets: updatedInnings.wickets,
          overs: `${Math.floor(ballsUsed / 6)}.${ballsUsed % 6}`,
          currentRunRate:
            ballsUsed > 0
              ? (updatedInnings.totalRuns / (ballsUsed / 6)).toFixed(2)
              : "0.00",
          target,
          requiredRunRate:
            target != null && ballsLeft > 0
              ? (
                  Math.max(target - updatedInnings.totalRuns, 0) /
                  (ballsLeft / 6)
                ).toFixed(2)
              : undefined,
          overBalls,
          striker: figuresFor(updatedInnings.currentStrikerId),
          nonStriker: figuresFor(updatedInnings.currentNonStrikerId),
          bowler: bowlerFigures,
          // ── New: next-bowler selection data ──────────────────────
          matchId,
          inningsId,
          bowlingPool,
          lastBowlerId,
          maxOversPerBowler: Math.floor(totalOvers / 5),
          oversBowledBy: oversBowledByMap,
        });
      } else {
        console.log(
          "[afterBall] ball recorded, no over-complete. balls now:",
          updatedInnings.balls,
        );
      }
    },
    [
      inningsId,
      matchId,
      battingSquad,
      bowlingSquad,
      target,
      totalOvers,
      endInnings,
      navigation,
      match,
      resolvePlayerName,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | __ballResult relay
  |--------------------------------------------------------------------------
  |
  | FIX: WagonWheelModal and WicketDismissalModal both navigate back to this
  | screen BY NAME with { __ballResult: result }. We consume it here (guarded
  | by a ref so the same result is never processed twice), and keep the legacy
  | module-variable handoff as a fallback.
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      const paramResult = route.params?.__ballResult;

      if (paramResult && consumedBallResultRef.current !== paramResult) {
        consumedBallResultRef.current = paramResult;
        console.log("[LiveScoring] consuming __ballResult", paramResult);
        afterBall(paramResult);
        return;
      }

      const pending = consumePendingBallResult();
      if (pending) {
        console.log("[LiveScoring] consuming pendingBallResult", pending);
        afterBall(pending);
      }
    }, [afterBall, route.params?.__ballResult]),
  );

  /*
  |--------------------------------------------------------------------------
  | Handlers
  |--------------------------------------------------------------------------
  */

  const handleRun = async (runs) => {
    console.log("[LiveScoring] handleRun", {
      runs,
      striker: strikerId(),
      bowler: bowlerId(),
    });

    if (!strikerId() || !bowlerId()) {
      Alert.alert(
        "Select Players",
        "Set the current striker and bowler first.",
      );
      return;
    }

    if (runs === 0) {
      const result = await addBall({
        matchId,
        inningsId,
        batsmanId: strikerId(),
        bowlerId: bowlerId(),
        runs: 0,
      });

      console.log("[LiveScoring] addBall (dot) result", result);
      afterBall(result);
      return;
    }

    navigation.navigate("ShotSelectionModal", {
      matchId,
      inningsId,
      runs,
      batsmanId: strikerId(),
      bowlerId: bowlerId(),
    });
  };

  const handleExtraRuns = async (runs) => {
    const extraType = extraPicker;
    setExtraPicker(null);

    console.log("[LiveScoring] handleExtraRuns", { runs, extraType });

    const result = await addBall({
      matchId,
      inningsId,
      batsmanId: strikerId(),
      bowlerId: bowlerId(),
      runs,
      extraType,
      isFreeHit: extraType === "noBall",
    });

    console.log("[LiveScoring] addBall (extra) result", result);
    afterBall(result);
  };

  const handleWicket = () => {
    console.log("[LiveScoring] handleWicket");
    navigation.navigate("WicketDismissalModal", {
      matchId,
      inningsId,
      strikerId: strikerId(),
      nonStrikerId: nonStrikerId(),
      bowlerId: bowlerId(),
      battingSquad,
      bowlingSquad,
    });
  };

  const handleConfirmNextBowler = async () => {
    console.log("[LiveScoring] handleConfirmNextBowler", { pendingBowlerId });

    if (!pendingBowlerId) return;

    const chosenBowlerId = pendingBowlerId;

    setNextBowlerPicker(false);
    setPendingBowlerId(null);

    const result = await setNextBowler(inningsId, chosenBowlerId);

    console.log("[LiveScoring] setNextBowler result", result);

    if (!result.success) {
      Alert.alert("Failed", result.error || "Could not set the next bowler.");
      return;
    }

    loadInnings();
  };

  const handleUndo = () => {
    Alert.alert(
      "Undo Last Ball",
      "Remove the most recent ball from the scorecard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Undo",
          style: "destructive",
          onPress: async () => {
            const result = await undoLastBall(inningsId);
            console.log("[LiveScoring] undoLastBall result", result);

            if (!result.success) {
              Alert.alert("Failed", result.error || "Nothing to undo.");
            }
          },
        },
      ],
    );
  };

  const handleTransfer = async (targetUserId) => {
    setTransferring(true);
    try {
      const result = await transferScoringApi(matchId, targetUserId);
      setTransferPicker(false);
      Alert.alert(
        "Scoring Transferred",
        `Scoring is now with ${result?.scorerName || "the new scorer"}.`,
      );
    } catch (e) {
      Alert.alert(
        "Failed",
        e?.response?.data?.message || "Could not transfer scoring.",
      );
    } finally {
      setTransferring(false);
    }
  };

  // The team currently bowling → its squad, for the next-bowler picker.
  const bowlingPool = (() => {
    const bowlingTeamId =
      currentInnings?.bowlingTeam?._id || currentInnings?.bowlingTeam;
    const teamAId = match?.teamA?._id;
    const raw =
      bowlingTeamId && teamAId && String(bowlingTeamId) === String(teamAId)
        ? match?.teamASquad || []
        : match?.teamBSquad || [];
    const pool = raw.length ? raw : bowlingSquad;
    return pool.map(normalizePlayer);
  })();

  /*
  |--------------------------------------------------------------------------
  | Loader
  |--------------------------------------------------------------------------
  */

  if (loading && !currentInnings) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <MatchHeader
        teamAName={match?.teamA?.teamName}
        teamBName={match?.teamB?.teamName}
        inningsNumber={currentInnings?.inningsNumber}
        score={currentInnings?.totalRuns || 0}
        wickets={currentInnings?.wickets || 0}
        overs={overs}
        target={target}
      />

      {target != null && (
        <ChaseStats
          target={target}
          currentRuns={currentInnings?.totalRuns || 0}
          ballsRemaining={Math.max(
            0,
            totalOvers * 6 - (currentInnings?.balls || 0),
          )}
          currentRunRate={currentRunRate}
        />
      )}

      <PlayerStats
        striker={{ name: strikerName, ...battingFigures(strikerId()) }}
        nonStriker={{ name: nonStrikerName, ...battingFigures(nonStrikerId()) }}
        bowler={{ name: bowlerName, ...bowlingFigures(bowlerId()) }}
      />

      <ScoringPad
        onRun={handleRun}
        onWicket={handleWicket}
        onExtra={(type) => setExtraPicker(type)}
      />

      <MatchControls
        onUndo={handleUndo}
        onTransfer={() => setTransferPicker(true)}
        canUndo={ballsRef.current.length > 0}
      />

      <TouchableOpacity
        style={styles.nextBowlerButton}
        onPress={() => setNextBowlerPicker(true)}
      >
        <Text style={styles.nextBowlerButtonText}>Change Bowler</Text>
      </TouchableOpacity>

      <CommentarySection commentary={commentary} />

      {/* ── Extra Runs Picker ─────────────────────────────────────── */}

      <Modal visible={!!extraPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {extraPicker === "wide" && "Wide — Runs"}
              {extraPicker === "noBall" && "No Ball — Runs Off The Bat"}
              {extraPicker === "bye" && "Bye — Runs"}
              {extraPicker === "legBye" && "Leg Bye — Runs"}
            </Text>

            <View style={styles.chipRow}>
              {[0, 1, 2, 3, 4].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={styles.chip}
                  onPress={() => handleExtraRuns(n)}
                >
                  <Text style={styles.chipText}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => setExtraPicker(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Next Bowler Picker ───────────────────────────────────── */}

      <Modal visible={nextBowlerPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Over Complete — New Bowler</Text>

            <ScrollView style={styles.liveMaxer}>
              {bowlingPool
                .filter((p) => {
                  const lastBowlerId =
                    currentInnings?.currentBowlerId?._id ||
                    currentInnings?.currentBowlerId;
                  const atLimit = oversBowledBy(p._id) >= maxOversPerBowler;
                  return String(p._id) !== String(lastBowlerId) && !atLimit;
                })
                .map((player) => (
                  <TouchableOpacity
                    key={player._id}
                    style={[
                      styles.playerRow,
                      pendingBowlerId === player._id &&
                        styles.playerRowSelected,
                    ]}
                    onPress={() => setPendingBowlerId(player._id)}
                  >
                    <Text style={styles.playerRowText}>
                      {player.playerName}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !pendingBowlerId && styles.confirmButtonDisabled,
              ]}
              disabled={!pendingBowlerId}
              onPress={handleConfirmNextBowler}
            >
              <Text style={styles.confirmButtonText}>Confirm Bowler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Transfer Scoring Picker ─────────────────────────────── */}

      <Modal visible={transferPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Transfer Scoring To</Text>

            {transferTargets.length === 0 ? (
              <Text style={styles.cancelText}>
                No registered players available to transfer to.
              </Text>
            ) : (
              <ScrollView style={styles.liveMaxer}>
                {transferTargets.map((player) => (
                  <TouchableOpacity
                    key={player._id}
                    style={styles.playerRow}
                    disabled={transferring}
                    onPress={() => handleTransfer(player.userId)}
                  >
                    <Text style={styles.playerRowText}>
                      {player.playerName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity onPress={() => setTransferPicker(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  liveMaxer: {
    maxHeight: 300,
  },

  scrollContent: {
    padding: 16,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
  },

  modalCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 16,
  },

  chipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  chip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  chipText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  cancelText: {
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
    paddingVertical: 8,
  },

  playerRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  playerRowSelected: {
    backgroundColor: COLORS.surfaceContainer,
  },

  playerRowText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.onSurface,
  },

  confirmButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  confirmButtonDisabled: {
    opacity: 0.5,
  },

  confirmButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
  },

  nextBowlerButton: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },

  nextBowlerButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
