/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| useTournament.js
|
| Description:
| One tournament's data for whichever screen is showing it.
|
| The five tabs each need something different, and loading all five up
| front means four wasted requests for the majority who read Overview and
| leave. So each section is fetched the first time it is asked for and
| kept afterwards - the same pattern MatchDetailsScreen already uses.
|
|--------------------------------------------------------------------------
*/

import { useCallback, useRef, useState } from "react";

import {
  getTournamentApi,
  getFixturesApi,
  getPointsTableApi,
  getTournamentStatsApi,
  getAwardsApi,
} from "../services/tournament.service";

export default function useTournament(tournamentId) {
  const [tournament, setTournament] = useState(null);

  const [fixtures, setFixtures] = useState([]);

  const [table, setTable] = useState([]);

  const [stats, setStats] = useState(null);

  /*
  | Awards and every leaderboard behind them, in one payload. The Awards
  | tab and the Stats tab both read it, which is deliberate - two counters
  | over the same deliveries would disagree eventually, and then an award
  | names a player the stats tab has in second place.
  */

  const [awards, setAwards] = useState({ awards: [], leaderboards: {}, prizes: [] });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  /*
  | What has already been ASKED for, keyed by tournament so opening a
  | different one starts clean.
  |
  | A ref rather than a loading flag because this survives re-renders: a
  | flag set by a request that was then superseded leaves the section
  | permanently "loading" with nothing in flight.
  */

  const requested = useRef({
    id: null,
    fixtures: false,
    table: false,
    stats: false,
    awards: false,
  });

  const load = useCallback(
    async (silent = false) => {
      if (!tournamentId) {
        setLoading(false);

        return null;
      }

      if (!silent) setLoading(true);

      try {
        const data = await getTournamentApi(tournamentId);

        setTournament(data);

        setError(null);

        return data;
      } catch (err) {
        setError(
          err?.response?.data?.message || "Tournament load nahi hua.",
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [tournamentId],
  );

  const loadSection = useCallback(
    async (section, force = false) => {
      if (!tournamentId) return;

      if (requested.current.id !== tournamentId) {
        requested.current = {
          id: tournamentId,
          fixtures: false,
          table: false,
          stats: false,
          awards: false,
        };
      }

      if (requested.current[section] && !force) return;

      requested.current[section] = true;

      try {
        if (section === "fixtures") {
          setFixtures(await getFixturesApi(tournamentId));
        }

        if (section === "table") {
          setTable(await getPointsTableApi(tournamentId));
        }

        if (section === "stats") {
          setStats(await getTournamentStatsApi(tournamentId));
        }

        if (section === "awards") {
          setAwards(await getAwardsApi(tournamentId));
        }
      } catch {
        /*
        | Cleared so a retry is possible. Leaving it true would mean one
        | failed request permanently empties that tab with no way back
        | except leaving the screen.
        */

        requested.current[section] = false;
      }
    },
    [tournamentId],
  );

  return {
    tournament,
    fixtures,
    table,
    stats,
    awards,

    loading,
    error,

    reload: load,
    loadSection,

    /*
    | Convenience reads so each screen does not re-derive the same three
    | questions from the payload.
    */

    isOrganizer: !!tournament?.isOrganizer,

    /*
    | A captain of an entered team, or a player in one of their registered
    | squads. Used for the "you are in this" strips and the my-matches
    | filter - NOT for hiding anything, because fixtures, scorecards, the
    | table, stats and awards are open to everyone. A tournament is a
    | public event; only the Settings tab is gated, and that is by
    | isOrganizer.
    */

    isParticipant: !!tournament?.isParticipant,

    myRole: tournament?.myRole || "viewer",

    myInvite: tournament?.myInvite || null,

    hasFixtures: !!tournament?.fixturesGeneratedAt,

    showsTable: tournament?.format !== "Knockout",

    isFinished: tournament?.status === "completed",
  };
}
