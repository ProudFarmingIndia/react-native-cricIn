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
import { consumePendingBallResult } from "../utils/ballHandoff";
import { buildCommentaryLine } from "../utils/commentary";
import useScoring from "../../scoring/hooks/useScoring";
import {
  getMatchByIdApi,
  getLiveMatchApi,
  transferScoringApi,
} from "../services/matches.services";

import { COLORS } from "../../../constants/colors";

/*
| The scorer's way into camera control WITHOUT leaving the scoring pad.
|
| This matters more than it looks: the moments a camera needs attention -
| a phone dropping signal, a broadcaster who has not accepted, a rain
| break that will auto-end the stream - all happen while the scorer is on
| this screen with a ball to record. Making them navigate away to find out
| is how a stream quietly dies mid-match.
|
| Renders nothing when no camera is set up and this user cannot set one
| up, so a normal scoring session is untouched.
*/
import LiveStreamBanner from "../../liveStream/components/LiveStreamBanner";

const normalizePlayer = (p) =>
  p?.player && typeof p.player === "object" ? p.player : p;

export default function LiveScoringScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const paramTarget = route.params?.target;

  /*
  |--------------------------------------------------------------------------
  | Resolving The Match
  |--------------------------------------------------------------------------
  |
  | matchId was the LAST thing on this screen still read straight out of
  | route.params, and it is why Wide, No Ball, Bye, Leg Bye and Wicket all
  | stopped working after the first delivery:
  |
  |     [afterBall] ENTERED {"error": "Scoring validation failed:
  |                           matchId: Path `matchId` is required."}
  |     [ShotSelection] handleContinue {"inningsId": "6a95b6..."}
  |     WARN Missing match or innings
  |
  | WagonWheelModal and WicketDismissalModal return with
  | navigate("LiveScoringScreen") and NO params - deliberately, so they
  | cannot clobber the squads. But React Navigation 6 REPLACES params rather
  | than merging them, so that call does not leave the old params alone: it
  | sets them to undefined. Every other value on this screen already had its
  | own state or a fallback and survived. matchId did not, so from the ball
  | after the wagon wheel onwards:
  |
  |   - handleExtraRuns posted matchId: undefined -> server rejected it
  |   - handleWicket opened the dismissal sheet with no match
  |   - handleRun opened the shot sheet with no match, which then refused
  |     to continue - the Continue button simply did nothing
  |   - and after an Undo, the same, because Undo does not restore params
  |
  | The pad stayed on screen and looked completely alive throughout.
  |
  | It is now held in state exactly like the innings id: params are a hint
  | that seeds it, a later param wins, and nothing can blank it. The innings
  | itself is a second source - it knows its own match - so even a screen
  | that was somehow mounted with no params at all recovers.
  */

  const [resolvedMatchId, setResolvedMatchId] = useState(
    route.params?.matchId || null,
  );

  const matchId = resolvedMatchId;

  useEffect(() => {
    const fromParams = route.params?.matchId;

    if (fromParams && String(fromParams) !== String(resolvedMatchId)) {
      setResolvedMatchId(String(fromParams));
    }
  }, [route.params?.matchId, resolvedMatchId]);

  /*
  |--------------------------------------------------------------------------
  | Resolving The Innings
  |--------------------------------------------------------------------------
  |
  | THIS SCREEN NO LONGER TRUSTS route.params FOR THE INNINGS.
  |
  | It used to read inningsId straight out of params, and when that was
  | undefined every single thing on the screen quietly stopped:
  |
  |     [LiveScoring] loadInnings called {"inningsId": undefined}
  |     [ShotSelection] handleContinue {"inningsId": undefined, "runs": 6}
  |     WARN Missing match or innings
  |
  | ...and scoring was stuck with no way out but backing all the way to Home.
  |
  | There were two ways to get there:
  |
  |   BETWEEN INNINGS. The feed's currentInnings is the first innings that
  |   is NOT completed. The moment the first innings ends, that is null, so
  |   every card that opens this screen passed inningsId: undefined.
  |
  |   THE MODALS. WagonWheelModal and WicketDismissalModal come back with
  |   navigate("LiveScoringScreen") and no params at all - deliberately, so
  |   they cannot clobber the squads. Any navigation that landed on a fresh
  |   instance of this screen therefore had nothing.
  |
  | Params are now only a HINT. The screen holds its own resolved id and
  | asks the server for it whenever the hint is missing - which also means
  | it recovers by itself rather than needing the user to navigate away and
  | back.
  */

  const [resolvedInningsId, setResolvedInningsId] = useState(
    route.params?.inningsId || null,
  );

  const [resolvedTarget, setResolvedTarget] = useState(paramTarget);

  const [resolving, setResolving] = useState(false);

  const inningsId = resolvedInningsId;

  // A param arriving later (a fresh navigation with one) wins over a stale id.
  useEffect(() => {
    const fromParams = route.params?.inningsId;

    if (fromParams && fromParams !== resolvedInningsId) {
      setResolvedInningsId(fromParams);
    }
  }, [route.params?.inningsId, resolvedInningsId]);

  /*
  | Ask the server which innings is live on this match. getLiveMatch returns
  | the active one, so this is correct both for a first visit with no params
  | and for the moment a second innings opens.
  */

  useEffect(() => {
    if (inningsId || !matchId || resolving) return;

    let cancelled = false;

    setResolving(true);

    getLiveMatchApi(matchId)
      .then((live) => {
        if (cancelled || !live?.inningsId) return;

        setResolvedInningsId(String(live.inningsId));

        if (live.target != null) setResolvedTarget(live.target);
      })
      .catch(() => {
        /*
        | "No active innings found" is the honest answer between innings or
        | after the match ends - so ask the match itself where to go.
        |
        | This is what makes the innings break survivable. It used to be
        | reachable from exactly one place: the ball that ended the first
        | innings. Close the app at the break and there was no route back to
        | it from anywhere, and the match could never reach its chase.
        */

        if (cancelled) return;

        getMatchByIdApi(matchId)
          .then((m) => {
            if (cancelled || !m) return;

            if (m.status === "completed") {
              navigation.replace("MatchResultScreen", { matchId });
              return;
            }

            const brk = m.completedInnings;

            if (m.awaitingSecondInnings && brk) {
              navigation.replace("InningsSummaryScreen", {
                matchId,
                inningsId: String(brk.inningsId),
                battingSquad: [],
                bowlingSquad: [],
                battingTeamId: brk.battingTeamId,
                bowlingTeamId: brk.bowlingTeamId,
              });
            }
          })
          .catch(() => {});
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inningsId, matchId, resolving, navigation]);

  /*
  | The squads are read through useMemo rather than destructured with an
  | `= []` default.
  |
  | A bare default creates a NEW empty array on every render. That array
  | feeds squadPool -> resolvePlayerName -> afterBall -> the focus effect's
  | dependency list, so the effect re-ran on every render and fetched the
  | innings again - whose response re-rendered, which re-ran the effect. An
  | unbounded refetch loop, one request per response, for as long as the
  | screen was open.
  |
  | Memoising on the params themselves gives a stable identity when nothing
  | has actually changed.
  */

  const target = resolvedTarget;

  const paramBattingSquad = useMemo(
    () => route.params?.battingSquad || [],
    [route.params?.battingSquad],
  );

  const paramBowlingSquad = useMemo(
    () => route.params?.bowlingSquad || [],
    [route.params?.bowlingSquad],
  );

  const {
    currentInnings,
    balls,
    loading,
    getInningsScorecard,
    addBall,
    setNextBowler,
    /*
    | Already plumbed all the way through the slice and the service, but no
    | screen had ever destructured it - the incoming batter is sent inline
    | on the wicket ball instead. It is exactly the endpoint a correction
    | needs, so it is finally used here.
    */
    setNextBatsman,
    undoLastBall,
    endInnings,
  } = useScoring();

  /*
  | Second source for the match id: the innings knows which match it belongs
  | to. This only ever fires when params never arrived at all - a deep link,
  | a remount, a screen restored by the navigator - and it means the scoring
  | pad can no longer be left in a state where it renders but cannot record.
  */

  useEffect(() => {
    if (resolvedMatchId) return;

    const fromInnings =
      currentInnings?.matchId?._id || currentInnings?.matchId;

    if (fromInnings) setResolvedMatchId(String(fromInnings));
  }, [resolvedMatchId, currentInnings]);

  /*
  | A target arriving on a fresh navigation wins, the same way a fresh
  | inningsId does - otherwise a screen that already held the first innings'
  | state would show the second innings without its chase.
  */

  useEffect(() => {
    if (paramTarget != null && paramTarget !== resolvedTarget) {
      setResolvedTarget(paramTarget);
    }
  }, [paramTarget, resolvedTarget]);

  const [extraPicker, setExtraPicker] = useState(null);
  const [penaltyPicker, setPenaltyPicker] = useState(false);
  const [nextBowlerPicker, setNextBowlerPicker] = useState(false);
  const [pendingBowlerId, setPendingBowlerId] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Changing a batter
  |--------------------------------------------------------------------------
  |
  | Which end the scorer tapped ("striker" | "nonStriker"), or null when the
  | sheet is closed, plus the replacement they have picked.
  */
  const [batsmanPicker, setBatsmanPicker] = useState(null);
  const [pendingBatsmanId, setPendingBatsmanId] = useState(null);
  const [totalOvers, setTotalOvers] = useState(20);
  const [transferPicker, setTransferPicker] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [match, setMatch] = useState(null);
  

  /*
  | `balls` is the render-time truth; ballsRef exists only so callbacks that
  | are not re-created (afterBall) can read the latest list.
  |
  | The ref used to be the source for the commentary, the batting and
  | bowling figures and the undo button too - all read during render. A ref
  | assigned in an effect is one render BEHIND, so opening the screen on a
  | match already in progress showed the right score above an empty
  | commentary panel, both batters on 0 (0), and a disabled Undo, until some
  | unrelated state change forced a second render.
  |
  | Assigning during render keeps the ref current for the callbacks without
  | waiting for the effect to run.
  */

  const ballsRef = useRef(balls);

  ballsRef.current = balls;

  // Everything rendered reads this, never the ref.
  const ballList = balls || [];

  const loadInnings = useCallback(() => {
    console.log("[LiveScoring] loadInnings called", { inningsId });
    if (inningsId) getInningsScorecard(inningsId);
  }, [inningsId, getInningsScorecard]);

  useEffect(() => {
    if (!matchId) return;

    getMatchByIdApi(matchId)
      .then((data) => {
        setMatch(data);
        setTotalOvers(data?.overs || 20);
      })
      .catch((e) => {
        console.log("[LiveScoring] getMatchByIdApi FAILED", e?.message);
      });
  }, [matchId]);

  /*
  |--------------------------------------------------------------------------
  | The Two Squads
  |--------------------------------------------------------------------------
  |
  | Params are a hint here too, for the same reason as the innings id: the
  | modals come back without them, and a card opened between innings never
  | had them.
  |
  | When the hint is empty the squads are derived from the match and the
  | innings' own battingTeam - both already loaded. That matters more than
  | it looks: handleWicket hands battingSquad and bowlingSquad to the
  | dismissal modal, and with empty arrays that modal shows "No players
  | available" and no wicket can be recorded for the rest of the innings.
  */

  const inningsBattingTeamId = String(
    currentInnings?.battingTeam?._id || currentInnings?.battingTeam || "",
  );

  const matchSquads = useMemo(() => {
    const teamA = (match?.teamASquad || []).map(normalizePlayer);
    const teamB = (match?.teamBSquad || []).map(normalizePlayer);

    if (!inningsBattingTeamId || !match) {
      return { batting: [], bowling: [] };
    }

    const teamAIsBatting =
      String(match?.teamA?._id) === inningsBattingTeamId;

    return teamAIsBatting
      ? { batting: teamA, bowling: teamB }
      : { batting: teamB, bowling: teamA };
  }, [match, inningsBattingTeamId]);

  const battingSquad = useMemo(
    () => (paramBattingSquad.length ? paramBattingSquad : matchSquads.batting),
    [paramBattingSquad, matchSquads],
  );

  const bowlingSquad = useMemo(
    () => (paramBowlingSquad.length ? paramBowlingSquad : matchSquads.bowling),
    [paramBowlingSquad, matchSquads],
  );

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

      if (typeof player === "object" && player.playerName) {
        return player.playerName;
      }

      const id = player?._id || player;
      const pool = squad?.length ? squad : squadPool;
      return (
        pool.find((p) => String(p._id) === String(id))?.playerName ||
        "Select Player"
      );
    },
    [squadPool],
  );

  /*
  |--------------------------------------------------------------------------
  | Commentary
  |--------------------------------------------------------------------------
  |
  | The sentence itself is built in features/matches/utils/commentary.js and
  | shared with the match's Live tab, so the scorer and a spectator read the
  | same words for the same delivery.
  |
  | It used to be written inline here, which is exactly why the Live tab had
  | no commentary text at all - there was nothing there to reuse.
  |
  | This screen supplies only what the shared builder cannot know: how to
  | turn a bare player id into a name using the squads it has loaded.
  */

  const commentaryLine = (b) =>
    buildCommentaryLine(b, {
      resolveBatsman: (v) => resolvePlayerName(v, battingSquad),
      resolveBowler: (v) => resolvePlayerName(v, bowlingSquad),
      resolveFielder: (v) => resolvePlayerName(v, bowlingSquad),
    }) ||
    b.commentaryText ||
    "";



  const overs = currentInnings
    ? `${Math.floor(currentInnings.balls / 6)}.${currentInnings.balls % 6}`
    : "0.0";

  const currentRunRate =
    currentInnings?.balls > 0
      ? (currentInnings.totalRuns / (currentInnings.balls / 6)).toFixed(2)
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Which Side Is Which
  |--------------------------------------------------------------------------
  |
  | The innings knows its batting and bowling team; the match knows the two
  | teams' names. Joining them is what turns "28/1" into "Nav Chetna society
  | 28/1", which is the difference between a number and a score.
  |
  | Left undefined when the innings' team matches neither side loaded here -
  | the header then falls back to the fixture line rather than guessing.
  */

  const battingTeamId = inningsBattingTeamId;

  const teamAIsBatting =
    !!battingTeamId && String(match?.teamA?._id) === battingTeamId;

  const teamBIsBatting =
    !!battingTeamId && String(match?.teamB?._id) === battingTeamId;

  const battingTeamName = teamAIsBatting
    ? match?.teamA?.teamName
    : teamBIsBatting
      ? match?.teamB?.teamName
      : undefined;

  const bowlingTeamName = teamAIsBatting
    ? match?.teamB?.teamName
    : teamBIsBatting
      ? match?.teamA?.teamName
      : undefined;

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

  const battingFigures = (playerId) => {
    const playerBalls = ballList.filter(
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
    const playerBalls = ballList.filter(
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

  /*
  | The WHOLE ball object goes through, with over/text added on top.
  |
  | This used to map down to just { over, text }, which threw away runs,
  | isWicket, extraType, shotType and the wagon wheel - so the commentary
  | row had nothing to colour its badge with and rendered "undefined".
  */

  const commentary = ballList
    .slice()
    .reverse()
    .map((b) => ({
      ...b,
      over: `${b.over}.${b.ball}`,
      text: commentaryLine(b),
    }));

  const strikerId = () =>
    currentInnings?.currentStrikerId?._id || currentInnings?.currentStrikerId;

  const nonStrikerId = () =>
    currentInnings?.currentNonStrikerId?._id ||
    currentInnings?.currentNonStrikerId;

  const bowlerId = () =>
    currentInnings?.currentBowlerId?._id || currentInnings?.currentBowlerId;

  const oversBowledBy = (playerId) => {
    const bowlerBalls = ballList.filter(
      (b) =>
        (b.bowlerId?._id || b.bowlerId) === playerId &&
        b.isLegalDelivery !== false,
    );
    return bowlerBalls.length / 6;
  };

  /*
  | One fifth of the innings, but never zero.
  |
  | Math.floor(4 / 5) is 0, so in any match under five overs EVERY bowler
  | failed the `oversBowled < max` test: the eligible-bowler list came back
  | empty, "Start Next Over" could never be enabled, and the scorer was
  | stuck on the over summary with no way forward.
  */

  const maxOversPerBowler = Math.max(1, Math.floor(totalOvers / 5));

  const afterBall = useCallback(
    async (result) => {
      console.log("[afterBall] ENTERED", {
        success: result?.success,
        error: result?.error,
      });

      if (!result || !result.success) {
        Alert.alert("Failed", result?.error || "Could not record that ball.");
        return;
      }

      const data = result.data;
      if (!data || !data.innings) {
        console.log("[afterBall] missing data.innings — refreshing from server");
        loadInnings();
        return;
      }

      const updatedInnings = data.innings;
      const lastBall = data.ball;
      const totalBalls = totalOvers * 6;

      /*
      | The server now decides whether the innings is over and says so on
      | the response: inningsComplete, with targetReached / allOut /
      | oversExhausted broken out.
      |
      | It is trusted first because it knows things this screen may not: the
      | real squad size, the first innings' total, and the true ball count.
      | The local checks stay as a fallback for an older server build.
      |
      | The old all-out test was `battingSquad.length > 0 && ...`, which
      | means a screen that had lost its squad params could never detect
      | all out at all - it just silently kept scoring.
      */

      const isTargetAchieved =
        data.targetReached ??
        (target != null && updatedInnings.totalRuns >= target);

      /*
      | The server ends the innings and, when it was the second, completes
      | the match and writes the result. `matchCompleted` says it did.
      |
      | endInnings is still called for an older server build that does not,
      | and `replace` rather than `navigate` so the finished match cannot be
      | swiped back into a live-looking scoring pad.
      */

      if (data.matchCompleted) {
        navigation.replace("MatchResultScreen", { matchId });
        return;
      }

      if (isTargetAchieved) {
        await endInnings(inningsId);
        navigation.replace("MatchResultScreen", { matchId });
        return;
      }

      const isAllOut =
        data.allOut ??
        (battingSquad.length > 0 &&
          updatedInnings.wickets >= battingSquad.length - 1);

      const isOversComplete =
        data.oversExhausted ?? updatedInnings.balls >= totalBalls;

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

      if (data.overCompleted) {
        console.log("[afterBall] OVER COMPLETED — preparing OverSummary payload");

        const overBalls = (() => {
          const current = ballsRef.current || [];
          const inOver = current.filter((b) => b.over === lastBall.over);
          const hasLast = inOver.some((b) => b._id === lastBall._id);
          return hasLast ? inOver : [...inOver, lastBall];
        })();

        const figuresFor = (player) => {
          const playerId = player?._id || player;
          const playerBalls = (ballsRef.current || []).filter(
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
          const bowlerBalls = (ballsRef.current || []).filter(
            (b) => (b.bowlerId?._id || b.bowlerId) === currentBowlerId,
          );
          const legalBalls = bowlerBalls.filter(
            (b) => b.isLegalDelivery !== false,
          ).length;

          const maidenOvers = (() => {
            const byOver = {};
            bowlerBalls.forEach((b) => {
              byOver[b.over] = (byOver[b.over] || 0) + (b.teamRuns ?? b.runs ?? 0);
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

        const lastBowlerId = lastBall.bowlerId?._id || lastBall.bowlerId;

        const oversBowledByMap = {};
        (ballsRef.current || []).forEach((b) => {
          const pid = b.bowlerId?._id || b.bowlerId;
          if (pid && b.isLegalDelivery !== false) {
            oversBowledByMap[pid] = (oversBowledByMap[pid] || 0) + 1;
          }
        });

        console.log("[afterBall] navigating to OverSummary", {
          inningsId,
          lastBowlerId,
          bowlingPoolLen: bowlingPool.length,
          overBallsLen: overBalls.length,
        });

        if (!inningsId) {
          console.warn("[afterBall] Missing inningsId — aborting OverSummary navigation");
          loadInnings();
          return;
        }

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
          matchId,
          inningsId,
          bowlingPool,
          lastBowlerId,
          maxOversPerBowler,
          oversBowledBy: oversBowledByMap,
        });
        return;
      }

      console.log("[afterBall] ball recorded, refreshing innings state");
      loadInnings();
    },
    [
      maxOversPerBowler,
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
      loadInnings,
    ],
  );

  /*
  | On focus: take a delivery handed over by one of the modals if there is
  | one, otherwise refresh from the server.
  |
  | There used to be TWO sources here - a __ballResult route param and the
  | handoff module - with a ref guarding the param against double
  | consumption. The param is gone (it was destroying the screen's other
  | params on the way in; see utils/ballHandoff.js), so there is one source,
  | it clears itself as it is read, and the guard is no longer needed.
  */

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingBallResult();

      if (pending) {
        afterBall(pending);
        return;
      }

      loadInnings();
    }, [afterBall, loadInnings]),
  );

  /*
  | One delivery at a time.
  |
  | Nothing guarded a second tap: two taps on Wide posted two balls, and the
  | server processed both from the same stale innings snapshot - the totals
  | survived ($inc is atomic) but the crease did not, because both requests
  | computed the new striker from the same starting pair. Two singles ended
  | up swapping the batters once instead of twice.
  */

  const submittingRef = useRef(false);

  const withSubmitLock = async (fn) => {
    if (submittingRef.current) return;

    submittingRef.current = true;

    try {
      await fn();
    } finally {
      submittingRef.current = false;
    }
  };

  /*
  | Every path that records something goes through this first.
  |
  | The innings check is the one that was missing. Without it a screen that
  | had lost its inningsId still rendered a full scoring pad: tapping 6
  | opened the shot picker, which passed inningsId: undefined to the wagon
  | wheel, which refused to submit - and the scorer was left tapping a live
  | -looking pad that silently recorded nothing.
  */

  const canRecord = () => {
    /*
    | With matchId held in state this should now be unreachable. It stays as
    | the honest failure: a scorer who somehow gets here is told the pad
    | cannot record, instead of tapping buttons that post nothing and reading
    | a raw Mongoose validation error a moment later.
    */

    if (!matchId) {
      Alert.alert(
        "Match not loaded",
        "This scoring screen has lost track of its match. Go back to the match and open Score again.",
      );

      return false;
    }

    if (!inningsId) {
      Alert.alert(
        resolving ? "One moment" : "No innings open",
        resolving
          ? "Still loading this match's innings. Try again in a second."
          : "This match has no innings in progress. Reopen it from the match screen to start the next innings.",
      );

      return false;
    }

    if (!strikerId() || !bowlerId()) {
      Alert.alert(
        "Select Players",
        "Set the current striker and bowler first.",
      );

      return false;
    }

    return true;
  };


  const handleRun = async (runs) => {
    if (!canRecord()) return;

    /*
    | Dot balls used to skip straight to addBall, which meant a third of a
    | typical innings was recorded with no shot and no direction - and then
    | read back as a bare "no run" in the commentary.
    |
    | A dot is a delivery like any other: the batter still played at it and
    | it still went somewhere. It now takes the same shot -> direction path
    | as every other ball, so the commentary and the wagon wheel are
    | complete rather than complete-except-for-dots.
    */

    navigation.navigate("ShotSelectionModal", {
      matchId,
      inningsId,
      runs,
      batsmanId: strikerId(),
      bowlerId: bowlerId(),
    });
  };

  /*
  | Extras used to skip both of the guards the run buttons have: no check
  | that a striker and bowler were set (so an innings with no bowler yet
  | posted undefined ids and got a server rejection instead of the clear
  | "set the striker and bowler first"), and no lock against a second tap.
  */

  const handleExtraRuns = async (runs) => {
    const extraType = extraPicker;

    setExtraPicker(null);

    if (!canRecord()) return;

    await withSubmitLock(async () => {
      const result = await addBall({
        matchId,
        inningsId,
        batsmanId: strikerId(),
        bowlerId: bowlerId(),
        runs,
        extraType,
        isFreeHit: extraType === "noBall",
      });

      await afterBall(result);
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Penalty Runs (Law 41)
  |--------------------------------------------------------------------------
  |
  | Five runs to the batting side for an offence by the fielding side.
  |
  | Not a delivery: no ball is bowled, no batter faces it, the bowler is not
  | charged, and the strike does not rotate. The server enforces all of that
  | from `extraType: "penalty"` - this screen only has to say it happened
  | and why.
  |
  | It goes through addBall like everything else, which is what makes it
  | undoable with no extra code: Undo reverses whatever the stored row says,
  | and the row says +5 to the team and nothing to anybody.
  |
  | v1 awards to the BATTING side only. A penalty against the batting side
  | belongs to the other team's total, which for a side that has not batted
  | yet has nowhere to live - that needs its own design, not a fifth button.
  */

  const PENALTY_REASONS = [
    "Illegal fielding",
    "Deliberate distraction",
    "Damaging the pitch",
    "Ball tampering",
    "Other",
  ];

  const handlePenalty = async (reason) => {
    setPenaltyPicker(false);

    if (!canRecord()) return;

    await withSubmitLock(async () => {
      const result = await addBall({
        matchId,
        inningsId,
        extraType: "penalty",
        runs: 5,
        penaltyReason: reason,
        isWicket: false,
      });

      await afterBall(result);
    });
  };

  const handleWicket = () => {
    if (!canRecord()) return;

    /*
    | Everyone already dismissed in this innings, so the modal can leave
    | them out of the "new batsman" list - and recognise the last wicket,
    | where there is nobody left to come in.
    */

    const dismissedPlayerIds = ballList
      .filter((b) => b.isWicket)
      .map((b) => String(b.dismissedPlayerId?._id || b.dismissedPlayerId || b.batsmanId?._id || b.batsmanId || ""))
      .filter(Boolean);

    navigation.navigate("WicketDismissalModal", {
      matchId,
      inningsId,
      strikerId: strikerId(),
      nonStrikerId: nonStrikerId(),
      bowlerId: bowlerId(),
      battingSquad,
      bowlingSquad,
      dismissedPlayerIds,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Change batsman
  |--------------------------------------------------------------------------
  |
  | TWO DIFFERENT THINGS WEAR THE SAME BUTTON, AND ONLY ONE IS A CORRECTION.
  |
  | If the batter at that end has faced NO balls, the scorer simply tapped
  | the wrong name. Nothing happened on the field, nothing is in the
  | scorecard, and swapping them is a correction - handled here.
  |
  | The moment they have faced a ball, those runs and those balls belong to
  | them. Swapping them out silently would move another player's innings
  | into their career record. The only lawful way off strike is a
  | retirement, which IS a scorecard entry - so that case is handed to the
  | dismissal sheet, which already implements retired hurt and retired out
  | correctly (no ball counted, no bowler credit, and retired hurt stays
  | eligible to return at the next fall of a wicket, per Law 25.4).
  */

  const handleChangeBatsman = (end) => {
    if (!canRecord()) return;

    const playerId = end === "striker" ? strikerId() : nonStrikerId();

    const faced = battingFigures(playerId)?.balls || 0;

    if (faced > 0) {
      Alert.alert(
        "Change Batsman",
        `${resolvePlayerName(playerId)} has already faced ${faced} ball${faced === 1 ? "" : "s"}. ` +
          "Those runs belong to them, so they can only leave the crease by retiring.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Retire…",
            onPress: () => {
              /*
              | Straight into the dismissal sheet. `preselectPlayerId` and
              | `retirementOnly` tell it which batter and to offer only the
              | two retirement options - it already knows how to do both.
              */
              const dismissedPlayerIds = ballList
                .filter((b) => b.isWicket)
                .map((b) =>
                  String(
                    b.dismissedPlayerId?._id ||
                      b.dismissedPlayerId ||
                      b.batsmanId?._id ||
                      b.batsmanId ||
                      "",
                  ),
                )
                .filter(Boolean);

              navigation.navigate("WicketDismissalModal", {
                matchId,
                inningsId,
                strikerId: strikerId(),
                nonStrikerId: nonStrikerId(),
                bowlerId: bowlerId(),
                battingSquad,
                bowlingSquad,
                dismissedPlayerIds,
                preselectPlayerId: playerId,
                retirementOnly: true,
              });
            },
          },
        ],
      );

      return;
    }

    setPendingBatsmanId(null);
    setBatsmanPicker(end);
  };

  const handleConfirmBatsman = async () => {
    if (!pendingBatsmanId || !batsmanPicker) return;

    const chosenId = pendingBatsmanId;
    const end = batsmanPicker;

    setBatsmanPicker(null);
    setPendingBatsmanId(null);

    try {
      const result = await setNextBatsman(inningsId, chosenId, end);

      if (result?.success === false || result?.error) {
        Alert.alert(
          "Could Not Change Batsman",
          result.error || "Please try again.",
        );

        return;
      }

      loadInnings();
    } catch (error) {
      Alert.alert(
        "Could Not Change Batsman",
        error?.message || "Please try again.",
      );
    }
  };

  const handleConfirmNextBowler = async () => {
    console.log("[LiveScoring] handleConfirmNextBowler", { pendingBowlerId, inningsId });
    if (!pendingBowlerId) return;

    const chosenBowlerId = pendingBowlerId;

    setNextBowlerPicker(false);
    setPendingBowlerId(null);

    try {
      const result = await setNextBowler(inningsId, chosenBowlerId);
      console.log("[LiveScoring] setNextBowler result", result);

      if (!result) {
        Alert.alert("Failed", "No response from server.");
        return;
      }
      if (result.success === false || result.error) {
        Alert.alert("Failed", result.error || "Could not set the next bowler.");
        return;
      }

      loadInnings();
    } catch (err) {
      console.error("[LiveScoring] setNextBowler throw", err);
      Alert.alert("Failed", err?.message || "Could not set the next bowler.");
    }
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
          onPress: () =>
            /*
            | Under the same lock as recording a ball. Undo is a write to
            | the same innings, and an undo racing a delivery leaves the
            | crease derived from two different snapshots.
            */
            withSubmitLock(async () => {
              const result = await undoLastBall(inningsId);

              if (!result?.success) {
                Alert.alert("Failed", result?.error || "Nothing to undo.");
                return;
              }

              loadInnings();
            }),
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

  /*
  | The batting side's squad, for the correction picker. Mirrors bowlingPool
  | below but resolves the BATTING team - the two are opposite sides of the
  | same comparison, and getting it backwards would offer the fielding side
  | as replacement batters.
  */
  const battingPool = (() => {
    const innerBattingTeamId =
      currentInnings?.battingTeam?._id || currentInnings?.battingTeam;

    const teamAId = match?.teamA?._id;

    const raw =
      innerBattingTeamId && teamAId && String(innerBattingTeamId) === String(teamAId)
        ? match?.teamASquad || []
        : match?.teamBSquad || [];

    const pool = raw.length ? raw : battingSquad;

    return pool.map(normalizePlayer);
  })();

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

  if (loading && !currentInnings) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <MatchHeader
        teamAName={match?.teamA?.teamName}
        teamBName={match?.teamB?.teamName}
        battingTeamName={battingTeamName}
        bowlingTeamName={bowlingTeamName}
        inningsNumber={currentInnings?.inningsNumber}
        score={currentInnings?.totalRuns || 0}
        wickets={currentInnings?.wickets || 0}
        overs={overs}
        target={target}
        runRate={currentRunRate}
        /*
        | The scorer gets the same full scorecard everyone else sees,
        | without leaving the match - MatchDetailsScreen opened on its
        | Scorecard tab.
        */
        onPressScorecard={() =>
          navigation.navigate("MatchDetailsScreen", {
            matchId,
            initialTab: "Scorecard",
          })
        }
      />

      {/*
      | The scorer IS the person who controls the cameras, and this is the
      | screen they are on for three hours.
      |
      | NO canManage prop. Reaching the scoring pad does NOT prove you own
      | the cameras - the opposing captain can reach it too. The server
      | decides, and the banner renders nothing for anyone else.
      |
      | flush because this screen's scrollContent already has padding: 16.
      | Without it the banner adds its own 16 on top and ends up 32 in from
      | each edge - narrower than every card around it.
      */}
      <LiveStreamBanner matchId={matchId} flush />

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
        striker={{
          id: strikerId(),
          name: strikerName,
          ...battingFigures(strikerId()),
        }}
        nonStriker={{
          id: nonStrikerId(),
          name: nonStrikerName,
          ...battingFigures(nonStrikerId()),
        }}
        bowler={{
          id: bowlerId(),
          name: bowlerName,
          ...bowlingFigures(bowlerId()),
        }}
        onChangeBowler={() => setNextBowlerPicker(true)}
        onChangeBatsman={handleChangeBatsman}
        onPressPlayer={(playerId) =>
          navigation.navigate("TeamStack", {
            screen: "PlayerProfileScreen",
            params: { playerId },
          })
        }
      />

      <ScoringPad
        onRun={handleRun}
        onWicket={handleWicket}
        onExtra={(type) => setExtraPicker(type)}
        onPenalty={() => setPenaltyPicker(true)}
      />

      <MatchControls
        onUndo={handleUndo}
        onTransfer={() => setTransferPicker(true)}
        canUndo={ballList.length > 0}
      />

      {/*
      | The full-width "Change Bowler" button that used to sit here has
      | moved onto the bowler's own row in PlayerStats - it changes that
      | line, so it belongs on it, and between overs it is the control the
      | scorer reaches for first rather than one to hunt for below the pad.
      */}

      <CommentarySection commentary={commentary} />

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

      <Modal visible={penaltyPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>5 Penalty Runs</Text>

            <Text style={styles.modalHint}>
              Awarded to the batting side. Not a ball, not charged to the
              bowler.
            </Text>

            {PENALTY_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.playerRow}
                onPress={() => handlePenalty(reason)}
              >
                <Text style={styles.playerRowText}>{reason}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setPenaltyPicker(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

      {/*
        | Correction only. handleChangeBatsman never opens this for a batter
        | who has faced a ball - that case goes to the retirement sheet,
        | because those runs have to belong to somebody.
      */}
      <Modal
        visible={!!batsmanPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setBatsmanPicker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Replace{" "}
              {batsmanPicker === "striker" ? "Striker" : "Non-Striker"}
            </Text>

            <ScrollView style={styles.liveMaxer}>
              {battingPool
                .filter((p) => {
                  const id = String(p._id);

                  /*
                  | Nobody already at the crease - putting one player on
                  | both ends makes strike rotation swap him with himself
                  | and the partnership can never break. The server refuses
                  | it too; this just keeps it off the list.
                  */
                  if (
                    id === String(strikerId()) ||
                    id === String(nonStrikerId())
                  ) {
                    return false;
                  }

                  /*
                  | Nobody already out. Retired batters are NOT excluded -
                  | retired hurt is stored with isWicket:false precisely so
                  | they can come back, which is what Law 25.4 allows.
                  */
                  return !ballList.some(
                    (b) =>
                      b.isWicket &&
                      String(
                        b.dismissedPlayerId?._id ||
                          b.dismissedPlayerId ||
                          b.batsmanId?._id ||
                          b.batsmanId ||
                          "",
                      ) === id,
                  );
                })
                .map((player) => (
                  <TouchableOpacity
                    key={player._id}
                    style={[
                      styles.playerRow,
                      pendingBatsmanId === player._id &&
                        styles.playerRowSelected,
                    ]}
                    onPress={() => setPendingBatsmanId(player._id)}
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
                !pendingBatsmanId && styles.confirmButtonDisabled,
              ]}
              disabled={!pendingBatsmanId}
              onPress={handleConfirmBatsman}
            >
              <Text style={styles.confirmButtonText}>Confirm Batsman</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => setBatsmanPicker(null)}
            >
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

  modalHint: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.onSurfaceVariant,
    marginTop: -10,
    marginBottom: 14,
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

  /*
  | The batsman picker needs a way out that is not a system back gesture -
  | the bowler picker has none because a new bowler is mandatory between
  | overs, but a correction is always abandonable.
  */
  cancelLink: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: "center",
  },

  cancelLinkText: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
    fontSize: 13,
  },


});