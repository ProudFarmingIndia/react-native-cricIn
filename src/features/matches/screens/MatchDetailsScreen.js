import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";

import { MaterialIcons } from "@expo/vector-icons";

import {
  getMatchByIdApi,
  getScorecardByInningsApi,
  getLiveMatchApi,
  getOverByOverApi,
} from "../services/matches.services";

/*
| The same feed the Matches screen uses, scoped to this match by matchId.
| `nested` matters: this screen's tab content sits inside a ScrollView, and
| a FlatList inside a ScrollView of the same orientation breaks scrolling
| and warns. In nested mode the feed renders plain rows instead.
*/

import HighlightsFeed from "../../highlights/components/HighlightsFeed";

import CommentarySection from "../../../components/matches/LiveScoringScreen/CommentarySection";

/*
| The same sentence builder the scoring pad uses, so a spectator here reads
| exactly what the scorer sees - names, shot and direction on every ball.
*/

import { buildCommentaryLine } from "../utils/commentary";

/*
  |--------------------------------------------------------------------------
  | MatchDetailsScreen
  |--------------------------------------------------------------------------
  |
  | Fetches the real match via getMatchByIdApi and, for the Scorecard tab,
  | the real innings-by-innings figures via getScorecardByInningsApi.
  |
  | For captains (canManage) of an UPCOMING match, a "Start Match" button
  | is shown. Pressing it wipes any partial setup (squads / toss / lineup /
  | partial innings) via resetMatchSetupApi, then navigates to
  | SquadSelectionScreen -> TossScreen -> MatchLineUpScreen (where the
  | opponent PIN is asked before live scoring).
  |
  */

// ─── Colour tokens (from the original design system) ────────────────────────
const C = {
  primary: "#00490e",
  primaryContainer: "#0d631b",
  onPrimaryContainer: "#8bdd86",
  secondary: "#8f4e00",
  secondaryContainer: "#ff8f04",
  onSecondaryContainer: "#623300",
  surface: "#f7fbf1",
  surfaceContainer: "#ebefe5",
  surfaceContainerLow: "#f1f5eb",
  surfaceContainerHigh: "#e5eae0",
  surfaceContainerLowest: "#ffffff",
  surfaceVariant: "#e0e4da",
  onSurface: "#181d17",
  onSurfaceVariant: "#40493d",
  outlineVariant: "#bfcaba",
  outline: "#707a6c",
  error: "#ba1a1a",
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const formatDateTime = (isoString) => {
  if (!isoString) return "Not scheduled";

  return new Date(isoString).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusLabel = (match) => {
  if (!match) return "";
  if (match.status === "live") return "LIVE";
  if (match.status === "completed") return "COMPLETED";
  if (match.status === "cancelled") return "CANCELLED";
  return "UPCOMING";
};

// ─── Sub-components ──────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <View
    style={[
      styles.statusBadge,
      status === "LIVE" && styles.statusBadgeLive,
      status === "CANCELLED" && styles.statusBadgeCancelled,
    ]}
  >
    <Text style={styles.statusText}>{status}</Text>
  </View>
);

const TeamLogo = ({ team }) => (
  <View style={styles.logoWrap}>
    {team?.logo?.url ? (
      <Image
        source={{ uri: team.logo.url }}
        style={styles.teamLogo}
        resizeMode="contain"
      />
    ) : (
      <Text style={styles.logoFallbackText}>
        {(team?.shortName || team?.teamName || "?").slice(0, 2).toUpperCase()}
      </Text>
    )}
  </View>
);

const HeroCard = ({ match, canManage }) => (
  <View style={styles.heroCard}>
    <StatusBadge status={statusLabel(match)} />

    <View style={styles.teamsRow}>
      <View style={styles.teamCol}>
        <TeamLogo team={match.teamA} />
        <Text style={styles.teamName} numberOfLines={1}>
          {match.teamA?.teamName || "Team A"}
        </Text>
      </View>

      <View style={styles.vsCol}>
        <View style={styles.vsDivider} />
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.vsDivider} />
      </View>

      <View style={styles.teamCol}>
        <TeamLogo team={match.teamB} />
        <Text style={styles.teamName} numberOfLines={1}>
          {match.teamB?.teamName || "Team B"}
        </Text>
      </View>
    </View>

    <View style={styles.heroFooter}>
      <Text style={styles.heroFooterText}>
        {match.matchType} • {match.overs} Overs • {match.ballType} Ball
      </Text>
      {match.tournament ? (
        <Text style={styles.heroTournament}>{match.tournament}</Text>
      ) : null}

      {canManage && match.matchPin && (
        <View style={[styles.card, styles.pinCard]}>
          <Text style={styles.cardTitle}>Match PIN</Text>
          <Text style={styles.pinValue}>{match.matchPin}</Text>
          <Text style={styles.pinHint}>
            Share this PIN with the opposing captain. It is required to start
            live scoring.
          </Text>
        </View>
      )}
    </View>
  </View>
);

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      <Text style={styles.infoIcon}>{icon}</Text>
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const InfoTab = ({ match }) => (
  <View style={styles.tabContent}>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>ℹ️ General Information</Text>
      <View style={styles.infoList}>
        <InfoRow
          icon="📅"
          label="Date & Time"
          value={formatDateTime(match.scheduledStartTime || match.startTime)}
        />
        <InfoRow
          icon="📍"
          label="Venue"
          value={match.venueName || "Not specified"}
        />
        <InfoRow
          icon="🏏"
          label="Match Format"
          value={`${match.matchType} • ${match.overs} Overs (${match.pitchType} pitch)`}
        />
      </View>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle}>👥 Match Officials</Text>
      <View style={styles.officialsGrid}>
        <View style={styles.officialBox}>
          <Text style={styles.officialLabel}>UMPIRES</Text>
          <Text style={styles.officialName}>
            {match.umpire1 || "Not assigned"}
          </Text>
          {!!match.umpire2 && (
            <Text style={styles.officialName}>{match.umpire2}</Text>
          )}
        </View>
        <View style={styles.officialBox}>
          <Text style={styles.officialLabel}>SCORER</Text>
          <Text style={styles.officialName}>
            {match.scorer || "Not assigned"}
          </Text>
        </View>
      </View>
    </View>

    {match.canManage &&
      !match.isInviteSender &&
      match.status === "upcoming" && (
        <View style={[styles.card, styles.pendingCard]}>
          <Text style={styles.pendingText}>
            ⏳ Only the captain who sent the match invite can set up the squads,
            toss and line-up, and start live scoring.
          </Text>
        </View>
      )}
  </View>
);

/*
| Squad rows open the player's profile, the same as every other player list
| in the app (search results, team squads, stats leaderboards). They were
| the one list that was inert.
*/

const PlayerItem = ({ player, isLast, onPress, isCaptain }) => (
  <>
    <TouchableOpacity
      style={styles.playerRow}
      onPress={() => onPress?.(player)}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.playerLeft}>
        <View style={styles.playerAvatar}>
          <View style={styles.playerPhotoPlaceholder} />
        </View>

        <Text style={styles.playerName} numberOfLines={1}>
          {player.playerName}
          {isCaptain ? " (c)" : ""}
          {/* Cricbuzz marks the keeper on the row rather than in a column. */}
          {String(player.playerType || "").toLowerCase().includes("keeper")
            ? " (wk)"
            : ""}
        </Text>
      </View>

      <Text style={styles.playerRole}>{player.playerType || ""}</Text>
    </TouchableOpacity>
    {!isLast && <View style={styles.divider} />}
  </>
);

/*
|--------------------------------------------------------------------------
| Squads Tab
|--------------------------------------------------------------------------
|
| Cricbuzz splits a squad in two once a match is under way - the eleven who
| are actually playing, and everyone else on the bench - and shows the whole
| roster before that, when nobody has been picked yet.
|
| This tab used to show one flat roster in both situations, so during a live
| match there was no way to tell who was on the field from who was watching
| it.
|
| WHICH LIST IS WHICH
|
| match.teamASquad / teamBSquad is the eleven chosen at squad selection;
| match.teamA.players / teamB.players is the club's full roster. The bench
| is the roster minus the chosen eleven - derived rather than stored, so it
| cannot drift out of step with a lineup change.
|
| Before selection teamASquad is empty, and the whole roster is shown under
| one heading instead of an empty "Playing XI" above everyone.
|
*/

const SquadGroup = ({ label, players, onPressPlayer, captainId, muted }) => {
  if (!players.length) return null;

  return (
    <>
      <View style={[styles.squadGroupHeader, muted && styles.squadGroupMuted]}>
        <Text style={styles.squadGroupLabel}>{label}</Text>

        <Text style={styles.squadGroupCount}>{players.length}</Text>
      </View>

      {players.map((player, index) => (
        <PlayerItem
          key={player._id || index}
          player={player}
          onPress={onPressPlayer}
          isCaptain={
            !!captainId && String(player._id) === String(captainId)
          }
          isLast={index === players.length - 1}
        />
      ))}
    </>
  );
};

const SquadsTab = ({ match, onPressPlayer }) => {
  const [activeTeam, setActiveTeam] = useState("A");

  const teamAName = match.teamA?.teamName || "Team A";
  const teamBName = match.teamB?.teamName || "Team B";

  const isTeamA = activeTeam === "A";

  const team = isTeamA ? match.teamA : match.teamB;

  const roster = team?.players || [];

  const playingXI = (isTeamA ? match.teamASquad : match.teamBSquad) || [];

  /*
  | The chosen eleven come from teamASquad, which is populated with only
  | playerName / playerType / userId. The roster entries are fully
  | populated, so each pick is matched back to its roster entry where one
  | exists - otherwise a player picked from outside the roster would lose
  | their details.
  */

  const playingIds = new Set(playingXI.map((p) => String(p._id)));

  const playing = playingXI.map(
    (pick) =>
      roster.find((r) => String(r._id) === String(pick._id)) || pick,
  );

  const bench = roster.filter((p) => !playingIds.has(String(p._id)));

  const hasLineup = playing.length > 0;

  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <View style={styles.squadHeader}>
          <Text style={styles.cardTitle}>Squads</Text>

          <View style={styles.teamToggle}>
            {[
              { key: "A", label: teamAName },
              { key: "B", label: teamBName },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.toggleBtn,
                  activeTeam === t.key && styles.toggleBtnActive,
                ]}
                onPress={() => setActiveTeam(t.key)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    activeTeam === t.key && styles.toggleBtnTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {roster.length === 0 && playing.length === 0 ? (
          <Text style={styles.emptyText}>No players in this team yet.</Text>
        ) : hasLineup ? (
          <>
            <SquadGroup
              label="PLAYING XI"
              players={playing}
              onPressPlayer={onPressPlayer}
              captainId={team?.captainId}
            />

            <SquadGroup
              label="BENCH"
              players={bench}
              onPressPlayer={onPressPlayer}
              captainId={team?.captainId}
              muted
            />
          </>
        ) : (
          <>
            {/*
            | No lineup chosen yet, so there is no eleven to separate out -
            | the whole roster is the answer to "who might play".
            */}
            <Text style={styles.squadNote}>
              The playing XI has not been picked yet - this is the full team.
            </Text>

            <SquadGroup
              label="FULL SQUAD"
              players={roster}
              onPressPlayer={onPressPlayer}
              captainId={team?.captainId}
            />
          </>
        )}
      </View>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Innings Scorecard
|--------------------------------------------------------------------------
|
| Laid out as a real scorecard rather than two lists of names: a batting
| table with R / B / 4s / 6s / SR and the dismissal underneath each name,
| a bowling table with O / M / R / W / ER, then Extras, Total, Fall of
| Wickets and Did Not Bat.
|
| Collapsible, because a two-innings match otherwise opens as one very long
| scroll. The innings currently in progress (or the last one) starts open.
|
*/

const StatHeader = ({ label, columns }) => (
  <View style={styles.tableHeader}>
    <Text style={styles.tableHeaderName}>{label}</Text>

    {columns.map((c) => (
      <Text key={c} style={styles.tableHeaderCell}>
        {c}
      </Text>
    ))}
  </View>
);

const BatterRow = ({ player, onPress }) => (
  <TouchableOpacity
    style={styles.tableRow}
    onPress={() => onPress?.(player.playerId)}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.tableNameCol}>
      <Text style={styles.tableName} numberOfLines={1}>
        {player.playerName}
      </Text>

      {/*
      | The dismissal sits under the name exactly as it does on a printed
      | card - "c Ryan Burl b Brad Evans" - and "not out" is greyed so the
      | batters still in reads at a glance.
      */}
      <Text
        style={[
          styles.tableDismissal,
          !player.isOut && styles.tableDismissalNotOut,
        ]}
        numberOfLines={1}
      >
        {player.dismissal || "not out"}
      </Text>
    </View>

    <Text style={[styles.tableCell, styles.tableCellStrong]}>
      {player.runs}
    </Text>
    <Text style={styles.tableCell}>{player.balls}</Text>
    <Text style={styles.tableCell}>{player.fours}</Text>
    <Text style={styles.tableCell}>{player.sixes}</Text>
    <Text style={[styles.tableCell, styles.tableCellWide]}>
      {player.strikeRate}
    </Text>
  </TouchableOpacity>
);

const BowlerRow = ({ player, onPress }) => (
  <TouchableOpacity
    style={styles.tableRow}
    onPress={() => onPress?.(player.playerId)}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.tableNameCol}>
      <Text style={styles.tableName} numberOfLines={1}>
        {player.playerName}
      </Text>
    </View>

    <Text style={styles.tableCell}>{player.overs}</Text>
    <Text style={styles.tableCell}>{player.maidens ?? 0}</Text>
    <Text style={styles.tableCell}>{player.runsConceded}</Text>
    <Text style={[styles.tableCell, styles.tableCellStrong]}>
      {player.wickets}
    </Text>
    <Text style={[styles.tableCell, styles.tableCellWide]}>
      {player.economy}
    </Text>
  </TouchableOpacity>
);

const InningsScorecard = ({ innings, expanded, onToggle, onPressPlayer }) => {
  const extras = innings.extras || {};

  return (
    <View style={styles.inningsBlock}>
      <TouchableOpacity
        style={styles.inningsHeader}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Text style={styles.inningsTeam} numberOfLines={1}>
          {innings.battingTeamName || `Innings ${innings.inningsNumber}`}
        </Text>

        <Text style={styles.inningsScore}>
          {innings.totalRuns}-{innings.wickets}
        </Text>

        <Text style={styles.inningsOvers}>({innings.overs} Ov)</Text>

        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={22}
          color={C.primary}
        />
      </TouchableOpacity>

      {expanded && (
        <>
          <StatHeader label="Batter" columns={["R", "B", "4s", "6s", "SR"]} />

          {(innings.batting || []).map((p) => (
            <BatterRow key={p.playerId} player={p} onPress={onPressPlayer} />
          ))}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Extras</Text>

            <Text style={styles.summaryValue}>
              {extras.total ?? 0}
              <Text style={styles.summaryDetail}>
                {"  "}b {extras.byes ?? 0}, lb {extras.legByes ?? 0}, w{" "}
                {extras.wides ?? 0}, nb {extras.noBalls ?? 0}
              </Text>
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>

            <Text style={styles.summaryValue}>
              {innings.totalRuns}-{innings.wickets}
              <Text style={styles.summaryDetail}>
                {"  "}({innings.overs} Ov, RR {innings.runRate})
              </Text>
            </Text>
          </View>

          {(innings.didNotBat || []).length > 0 && (
            <View style={styles.dnbBlock}>
              <Text style={styles.sectionLabel}>Did not bat</Text>

              <Text style={styles.dnbText}>
                {innings.didNotBat.join(", ")}
              </Text>
            </View>
          )}

          <StatHeader label="Bowler" columns={["O", "M", "R", "W", "ER"]} />

          {(innings.bowling || []).map((p) => (
            <BowlerRow key={p.playerId} player={p} onPress={onPressPlayer} />
          ))}

          {(innings.fallOfWickets || []).length > 0 && (
            <>
              <View style={styles.fowHeader}>
                <Text style={styles.tableHeaderName}>Fall of Wickets</Text>
                <Text style={styles.tableHeaderCell}>Score</Text>
                <Text style={[styles.tableHeaderCell, styles.tableCellWide]}>
                  Over
                </Text>
              </View>

              {innings.fallOfWickets.map((w, i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={styles.tableNameCol}>
                    <Text style={styles.tableName} numberOfLines={1}>
                      {w.playerName}
                    </Text>
                  </View>

                  <Text style={[styles.tableCell, styles.fowScore]}>
                    {w.score}
                  </Text>

                  <Text style={[styles.tableCell, styles.tableCellWide]}>
                    {w.over}
                  </Text>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </View>
  );
};

const ScorecardTab = ({ match, scorecard, scorecardLoading, onPressPlayer }) => {
  /*
  | The newest innings opens by default - that is the one being played, or
  | the one that decided a finished match.
  */
  const [openInnings, setOpenInnings] = useState(null);

  if (scorecardLoading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!scorecard || scorecard.length === 0) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.emptyText}>
            {match.status === "upcoming"
              ? "The scorecard appears here once the match starts."
              : "No scorecard available for this match yet."}
          </Text>
        </View>
      </View>
    );
  }

  const defaultOpen = scorecard[scorecard.length - 1]?.inningsNumber;

  return (
    <View style={styles.tabContent}>
      {/* The result banner, the way every scorecard leads with it. */}
      {match.status === "completed" && !!match.result && (
        <View style={styles.resultBanner}>
          <Text style={styles.resultBannerText}>{match.result}</Text>
        </View>
      )}

      {scorecard.map((innings) => {
        const key = innings.inningsNumber;

        const expanded =
          openInnings === null ? key === defaultOpen : openInnings === key;

        return (
          <InningsScorecard
            key={String(innings.inningsId || key)}
            innings={innings}
            expanded={expanded}
            onToggle={() => setOpenInnings(expanded ? -1 : key)}
            onPressPlayer={onPressPlayer}
          />
        );
      })}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Live Tab
|--------------------------------------------------------------------------
|
| getLiveMatchApi THROWS when there is no active innings rather than
| returning null, so "no live innings" arrives as an error - which is why
| the empty state is driven by the absence of data, not a caught message.
|
*/

/*
| A ball as it appears in the "this over" strip and in the timeline: a
| coloured disc whose colour carries the outcome at a glance.
*/

const OutcomeChip = ({ ball, small }) => {
  const isWicket = ball.isWicket;

  const isExtra = !!ball.extraType;

  const runs = Number(ball.runs ?? 0);

  const label = isWicket
    ? "W"
    : ball.extraType === "wide"
      ? `${runs}wd`
      : ball.extraType === "noBall"
        ? `${runs}nb`
        : ball.extraType === "bye"
          ? `${runs}b`
          : ball.extraType === "legBye"
            ? `${runs}lb`
            : runs === 0
              ? "\u2022"
              : String(runs);

  return (
    <View
      style={[
        styles.outcomeChip,
        small && styles.outcomeChipSmall,
        isWicket && styles.outcomeChipWicket,
        !isWicket && isExtra && styles.outcomeChipExtra,
        !isWicket && !isExtra && runs === 4 && styles.outcomeChipFour,
        !isWicket && !isExtra && runs === 6 && styles.outcomeChipSix,
      ]}
    >
      <Text
        style={[
          styles.outcomeChipText,
          (isWicket || (!isExtra && runs >= 4)) && styles.outcomeChipTextStrong,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Live Tab
|--------------------------------------------------------------------------
|
| Read top to bottom the way a Cricbuzz live page is: the score first, then
| the state of the chase, then who is at the crease and who is bowling,
| then this over, then the ball-by-ball timeline.
|
| The previous version was a "Live Score" card with two grey stat boxes and
| a commentary list underneath - it showed the runs but not the situation,
| and its commentary rows had no sentence in them at all because the
| over-by-over endpoint never returned one.
|
| Deliberately NOT gated on match.status: a match can be scored while its
| status is still "upcoming", so the presence of a score or of balls is the
| honest signal for whether anything is happening.
|
*/

const LiveTab = ({ match, live, liveLoading, commentary }) => {
  if (liveLoading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const balls = commentary || [];

  const hasAnything = !!live || balls.length > 0;

  if (!hasAnything) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.emptyText}>
            {match.status === "completed"
              ? "This match is finished - see the Scorecard tab for the full figures."
              : "No scoring yet. The live score and commentary appear here as soon as the first ball is bowled."}
          </Text>
        </View>
      </View>
    );
  }

  /*
  | The batting side, named. `live` carries battingTeamId; matching it
  | against the two teams is what turns "142/3" into "Royals 142/3", which
  | is the difference between a number and a score.
  */

  const battingId = String(live?.battingTeamId || "");

  const battingTeam =
    (battingId && String(match?.teamA?._id) === battingId && match.teamA) ||
    (battingId && String(match?.teamB?._id) === battingId && match.teamB) ||
    null;

  const target = live?.target;

  const runsNeeded =
    target != null ? Math.max(0, target - (live?.runs ?? 0)) : null;

  const ballsRemaining =
    target != null && match?.overs != null && live?.balls != null
      ? Math.max(0, match.overs * 6 - live.balls)
      : null;

  /*
  | "This over" is the balls sharing the newest ball's over number. The
  | timeline is newest-first, so the newest ball is at index 0 and the
  | strip is re-reversed to read left to right the way an over is bowled.
  */

  const latestOver = balls.length ? String(balls[0].over).split(".")[0] : null;

  const thisOver =
    latestOver == null
      ? []
      : balls
          .filter((b) => String(b.over).split(".")[0] === latestOver)
          .slice()
          .reverse();

  const striker = live?.currentStriker;
  const nonStriker = live?.currentNonStriker;
  const bowler = live?.currentBowler;

  const hasCrease = !!(striker || nonStriker || bowler);

  return (
    <View style={styles.tabContent}>
      {/* ── Score ─────────────────────────────────────────────── */}
      {!!live && (
        <View style={styles.liveCard}>
          <View style={styles.liveTopRow}>
            <View style={styles.liveDotRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE</Text>
            </View>

            <Text style={styles.liveInningsLabel}>
              {live.inningsNumber === 2 ? "2nd Innings" : "1st Innings"}
            </Text>
          </View>

          <Text style={styles.liveTeamName} numberOfLines={1}>
            {battingTeam?.teamName || "Batting"}
          </Text>

          <View style={styles.liveScoreRow}>
            <Text style={styles.liveScore}>
              {live.runs}/{live.wickets}
            </Text>

            <Text style={styles.liveOvers}>
              ({live.overs}
              {match?.overs ? `/${match.overs}` : ""} ov)
            </Text>
          </View>

          <View style={styles.liveMetaRow}>
            <View style={styles.liveMetaItem}>
              <Text style={styles.liveMetaLabel}>CRR</Text>
              <Text style={styles.liveMetaValue}>{live.runRate}</Text>
            </View>

            {runsNeeded != null && (
              <View style={styles.liveMetaItem}>
                <Text style={styles.liveMetaLabel}>NEED</Text>
                <Text style={styles.liveMetaValue}>{runsNeeded}</Text>
              </View>
            )}

            {ballsRemaining != null && (
              <View style={styles.liveMetaItem}>
                <Text style={styles.liveMetaLabel}>BALLS LEFT</Text>
                <Text style={styles.liveMetaValue}>{ballsRemaining}</Text>
              </View>
            )}
          </View>

          {runsNeeded != null && ballsRemaining != null && (
            <Text style={styles.liveChase}>
              {runsNeeded === 0
                ? "Target reached"
                : `Need ${runsNeeded} run${runsNeeded === 1 ? "" : "s"} from ${ballsRemaining} ball${ballsRemaining === 1 ? "" : "s"}`}
            </Text>
          )}
        </View>
      )}

      {/* ── At the crease ─────────────────────────────────────── */}
      {hasCrease && (
        <View style={styles.card}>
          <View style={styles.creaseHeader}>
            <Text style={[styles.creaseCell, styles.creaseCellName]}>
              BATTER
            </Text>
            <Text style={styles.creaseCell}>R</Text>
            <Text style={styles.creaseCell}>B</Text>
          </View>

          {[striker, nonStriker].filter(Boolean).map((player, index) => (
            <View key={player._id || index} style={styles.creaseRow}>
              <Text
                style={[styles.creaseName, styles.creaseCellName]}
                numberOfLines={1}
              >
                {player.playerName}
                {index === 0 ? " *" : ""}
              </Text>

              <Text style={styles.creaseValue}>{player.runs ?? 0}</Text>
              <Text style={styles.creaseValue}>{player.balls ?? 0}</Text>
            </View>
          ))}

          {!!bowler && (
            <>
              <View style={[styles.creaseHeader, styles.creaseHeaderSecond]}>
                <Text style={[styles.creaseCell, styles.creaseCellName]}>
                  BOWLER
                </Text>
                <Text style={styles.creaseCell}>O</Text>
                <Text style={styles.creaseCell}>R</Text>
                <Text style={styles.creaseCell}>W</Text>
              </View>

              <View style={styles.creaseRow}>
                <Text
                  style={[styles.creaseName, styles.creaseCellName]}
                  numberOfLines={1}
                >
                  {bowler.playerName}
                </Text>

                <Text style={styles.creaseValue}>{bowler.overs ?? "0.0"}</Text>
                <Text style={styles.creaseValue}>{bowler.runs ?? 0}</Text>
                <Text style={styles.creaseValue}>{bowler.wickets ?? 0}</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* ── This over ─────────────────────────────────────────── */}
      {thisOver.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            This over{latestOver != null ? ` (${Number(latestOver) + 1})` : ""}
          </Text>

          <View style={styles.thisOverRow}>
            {thisOver.map((ball, index) => (
              <OutcomeChip key={ball._id || index} ball={ball} />
            ))}
          </View>
        </View>
      )}

      {/*
      | Ball-by-ball, using the same component as the scoring screen so a
      | spectator reads exactly what the scorer sees, in the same wording.
      */}
      <CommentarySection commentary={balls} />
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Player Of The Match
|--------------------------------------------------------------------------
|
| Only once the match is completed AND someone has named one. Plenty of
| matches never do, and an empty award card is worse than no card.
|
*/

const PlayerOfTheMatchCard = ({ match, onPressPlayer }) => {
  const potm = match?.playerOfTheMatch;

  if (match?.status !== "completed" || !potm?._id) {
    return null;
  }

  return (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={[styles.card, styles.potmCard]}
        onPress={() => onPressPlayer?.(potm._id)}
        activeOpacity={0.75}
      >
        <Text style={styles.potmLabel}>PLAYER OF THE MATCH</Text>

        <Text style={styles.potmName}>{potm.playerName}</Text>

        {!!potm.playerType && (
          <Text style={styles.potmRole}>{potm.playerType}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| Overs Tab
|--------------------------------------------------------------------------
|
| Ball-by-ball grouped by over. Each delivery is a chip so an over reads
| the way it does on a scorecard - 1 4 W . . 2 - rather than as prose.
|
*/

const BallChip = ({ ball }) => {
  const isWicket = ball.isWicket;

  const isExtra = !!ball.extraType;

  const label = isWicket ? "W" : String(ball.runs ?? 0);

  return (
    <View
      style={[
        styles.ballChip,
        isWicket && styles.ballChipWicket,
        !isWicket && isExtra && styles.ballChipExtra,
        !isWicket && !isExtra && ball.runs >= 4 && styles.ballChipBoundary,
      ]}
    >
      <Text
        style={[
          styles.ballChipText,
          (isWicket || ball.runs >= 4) && styles.ballChipTextStrong,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const OversTab = ({ overs, oversLoading }) => {
  if (oversLoading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!overs || overs.length === 0) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <Text style={styles.emptyText}>
            No overs bowled yet. Deliveries appear here as they are scored.
          </Text>
        </View>
      </View>
    );
  }

  /*
  | NEWEST OVER FIRST.
  |
  | The server returns overs in bowling order, which is the right order to
  | store them in and the wrong one to read: it puts over 1 at the top and
  | buries the over being bowled right now at the bottom of a growing list,
  | so following a live match meant scrolling further after every over.
  |
  | Sorted rather than reversed: a reverse only gives the right answer if
  | the server's order is exactly ascending, and it is a match with two
  | innings where that assumption quietly breaks. Sorting on innings then
  | over says what is meant - the last over of the innings in progress
  | first, then 19, 18, 17 and back through the first innings.
  |
  | Done here rather than on the server, because the Overs tab is the only
  | consumer that wants this order - the ball-by-ball timeline and the
  | scorecard both read the sequence forwards.
  |
  | The copy matters: sort() mutates, and `overs` is state shared with the
  | commentary list.
  */

  const newestFirst = [...overs].sort(
    (a, b) =>
      (b.inningsNumber || 1) - (a.inningsNumber || 1) || b.over - a.over,
  );

  return (
    <View style={styles.tabContent}>
      {newestFirst.map((over, index) => (
        <View
          key={`${over.inningsNumber}-${over.over}-${index}`}
          style={[styles.card, index === 0 && styles.overCardCurrent]}
        >
          <View style={styles.overHeader}>
            <Text style={styles.overTitle}>
              Over {over.over + 1}
              <Text style={styles.overInnings}>
                {"  "}Innings {over.inningsNumber}
                {over.battingTeamName ? ` · ${over.battingTeamName}` : ""}
              </Text>
            </Text>

            <Text style={styles.overSummary}>
              {over.runs} run{over.runs === 1 ? "" : "s"}
              {over.wickets > 0
                ? ` · ${over.wickets} wkt${over.wickets === 1 ? "" : "s"}`
                : ""}
            </Text>
          </View>

          {/* The bowler is the same all over, so it is named once. */}
          {!!(over.bowler || over.balls?.[0]?.bowler) && (
            <Text style={styles.overBowler}>
              {over.bowler || over.balls[0].bowler}
              {index === 0 ? "  ·  CURRENT OVER" : ""}
            </Text>
          )}

          <View style={styles.ballRow}>
            {(over.balls || []).map((ball, i) => (
              <BallChip key={ball._id || i} ball={ball} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

/*
| Six tabs, in the order a reader wants them: what the match is, what is
| happening now, what has happened, who is playing, how it happened ball by
| ball, and the moments worth remembering.
|
| The bar scrolls horizontally - six equal flex items would squeeze every
| label to two or three characters on a normal phone.
*/

const TABS = ["Info", "Live", "Scorecard", "Squads", "Overs", "Highlights"];

export default function MatchDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  /*
  | initialTab lets another screen open this one on a specific tab -
  | LiveScoringScreen's "Full Scorecard" link uses it. Validated against
  | TABS so a stale or misspelled value falls back to Info rather than
  | rendering nothing.
  */
  const { matchId, initialTab } = route.params || {};

  const [activeTab, setActiveTab] = useState(
    TABS.includes(initialTab) ? initialTab : "Info",
  );
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const [scorecard, setScorecard] = useState(null);
  const [scorecardLoading, setScorecardLoading] = useState(false);

  const [live, setLive] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);

  const [overs, setOvers] = useState(null);
  const [oversLoading, setOversLoading] = useState(false);

  /*
  | Commentary is derived from the over-by-over payload rather than fetched
  | separately - it is the same balls, already grouped, and the Live tab
  | flattens them back out. One request serves both tabs.
  */
  const [commentaryBalls, setCommentaryBalls] = useState([]);

  const commentary = commentaryBalls;

  const loadMatch = useCallback(async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getMatchByIdApi(matchId);
      setMatch(data);
    } catch (error) {
      console.error("[MatchDetailsScreen] Failed to load match:", error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useFocusEffect(
    useCallback(() => {
      loadMatch();
    }, [loadMatch]),
  );

  /*
  | Each tab fetches on first open and then keeps what it has. Loading all
  | six up front would fire four requests for a screen where most people
  | read Info and leave.
  |
  | Highlights is not here - HighlightsFeed fetches its own data.
  */

  /*
  |--------------------------------------------------------------------------
  | Tab Data
  |--------------------------------------------------------------------------
  |
  | Driven by activeTab in an effect, NOT by the tab's onPress.
  |
  | Loading on press meant the tab this screen OPENS on never fetched
  | anything: LiveScoringScreen's "Full Scorecard" link passes
  | initialTab: "Scorecard", the screen rendered that tab, and because
  | nobody had pressed it the request was never made - an empty Scorecard
  | on a match with a full one behind it.
  |
  | Each tab still fetches once and keeps what it has, so switching back
  | and forth costs nothing.
  |
  | Nothing here is gated on match.status. A match can be scored while its
  | status is still "upcoming" - only startMatch moves it, and the Quick
  | Score path can reach the scoring pad without that - so gating on it
  | left genuinely live matches with three empty tabs.
  */

  const handleTabPress = (tab) => setActiveTab(tab);

  /*
  |--------------------------------------------------------------------------
  | Tab Data
  |--------------------------------------------------------------------------
  |
  | Driven by activeTab, NOT by the tab's onPress: the tab this screen OPENS
  | on is never pressed, so loading on press left the "Full Scorecard" link
  | from live scoring landing on a permanently empty Scorecard.
  |
  | WHY A REF AND NOT THE LOADING FLAG
  |
  | This effect re-runs whenever loadMatch produces a new match object -
  | which useFocusEffect does on every focus. Using `if (loading) return` to
  | avoid duplicate requests meant a re-run mid-flight hit a flag its own
  | cancelled predecessor had set and returned early forever: the spinner
  | never cleared, and the only way out was to leave the screen and come
  | back, which is exactly the symptom.
  |
  | requestedRef records what has actually been ASKED for, survives re-runs,
  | and is cleared on failure so a retry is possible. Nothing here is
  | cancelled on re-run either - the request in flight is the one we want,
  | and dropping its result was the other half of the same bug.
  |
  | Keyed on matchId so opening a different match starts clean.
  */

  const requestedRef = useRef({ matchId: null, scorecard: false, overs: false, live: false });

  useEffect(() => {
    if (!match || !matchId) return;

    const flags = requestedRef.current;

    if (flags.matchId !== matchId) {
      requestedRef.current = {
        matchId,
        scorecard: false,
        overs: false,
        live: false,
      };
    }

    const asked = requestedRef.current;

    const loadScorecard = async () => {
      if (asked.scorecard) return;

      asked.scorecard = true;
      setScorecardLoading(true);

      try {
        setScorecard(await getScorecardByInningsApi(matchId));
      } catch (error) {
        console.error("[MatchDetailsScreen] Failed to load scorecard:", error);
        asked.scorecard = false;
      } finally {
        setScorecardLoading(false);
      }
    };

    const loadOvers = async () => {
      if (asked.overs) return;

      asked.overs = true;
      setOversLoading(true);

      try {
        const data = await getOverByOverApi(matchId);

        const list = Array.isArray(data) ? data : [];

        setOvers(list);

        /*
        | Commentary is the same balls, flattened newest-first, with the
        | sentence built here rather than fetched.
        |
        | Reading the server's stored commentaryText instead is what made
        | older deliveries read "1 run at 3.3": that line was written before
        | the server knew any names. Building from the fields means every
        | ball reads correctly regardless of when it was recorded.
        */

        setCommentaryBalls(
          list
            .flatMap((over) =>
              (over.balls || []).map((b) => ({
                ...b,
                inningsNumber: over.inningsNumber,
                over: `${over.over}.${b.ball}`,
                text: buildCommentaryLine(b) || b.commentaryText || "",
              })),
            )
            .reverse(),
        );
      } catch (error) {
        setOvers([]);
        setCommentaryBalls([]);
        asked.overs = false;
      } finally {
        setOversLoading(false);
      }
    };

    const loadLive = async () => {
      if (asked.live) return;

      asked.live = true;
      setLiveLoading(true);

      try {
        setLive(await getLiveMatchApi(matchId));
      } catch (error) {
        /*
        | Expected, not exceptional: the endpoint throws "No active innings
        | found" for a completed match or one between innings. Left as null
        | so LiveTab shows its own message rather than an error - and NOT
        | retried, because the answer will not change.
        */
        setLive(null);
      } finally {
        setLiveLoading(false);
      }
    };

    /*
    | Nothing here is gated on match.status. A match can be scored while its
    | status is still "upcoming" - only startMatch moves it, and Quick Score
    | can reach the scoring pad without that - so gating on it left
    | genuinely live matches with three empty tabs.
    */

    if (activeTab === "Scorecard") loadScorecard();

    if (activeTab === "Live") {
      loadLive();
      loadOvers();
    }

    if (activeTab === "Overs") loadOvers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, !!match, matchId]);

  const handleStartMatch = async () => {
    console.log("--- Start Match button pressed ---");
    if (!matchId) {
      console.log("--- NO matchId, aborting ---");
      return;
    }
    console.log("--- Start Match button pressed 2 ---");
    console.log("--- matchId:", matchId);

    try {
      console.log("--- Start Match button pressed 3 ---");
      setStarting(true);

      console.log("--- Navigating to SquadSelectionScreen ---");
      navigation.navigate("SquadSelectionScreen", {
        matchId,
        teamA: match.teamA,
        teamB: match.teamB,
      });
      console.log("--- navigation.navigate called ---");
    } catch (error) {
      console.log("--- Start Match button pressed 4 (CATCH) ---");
      console.log("--- error.name:", error?.name);
      console.log("--- error.message:", error?.message);
      console.log("--- error.response?.status:", error?.response?.status);
      console.log("--- error.response?.data:", error?.response?.data);
      console.log("--- full error:", error);
      Alert.alert(
        "Failed",
        error.response?.data?.message ||
          error.message ||
          "Could not start match setup.",
      );
    } finally {
      console.log("--- Start Match button pressed 5 ---");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={[styles.safe, styles.centered]}>
        <Text style={styles.emptyStateBody}>
          This match could not be found.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroCard match={match} canManage={match.canManage} />

        {match.canManage && match.isInviteSender && match.status === "upcoming" && (
          <TouchableOpacity
            style={[styles.startButton, starting && styles.startButtonDisabled]}
            onPress={handleStartMatch}
            disabled={starting}
          >
            {starting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.startButtonText}>Start Match</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScroll}
            contentContainerStyle={styles.tabScrollContent}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  activeTab === tab && styles.tabItemActive,
                ]}
                onPress={() => handleTabPress(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {activeTab === "Info" && <InfoTab match={match} />}

        {activeTab === "Live" && (
          <>
            <PlayerOfTheMatchCard
              match={match}
              onPressPlayer={(playerId) =>
                navigation.navigate("TeamStack", {
                  screen: "PlayerProfileScreen",
                  params: { playerId },
                })
              }
            />

            <LiveTab
              match={match}
              live={live}
              liveLoading={liveLoading}
              commentary={commentary}
            />
          </>
        )}

        {activeTab === "Scorecard" && (
          <ScorecardTab
            match={match}
            scorecard={scorecard}
            scorecardLoading={scorecardLoading}
            onPressPlayer={(playerId) =>
              navigation.navigate("TeamStack", {
                screen: "PlayerProfileScreen",
                params: { playerId },
              })
            }
          />
        )}

        {activeTab === "Squads" && (
          <SquadsTab
            match={match}
            onPressPlayer={(player) =>
              navigation.navigate("TeamStack", {
                screen: "PlayerProfileScreen",
                params: { playerId: player._id },
              })
            }
          />
        )}

        {activeTab === "Overs" && (
          <OversTab overs={overs} oversLoading={oversLoading} />
        )}

        {activeTab === "Highlights" && (
          <View style={styles.tabContent}>
            <HighlightsFeed matchId={matchId} nested />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface },
  centered: { alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Hero Card
  heroCard: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: C.surfaceVariant,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusBadge: {
    alignSelf: "flex-end",
    backgroundColor: C.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeLive: { backgroundColor: C.error },
  statusBadgeCancelled: { backgroundColor: C.outline },
  statusText: {
    color: C.onSecondaryContainer,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  teamCol: { flex: 1, alignItems: "center" },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  teamLogo: { width: 48, height: 48 },
  logoFallbackText: { fontSize: 18, fontWeight: "700", color: C.primary },
  teamName: {
    fontSize: 16,
    fontWeight: "700",
    color: C.onSurface,
    textAlign: "center",
  },
  vsCol: { alignItems: "center", paddingHorizontal: 12 },
  vsDivider: {
    width: 28,
    height: 1,
    backgroundColor: C.outlineVariant,
    marginVertical: 4,
  },
  vsText: {
    fontSize: 28,
    fontWeight: "800",
    color: `${C.primary}22`,
    letterSpacing: 1,
  },
  heroFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: `${C.surfaceVariant}80`,
    alignItems: "center",
  },
  heroFooterText: { fontSize: 13, color: C.onSurfaceVariant },
  heroTournament: {
    fontSize: 12,
    color: C.secondary,
    fontWeight: "700",
    marginTop: 4,
  },
  heroPinBadge: {
    marginTop: 10,
    backgroundColor: C.secondaryContainer,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroPinText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.onSecondaryContainer,
    letterSpacing: 1.5,
  },

  // Start Match Button
  startButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonDisabled: { opacity: 0.6 },
  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.surfaceVariant,
    marginTop: 20,
    backgroundColor: C.surface,
  },
  /*
  | Content-sized rather than flex:1 - six equal columns squeeze
  | "Highlights" and "Scorecard" down to a few characters on a phone.
  */
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },

  tabScroll: { flexGrow: 0, flexShrink: 0 },

  tabScrollContent: { alignItems: "center" },
  tabItemActive: { borderBottomColor: C.primary },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: C.onSurfaceVariant,
  },
  tabTextActive: { color: C.primary },

  // Tab Content
  tabContent: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },

  /*
  |--------------------------------------------------------------------------
  | Live
  |--------------------------------------------------------------------------
  |
  | The score card is the one dark-edged block on the page - it is the thing
  | a live page exists for, and it should not look like the cards under it.
  */

  liveCard: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.outlineVariant,
    borderTopWidth: 4,
    borderTopColor: C.error,
  },

  liveTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  liveDotRow: { flexDirection: "row", alignItems: "center" },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.error,
    marginRight: 5,
  },

  liveLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: C.error,
  },

  liveInningsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.onSurfaceVariant,
  },

  liveTeamName: {
    marginTop: 10,
    fontSize: 14.5,
    fontWeight: "700",
    color: C.onSurfaceVariant,
  },

  liveChase: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: C.secondary,
  },

  /*
  | At-the-crease table. Name flexes, figures sit in fixed columns with
  | tabular figures so they line up down the column.
  */

  creaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.outlineVariant,
  },

  creaseHeaderSecond: { marginTop: 14 },

  creaseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  creaseCell: {
    width: 40,
    textAlign: "right",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: C.onSurfaceVariant,
  },

  creaseCellName: { flex: 1, width: undefined, textAlign: "left" },

  creaseName: { fontSize: 13.5, fontWeight: "600", color: C.onSurface },

  creaseValue: {
    width: 40,
    textAlign: "right",
    fontSize: 13.5,
    fontWeight: "700",
    color: C.onSurface,
    fontVariant: ["tabular-nums"],
  },

  thisOverRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },

  outcomeChip: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceContainer,
  },

  outcomeChipSmall: { minWidth: 24, height: 24, borderRadius: 12 },
  outcomeChipWicket: { backgroundColor: C.error },
  outcomeChipFour: { backgroundColor: C.primaryContainer },
  outcomeChipSix: { backgroundColor: C.primary },
  outcomeChipExtra: { backgroundColor: C.secondaryContainer },
  outcomeChipText: { fontSize: 12.5, fontWeight: "700", color: C.onSurface },
  outcomeChipTextStrong: { color: "#ffffff" },

  liveScoreRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 8 },
  liveScore: { fontSize: 34, fontWeight: "800", color: C.primary },
  liveOvers: { marginLeft: 8, marginBottom: 5, fontSize: 14, color: C.onSurfaceVariant },
  liveMetaRow: { flexDirection: "row", marginTop: 16, gap: 12 },
  liveMetaItem: {
    flex: 1,
    backgroundColor: C.surfaceContainer,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  liveMetaLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: C.onSurfaceVariant,
  },
  liveMetaValue: { marginTop: 3, fontSize: 17, fontWeight: "800", color: C.onSurface },

  // Overs
  overHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  overTitle: { fontSize: 14, fontWeight: "800", color: C.onSurface },
  overInnings: { fontSize: 11, fontWeight: "600", color: C.outline },
  overSummary: { fontSize: 12, fontWeight: "700", color: C.primary },
  /*
  |--------------------------------------------------------------------------
  | Squads
  |--------------------------------------------------------------------------
  */

  squadGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 2,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.outlineVariant,
  },

  // The bench is secondary information and reads that way.
  squadGroupMuted: { opacity: 0.72 },

  squadGroupLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: C.primary,
  },

  squadGroupCount: {
    fontSize: 11,
    fontWeight: "700",
    color: C.onSurfaceVariant,
  },

  squadNote: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: C.onSurfaceVariant,
  },

  overBowler: { marginTop: 4, fontSize: 12, color: C.onSurfaceVariant },

  // The over being bowled right now sits at the top and is marked as such.
  overCardCurrent: { borderColor: C.primary, borderWidth: 1.5 },
  ballRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 6 },
  ballChip: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceContainer,
  },
  ballChipWicket: { backgroundColor: C.error },
  ballChipBoundary: { backgroundColor: C.primaryContainer },
  ballChipExtra: { backgroundColor: C.secondaryContainer },
  ballChipText: { fontSize: 12.5, fontWeight: "700", color: C.onSurface },
  ballChipTextStrong: { color: "#ffffff" },

  /*
  |--------------------------------------------------------------------------
  | Scorecard Tables
  |--------------------------------------------------------------------------
  |
  | Fixed-width numeric columns with tabular figures, so digits line up
  | down the column the way they do on a printed card. A proportional font
  | makes "1" and "8" different widths and the whole table wobbles.
  */

  inningsBlock: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.outlineVariant,
    overflow: "hidden",
    marginBottom: 12,
  },

  inningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#E8F5E9",
  },

  inningsTeam: { flex: 1, fontSize: 15, fontWeight: "800", color: C.primary },
  inningsScore: { fontSize: 15, fontWeight: "800", color: C.onSurface },
  inningsOvers: { marginLeft: 6, fontSize: 12, color: C.onSurfaceVariant },

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.surfaceContainer,
  },

  fowHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.surfaceContainer,
  },

  tableHeaderName: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "800",
    color: C.onSurfaceVariant,
  },

  tableHeaderCell: {
    width: 34,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "800",
    color: C.onSurfaceVariant,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: C.surfaceContainer,
  },

  tableNameCol: { flex: 1, marginRight: 6 },

  tableName: { fontSize: 13.5, fontWeight: "600", color: C.primary },

  tableDismissal: {
    marginTop: 2,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },

  tableDismissalNotOut: { color: C.outline, fontStyle: "italic" },

  tableCell: {
    width: 34,
    textAlign: "right",
    fontSize: 12.5,
    color: C.onSurface,
    fontVariant: ["tabular-nums"],
  },

  tableCellStrong: { fontWeight: "800" },

  tableCellWide: { width: 52 },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: C.surfaceContainer,
  },

  summaryLabel: { fontSize: 13, fontWeight: "800", color: C.onSurface },

  summaryValue: { fontSize: 13, fontWeight: "800", color: C.onSurface },

  summaryDetail: { fontSize: 11, fontWeight: "500", color: C.onSurfaceVariant },

  dnbBlock: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: C.surfaceContainer,
  },

  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    color: C.onSurfaceVariant,
    marginBottom: 4,
  },

  dnbText: { fontSize: 12.5, lineHeight: 18, color: C.onSurface },

  fowScore: { width: 52, fontWeight: "700" },

  resultBanner: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  resultBannerText: { fontSize: 13.5, fontWeight: "800", color: C.primary },

  potmCard: {
    borderWidth: 1,
    borderColor: C.secondaryContainer,
    backgroundColor: "#fffaf2",
  },

  potmLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: C.secondary,
  },

  potmName: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "800",
    color: C.onSurface,
  },

  potmRole: { marginTop: 2, fontSize: 12, color: C.onSurfaceVariant },

  /*
  | The Match PIN card referenced these three styles but none of them were
  | ever defined, so the PIN rendered at plain body size with no emphasis -
  | in the one place on the screen where a 4-digit code has to be readable
  | at a glance and read out correctly to the opposing captain.
  */
  pinCard: {
    borderWidth: 1,
    borderColor: C.secondaryContainer,
    backgroundColor: "#fffaf2",
  },
  pinValue: {
    marginTop: 6,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 6,
    color: C.secondary,
  },
  pinHint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: C.onSurfaceVariant,
  },

  // Card
  card: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: C.surfaceVariant,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.primary,
    marginBottom: 16,
  },

  pendingCard: { backgroundColor: "#fff8ef", borderColor: "#ffdca8" },
  pendingText: {
    color: "#8f4e00",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },

  // Info rows
  infoList: { gap: 16 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  infoIconWrap: {
    backgroundColor: C.surfaceContainer,
    padding: 8,
    borderRadius: 8,
  },
  infoIcon: { fontSize: 18 },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: C.onSurfaceVariant,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: { fontSize: 14, fontWeight: "600", color: C.onSurface },

  // Officials
  officialsGrid: { flexDirection: "row", gap: 12 },
  officialBox: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: 12,
  },
  officialLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: C.onSurfaceVariant,
    marginBottom: 4,
  },
  officialName: { fontSize: 14, color: C.onSurface, marginTop: 2 },

  // Squads
  squadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  teamToggle: {
    flexDirection: "row",
    backgroundColor: C.surfaceContainer,
    borderRadius: 8,
    padding: 4,
    maxWidth: "60%",
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 120,
  },
  toggleBtnActive: {
    backgroundColor: C.surfaceContainerLowest,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  toggleBtnText: { fontSize: 12, fontWeight: "600", color: C.onSurfaceVariant },
  toggleBtnTextActive: { color: C.onSurface },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  playerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${C.primary}1a`,
    overflow: "hidden",
  },
  playerPhotoPlaceholder: { flex: 1, backgroundColor: C.surfaceContainerHigh },
  playerName: { fontSize: 14, fontWeight: "600", color: C.onSurface },
  playerRole: { fontSize: 13, color: C.onSurfaceVariant },
  divider: { height: 1, backgroundColor: `${C.surfaceVariant}80` },
  /*
  | The empty state inside a card - "No overs bowled yet", "No players in
  | this team yet", and the two longer messages on Live and Scorecard.
  |
  | There were TWO emptyText keys in this stylesheet: a left-aligned
  | { fontSize: 13, lineHeight: 19 } up in the Live/Overs block, and this
  | one. A duplicate key in an object literal is silently overwritten by
  | the last one - no error, no warning - so the first was dead code that
  | still read as live, and all four messages were rendering with these
  | values whatever the block they sat next to implied.
  |
  | Merged into one. lineHeight comes from the dead definition because the
  | messages here run to two and three lines; everything else is what was
  | actually rendering already, so nothing moves on screen.
  */

  emptyText: {
    color: C.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingVertical: 20,
  },

  // Scorecard
  scorecardLoader: { marginTop: 20 },
  scorecardSubheading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: C.onSurfaceVariant,
    marginBottom: 8,
  },
  scorecardSubheadingSpaced: { marginTop: 12 },
  scorecardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${C.surfaceVariant}80`,
  },
  scorecardPlayerName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.onSurface,
    flex: 1,
    marginRight: 8,
  },
  scorecardFigure: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: "600",
  },

  // Empty States
  emptyStateCard: { alignItems: "center", paddingVertical: 40 },
  emptyStateIcon: { fontSize: 48, marginBottom: 12 },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.onSurface,
    marginBottom: 8,
  },
  emptyStateBody: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});
