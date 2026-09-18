import { useState, useEffect, useCallback } from "react";

import { getTeamInvitationsApi } from "../services/team.service";

/*
|--------------------------------------------------------------------------
| useTeamInvitations - who has been invited, and what did they say
|--------------------------------------------------------------------------
|
|     const { rows, statusOf, pending, reload } = useTeamInvitations(teamId);
|
|     statusOf(playerId)  -> "PENDING" | "ACCEPTED" | "REJECTED" | ... | null
|     rows                -> every invitation, newest first
|     pending             -> just the outstanding ones
|
| WHY A HOOK AND NOT REDUX
|
| Three screens need this - the squad list on Add Player, the players tab
| on a team profile, and the invite screen - and none of them need to share
| the result with each other. A slice would mean an extra reducer, an extra
| thunk and a cache to invalidate, for data that is cheap to refetch and
| stale the moment somebody accepts on their own phone.
|
| A FAILURE HERE MUST NOT EMPTY THE SQUAD
|
| If the request fails, `rows` stays empty and statusOf returns null - so
| every player renders WITHOUT a ribbon rather than the list breaking or
| showing everyone as pending. The squad is still correct; only the extra
| annotation is missing.
*/

export default function useTeamInvitations(teamId) {
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);

    try {
      const data = await getTeamInvitationsApi(teamId);

      setRows(Array.isArray(data) ? data : []);
    } catch {
      /* Deliberately silent - see the note above. */
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    reload();
  }, [reload]);

  /*
  | playerId comes back populated, so it is an object here and a string in
  | team.players. Compared as strings either way rather than assuming.
  |
  | Rows are sorted newest-first by the server, so the FIRST match is the
  | current one. That matters: a player who was invited, declined, and then
  | invited again has two rows, and the old REJECTED must not win.
  */
  const statusOf = useCallback(
    (playerId) => {
      const id = String(playerId?._id || playerId || "");

      if (!id) return null;

      const found = rows.find(
        (row) => String(row?.playerId?._id || row?.playerId) === id,
      );

      return found?.status || null;
    },
    [rows],
  );

  return {
    rows,
    loading,
    reload,
    statusOf,
    pending: rows.filter((row) => row?.status === "PENDING"),
  };
}
