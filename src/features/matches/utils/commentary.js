/*
|--------------------------------------------------------------------------
| Commentary
|--------------------------------------------------------------------------
|
| ONE builder, used by the scoring pad and by the match's Live tab, so a
| spectator reads exactly the sentence the scorer's screen shows.
|
| It used to live inside LiveScoringScreen. The Live tab therefore had no
| builder at all: it received balls straight from the over-by-over endpoint
| and rendered whatever `text` they carried - which was nothing, hence the
| empty commentary rows.
|
| THE SENTENCE
|
|     Imran to Shaid, 1 run, plays a straight drive towards long on.
|     Imran to Shaid, FOUR! A cover drive through cover for a boundary.
|     Imran to Shaid, SIX! A lofted drive over long on, clears the ropes.
|
| Bowler first, then batter, then the outcome, then how and where - the
| order every cricket follower already reads. The shot and the direction
| are on EVERY ball the scorer described, not only on boundaries.
|
| **double asterisks** mark emphasis; CommentarySection renders them bold.
|
| TWO BALL SHAPES
|
| The scoring pad holds populated documents (batsmanId is an object or an
| id needing a squad lookup); the over-by-over endpoint returns flattened
| rows where the names are already plain strings on `batsman` / `bowler`.
| Both are read here, so neither caller has to reshape anything.
|
*/

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

/*
| The region is stored on the ball, but balls recorded before that field
| existed only have the angle. Deriving the name from the angle recovers
| the direction for those instead of dropping half the sentence.
*/

export const regionName = (angle) => {
  if (angle == null || Number.isNaN(Number(angle))) return "";

  const region = REGIONS.find((r) => Number(angle) <= r.max);

  return region ? region.name : "Long On";
};

const PLACEHOLDER_NAMES = ["select player", "undefined", "null", ""];

const cleanName = (value) => {
  const text = String(value || "").trim();

  return PLACEHOLDER_NAMES.includes(text.toLowerCase()) ? "" : text;
};

/*
| Names are read in order of trustworthiness: a plain string the server
| already resolved, then a populated document, then a squad lookup through
| the caller's resolver. A ball whose player cannot be named at all reads
| "the bowler" / "the batter" rather than printing an id.
*/

const nameFrom = (ball, keys, resolve, fallback) => {
  for (const key of keys) {
    const value = ball?.[key];

    if (!value) continue;

    if (typeof value === "string") {
      const direct = cleanName(value);

      // A 24-character hex string is an id, not a name.
      if (direct && !/^[0-9a-f]{24}$/i.test(direct)) return direct;
    }

    if (typeof value === "object" && value.playerName) {
      const populated = cleanName(value.playerName);

      if (populated) return populated;
    }

    if (resolve) {
      const resolved = cleanName(resolve(value));

      if (resolved) return resolved;
    }
  }

  return fallback;
};

const lower = (value) => String(value || "").trim().toLowerCase();

/*
| The descriptive half of the line.
|
| Never emit a dangling preposition: the scorer can only skip so much, and
| "plays a shot to ." is worse than saying nothing. Each half appears only
| when it exists, and a defensive shot gets its own verb because "plays a
| defensive" is not English.
*/

const shotClause = (shot, region, preposition = "towards") => {
  const s = lower(shot);
  const r = lower(region);

  const defensive = s.includes("defensive") || s.includes("block");

  if (defensive) {
    return r ? `defends it towards ${r}` : "defends it";
  }

  if (s && r) return `plays a ${s} ${preposition} ${r}`;

  if (s) return `plays a ${s}`;

  if (r) return `works it ${preposition} ${r}`;

  return "";
};

const sentence = (head, clause) =>
  clause ? `${head}, ${clause}.` : `${head}.`;

export const buildCommentaryLine = (ball, options = {}) => {
  if (!ball) return "";

  const { resolveBatsman, resolveBowler, resolveFielder } = options;

  const batter = nameFrom(
    ball,
    ["batsman", "batsmanName", "batsmanId"],
    resolveBatsman,
    "the batter",
  );

  const bowler = nameFrom(
    ball,
    ["bowler", "bowlerName", "bowlerId"],
    resolveBowler,
    "the bowler",
  );

  const opener = `**${bowler}** to **${batter}**`;

  const shot = String(ball.shotType || "").trim();

  const region = String(
    ball.wagonWheel?.region || regionName(ball.wagonWheel?.angle) || "",
  ).trim();

  const runs = Number(ball.runs ?? 0);

  /*
  |------------------------------------------------------------------
  | Wickets
  |------------------------------------------------------------------
  |
  | The dismissal is the story. The shot is dropped entirely here - on a
  | wicket ball nobody wants to read about the stroke before the news.
  */

  if (ball.isWicket) {
    const raw = String(ball.wicketType || "");
    const type = raw.toLowerCase();

    const fielder = nameFrom(
      ball,
      ["fielder", "fielderName", "fielderId"],
      resolveFielder,
      "",
    );

    if (type.includes("caught") && fielder) {
      return `${opener}, **OUT!** Caught by **${fielder}**.`;
    }

    if (type.includes("run") && fielder) {
      return `${opener}, **OUT!** Run out by **${fielder}**.`;
    }

    if (type.includes("stump") && fielder) {
      return `${opener}, **OUT!** Stumped by **${fielder}**.`;
    }

    if (type.includes("lbw")) return `${opener}, **OUT!** LBW.`;

    if (type.includes("bowled")) return `${opener}, **OUT!** Bowled.`;

    return `${opener}, **OUT!**${raw ? ` ${raw}.` : ""}`;
  }

  /*
  |------------------------------------------------------------------
  | Extras
  |------------------------------------------------------------------
  |
  | No shot is played off a wide, and byes are by definition a ball the
  | bat missed - so no shot clause on any of them.
  */

  if (ball.extraType === "wide") {
    return `${opener}, **WIDE**${
      runs > 1 ? `, ${runs - 1} extra run${runs - 1 !== 1 ? "s" : ""}` : ""
    }.`;
  }

  if (ball.extraType === "noBall") {
    const clause = shotClause(shot, region);

    return `${opener}, **NO BALL**${clause ? `, ${clause}` : ""}.`;
  }

  if (ball.extraType === "bye") {
    return `${opener}, ${runs} bye${runs !== 1 ? "s" : ""}.`;
  }

  if (ball.extraType === "legBye") {
    return `${opener}, ${runs} leg bye${runs !== 1 ? "s" : ""}.`;
  }

  /*
  |------------------------------------------------------------------
  | Off the bat
  |------------------------------------------------------------------
  |
  | Boundaries get the word "boundary" and the preposition that matches
  | how the ball travelled - a four goes THROUGH a fielding position, a
  | six goes OVER it.
  */

  if (runs === 4) {
    const clause = shotClause(shot, region, "through");

    return clause
      ? `${opener}, **FOUR!** ${
          clause.charAt(0).toUpperCase() + clause.slice(1)
        }, races away to the **boundary**.`
      : `${opener}, **FOUR!** Finds the **boundary**.`;
  }

  if (runs === 6) {
    const clause = shotClause(shot, region, "over");

    return clause
      ? `${opener}, **SIX!** ${
          clause.charAt(0).toUpperCase() + clause.slice(1)
        }, clears the **boundary**.`
      : `${opener}, **SIX!** Over the **boundary**.`;
  }

  if (runs === 0) {
    return sentence(`${opener}, **no run**`, shotClause(shot, region));
  }

  return sentence(
    `${opener}, **${runs} run${runs !== 1 ? "s" : ""}**`,
    shotClause(shot, region),
  );
};

export default buildCommentaryLine;
