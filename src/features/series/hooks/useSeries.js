/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Series
|
| File:
| useSeries.js
|
| Description:
| One series' data for whichever screen is showing it.
|
| Same lazy-per-tab pattern as useTournament: each section is fetched the
| first time it is asked for and kept afterwards, because most people open
| a series, read the scoreline, and leave - loading fixtures, stats and
| awards up front would be three wasted requests for the majority.
|
| The scoreline is the exception and loads with the series itself. It is
| the headline - the one number the screen exists to show - and fetching
| it a beat later would mean the hero renders "—" and then pops.
|
|--------------------------------------------------------------------------
*/

import { useCallback, useRef, useState } from "react";

import {
  getSeriesApi,
  getSeriesFixturesApi,
  getScorelineApi,
  getSeriesStatsApi,
  getSeriesAwardsApi,
} from "../services/series.service";

export default function useSeries(seriesId) {
  const [series, setSeries] = useState(null);

  const [scoreline, setScoreline] = useState(null);

  const [fixtures, setFixtures] = useState([]);

  const [stats, setStats] = useState(null);

  const [awards, setAwards] = useState({
    awards: [],
    leaderboards: {},
    prizes: [],
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const requested = useRef({
    id: null,
    fixtures: false,
    stats: false,
    awards: false,
  });

  const load = useCallback(
    async (silent = false) => {
      if (!seriesId) {
        setLoading(false);

        return null;
      }

      if (!silent) setLoading(true);

      try {
        /*
        | allSettled, not all. The scoreline is a second endpoint and a
        | failure there must not blank the whole screen - a series with a
        | missing scoreline is still worth reading.
        */

        const [detail, line] = await Promise.allSettled([
          getSeriesApi(seriesId),
          getScorelineApi(seriesId),
        ]);

        if (detail.status === "fulfilled") {
          setSeries(detail.value);

          setError(null);
        } else {
          setError(
            detail.reason?.response?.data?.message || "Series load nahi hua.",
          );
        }

        if (line.status === "fulfilled") setScoreline(line.value);

        return detail.status === "fulfilled" ? detail.value : null;
      } finally {
        setLoading(false);
      }
    },
    [seriesId],
  );

  const loadSection = useCallback(
    async (section, force = false) => {
      if (!seriesId) return;

      if (requested.current.id !== seriesId) {
        requested.current = {
          id: seriesId,
          fixtures: false,
          stats: false,
          awards: false,
        };
      }

      if (requested.current[section] && !force) return;

      requested.current[section] = true;

      try {
        if (section === "fixtures") {
          setFixtures(await getSeriesFixturesApi(seriesId));
        }

        if (section === "stats") {
          setStats(await getSeriesStatsApi(seriesId));
        }

        if (section === "awards") {
          setAwards(await getSeriesAwardsApi(seriesId));
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
    [seriesId],
  );

  return {
    series,
    scoreline,
    fixtures,
    stats,
    awards,

    loading,
    error,

    reload: load,
    loadSection,

    isOrganizer: !!series?.isOrganizer,

    /*
    | A captain of either side, or a player on either team's roster. Used
    | for the "you are in this" strips - NOT for hiding anything. Only the
    | Settings tab is gated, and that is by isOrganizer.
    */

    isParticipant: !!series?.isParticipant,

    myRole: series?.myRole || "viewer",

    myInvite: series?.myInvite || null,

    hasFixtures: !!series?.fixturesGeneratedAt,

    hasOpponent: series?.opponentStatus === "accepted",

    isFinished: series?.status === "completed",
  };
}
