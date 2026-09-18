import { useState, useRef, useCallback, useEffect } from "react";

import { checkTeamNamesApi } from "../services/team.service";

/*
|--------------------------------------------------------------------------
| useNameAvailability - is this team name / short name already taken?
|--------------------------------------------------------------------------
|
|     const names = useNameAvailability({ teamName, shortName });
|
|     names.errors.teamName   -> "" or the message to show under the field
|     names.checking          -> a request is in flight
|     names.blocked           -> either name is taken; disable submit
|     names.onBlur("teamName")-> wire to the field's onBlur
|
| Pass `excludeTeamId` on an edit screen so a team does not collide with
| its own name.
|
| ─────────────────────────────────────────────────────────────────────────
|
| CHECKED ON BLUR, NOT WHILE TYPING
|
| The earlier version fired on a debounce as the user typed. It worked, but
| it is the wrong behaviour for this field:
|
|   HALF-TYPED NAMES ARE NOT REAL NAMES. Typing "Delhi Warriors" asks about
|   "De", "Del", "Delh"... Every one of those is a database query about a
|   name nobody is trying to use.
|
|   THE ERROR FLICKERS. "D" is free, "De" is free, "Delhi Warriors" is
|   taken - so the message appears, vanishes and reappears while the user is
|   mid-word. Errors that move while you type read as a broken form.
|
|   IT WAKES A SLEEPING SERVER REPEATEDLY. On Render's free tier the first
|   request after an idle period can take up to fifty seconds. Firing one
|   per keystroke is the worst possible pattern against it.
|
| Blur means "I have finished this field", which is exactly when the
| question becomes worth asking. One field, one request.
|
| ─────────────────────────────────────────────────────────────────────────
|
| THE OTHER THINGS THIS HAS TO GET RIGHT
|
| 1. AN ERROR MUST NOT OUTLIVE THE VALUE IT WAS ABOUT. Blur "Delhi
|    Warriors", see it is taken, then start editing: the red message has to
|    go immediately, not sit there contradicting the field until the next
|    blur. An effect clears it the moment the value differs from whatever
|    was last checked.
|
| 2. THE SAME VALUE IS NOT RE-CHECKED. Tabbing back and forth between two
|    fields should not fire a request each time.
|
| 3. STALE RESPONSES ARE DISCARDED. Blur teamName, then blur shortName
|    before the first answer lands - responses do not arrive in order, and a
|    late one must not overwrite a newer verdict. Every request carries a
|    sequence number.
|
| 4. A NETWORK FAILURE IS NOT "TAKEN". If the request fails there is no
|    error and the button stays enabled. Blocking submission because a
|    check could not run means a user on bad signal cannot create a team at
|    all. The server enforces uniqueness on write, so the worst case is one
|    honest error on submit instead of a form that will not move.
*/

/* Below this there is nothing worth asking the server about. */
const MIN_LENGTH = { teamName: 2, shortName: 2 };

const EMPTY = { teamName: "", shortName: "" };

export default function useNameAvailability({
  teamName = "",
  shortName = "",
  excludeTeamId,
} = {}) {
  const [errors, setErrors] = useState(EMPTY);

  const [checking, setChecking] = useState(false);

  /* The value each field held when it was last sent to the server. */
  const checked = useRef({ teamName: null, shortName: null });

  const sequence = useRef(0);

  const values = { teamName, shortName };

  /*
  | Point 1 above: drop a field's error as soon as its value moves away from
  | the one that produced it.
  */
  useEffect(() => {
    setErrors((previous) => {
      let next = previous;

      for (const field of ["teamName", "shortName"]) {
        if (
          previous[field] &&
          checked.current[field] !== null &&
          String(values[field]).trim() !== checked.current[field]
        ) {
          if (next === previous) next = { ...previous };
          next[field] = "";
        }
      }

      return next;
    });
  }, [teamName, shortName]);

  const onBlur = useCallback(
    async (field) => {
      const value = String(values[field] || "").trim();

      /* Too short to be a real name - the required-field check covers it. */
      if (value.length < MIN_LENGTH[field]) {
        checked.current[field] = null;
        return;
      }

      /* Point 2: already asked about exactly this. */
      if (checked.current[field] === value) return;

      checked.current[field] = value;

      const mine = ++sequence.current;

      setChecking(true);

      try {
        const response = await checkTeamNamesApi({
          [field]: value,
          excludeTeamId,
        });

        /* Point 3: a newer request has since been sent. */
        if (mine !== sequence.current) return;

        const result = response?.data?.[field];

        setErrors((previous) => ({
          ...previous,
          [field]: result && !result.available ? result.message : "",
        }));
      } catch {
        /*
        | Point 4. Deliberately silent, and the value is forgotten so a
        | later blur retries rather than trusting a check that never ran.
        */
        if (mine === sequence.current) {
          checked.current[field] = null;

          setErrors((previous) => ({ ...previous, [field]: "" }));
        }
      } finally {
        if (mine === sequence.current) setChecking(false);
      }
    },
    [teamName, shortName, excludeTeamId],
  );

  return {
    errors,
    checking,
    blocked: !!errors.teamName || !!errors.shortName,
    onBlur,
  };
}
