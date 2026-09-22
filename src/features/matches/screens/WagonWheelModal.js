import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  AccessibilityInfo,
} from "react-native";

import Svg, {
  G,
  Defs,
  ClipPath,
  Circle,
  Ellipse,
  Rect,
  Line,
  Path,
  Text as SvgText,
} from "react-native-svg";

import { useNavigation, useRoute } from "@react-navigation/native";

import Ionicons from "@expo/vector-icons/Ionicons";

import useScoring from "../../scoring/hooks/useScoring";

import { setPendingBallResult } from "../utils/ballHandoff";

import { COLORS } from "../../../constants/colors";

/*
| The handoff lives in utils/ballHandoff.js now - see the note there for why
| route params could not carry it. Re-exported so any older import of
| consumePendingBallResult from this file still resolves.
*/

export { consumePendingBallResult } from "../utils/ballHandoff";

/*
|--------------------------------------------------------------------------
| The wagon wheel
|--------------------------------------------------------------------------
|
| WHAT WAS WRONG WITH THE OLD ONE
|
| Every zone name was one wedge out. The table started "Long On" at 0°, but
| 0° is STRAIGHT - straight back past the bowler - so the whole ring had
| rotated 45° and the leg-side names had walked round into the off side:
|
|     0°    was Long On      is Straight
|     180°  was Third Man    is Keeper (behind the stumps)
|     270°  was Cover        is Point
|     315°  was Long Off     is Cover
|
| The trigonometry was never the problem. atan2(dx, -dy) gives a clean
| clockwise-from-straight bearing and still does; only the list of names
| hanging off it was shifted. Every ball recorded until now carries a region
| string one wedge anticlockwise of where it actually went.
|
| Four labels also had to cover twelve o'clock positions, so Point and Cover
| were the same wedge and Backward Square and Fine Leg had no name at all.
| There are twelve wedges now, 30° each, which is what a scorer expects to
| read back.
|
| LEFT-HANDERS
|
| A left-hander's field is the mirror image. Recording a leftie's cover
| drive as "square leg" is not a rounding error - it is the opposite side of
| the ground - so there is a toggle, and it flips both the names and the
| labels drawn on the turf. `batterHand` can be passed in when the caller
| knows it and the toggle is then just a correction.
|
| WHAT MAKES THE FLIGHT LOOK THREE-DIMENSIONAL
|
| Two curves, not one:
|
|   the SHADOW runs dead straight along the turf, striker to landing spot
|   the BALL is that same point lifted off the ground by a height function
|
| The height is a run of parabolas, each shorter and lower than the one
| before, so a pushed single tips along the ground three times and a six
| never touches down at all. The ball's own shadow spreads and fades as it
| climbs, which is the cue that actually sells the height.
|
| Nothing here is decoration for its own sake: the arc is how a scorer sees
| at a glance whether a ball was hit along the ground or over the top, which
| is information the flat line never carried.
|
*/

const FIELD_PX = Math.min(320, Dimensions.get("window").width - 72);

/* Everything is drawn in a 400x400 box and scaled to fit. */
const VB = 400;
const CX = 200;
const CY = 200;
const R = 178; /* the rope */
const RING = 96; /* the 30-yard circle */

/*
|--------------------------------------------------------------------------
| The pitch sits in the middle; the batsman does not
|--------------------------------------------------------------------------
|
| BATSMAN AT THE TOP OF THE PITCH, BOWLER AT THE BOTTOM.
|
| The pitch is centred on the ground, which is where a pitch actually is -
| and it is SHORT, because a 22-yard strip on a 70-yard ground is about a
| sixth of the diameter, not a third. The previous strip ran from CY-18 to
| CY+74 to keep the batsman on the exact centre, and the price was a pitch
| sitting visibly low and twice as long as it should be.
|
| So the batsman stands where a batsman stands - at the TOP END of the
| pitch, a little above centre - and every shot line starts from THERE
| rather than from the middle of the circle. That is what a wagon wheel
| draws: lines from the striker, not from the centre of the ground.
|
| It costs one piece of arithmetic - see boundaryT - because the boundary is
| no longer the same distance away in every direction. It is nearer straight
| behind the batsman and further straight down the ground, which is true of
| a real ground too, so "carry 100%" now means the rope whichever way the
| ball went.
*/

const PITCH_LEN = 68;
const PITCH_NEAR = CY - PITCH_LEN / 2; /* batsman's end */
const PITCH_FAR = CY + PITCH_LEN / 2; /* bowler's end */

/* How far ABOVE the ground's centre the batsman stands. */
const BAT_OFFSET = 22;
const BX = CX;
const BY = CY - BAT_OFFSET;

const SAMPLES = 48;

/*
| Turf colours. Deliberately NOT from COLORS: the app's palette is a UI
| palette, and a cricket field is two mown greens and a sand-coloured pitch.
| Borrowing surfaceContainer for grass is how the old one ended up looking
| like a green button.
*/
const FIELD = {
  turfA: "#1f6b35",
  turfB: "#24763b",
  turfRing: "#2a8446",
  rope: "#eef3e6",
  pitch: "#cbbc92",
  pitchLine: "#f3ecd8",
  chalk: "rgba(255,255,255,0.55)",
  chalkSoft: "rgba(255,255,255,0.22)",
  shadow: "rgba(0,0,0,0.30)",
  ball: "#c02128",
  ballFour: "#c98a12",
  ballSix: "#c02128",
};

/*
| Twelve wedges, clockwise from straight, for a RIGHT-hand batter.
| Index = floor(((angle + 15) % 360) / 30) - the +15 centres each wedge on
| its own bearing rather than starting at it.
*/
const ZONES = [
  "Straight",
  "Long On",
  "Mid Wicket",
  "Square Leg",
  "Backward Square",
  "Fine Leg",
  "Keeper",
  "Third Man",
  "Backward Point",
  "Point",
  "Cover",
  "Long Off",
];

/* Shorter forms, because the labels sit on the turf and space is tight. */
const ZONES_SHORT = [
  "STRAIGHT",
  "LONG ON",
  "MID WKT",
  "SQ LEG",
  "BKWD SQ",
  "FINE LEG",
  "KEEPER",
  "THIRD MAN",
  "BKWD PT",
  "POINT",
  "COVER",
  "LONG OFF",
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/* ── Geometry ──────────────────────────────────────────────────────────── */

/* Unit vector for a bearing measured clockwise from screen-up. */
const dirOf = (angleDeg) => {
  const a = (angleDeg * Math.PI) / 180;

  return { sx: Math.sin(a), sy: -Math.cos(a) };
};

/*
| How far the rope is from the BATSMAN along a given bearing.
|
| The batsman is off-centre, so this is no longer just R. Solving
| |P + t·d| = R for the ray from the batsman gives
|
|     t = -(P·d) + sqrt((P·d)² - |P|² + R²)
|
| where P is the batsman's offset from the ground's centre. Straight behind
| him the answer is R - 22; straight down the ground it is R + 22, which is
| exactly the asymmetry a real ground has.
*/
const boundaryT = (angleDeg) => {
  const cos = Math.cos((angleDeg * Math.PI) / 180);
  const pd = BAT_OFFSET * cos;

  return (
    -pd + Math.sqrt(Math.max(0, pd * pd - BAT_OFFSET * BAT_OFFSET + R * R))
  );
};

/* A point `frac` of the way from the batsman to the rope on that bearing. */
const shotPoint = (angleDeg, frac) => {
  const d = dirOf(angleDeg);
  const t = boundaryT(angleDeg) * frac;

  return { x: BX + d.sx * t, y: BY + d.sy * t };
};

/*
| Zone labels ring the GROUND's centre, not the batsman's - otherwise the
| twelve of them sit lopsided inside the rope.
*/
const labelPoint = (angleDeg, frac) => {
  const d = dirOf(angleDeg);

  return { x: CX + d.sx * frac * R, y: CY + d.sy * frac * R };
};

/*
|--------------------------------------------------------------------------
| Screen bearing -> fielding position
|--------------------------------------------------------------------------
|
| Two conversions, in this order, and both matter:
|
| 1. THE FIELD IS DRAWN BATSMAN-AT-TOP, so the batsman plays DOWN the
|    screen. A tap is measured clockwise from screen-up, but the zone list
|    is written clockwise from STRAIGHT - and straight is now screen-down.
|    +180 turns one into the other. A rotation, not a reflection, so the
|    leg and off sides stay on their correct sides of the batsman.
|
| 2. A LEFT-HANDER's field is the mirror image, which is the 360 - a step.
|
| Then +15 before the divide, so each 30° wedge is CENTRED on its own
| bearing rather than starting at it - Straight covers 345°..15°, not
| 0°..30°.
*/

const zoneIndexFor = (screenAngle, hand) => {
  const playing = (screenAngle + 180) % 360;

  const a = hand === "L" ? (360 - playing) % 360 : playing;

  return Math.floor(((a + 15) % 360) / 30);
};

/*
| The reverse: where on screen zone `i` should have its label drawn.
| Derived from the same two conversions so a label can never drift from the
| wedge it names.
*/

const screenAngleForZone = (i, hand) =>
  hand === "L" ? (540 - i * 30) % 360 : (i * 30 + 180) % 360;

/*
| How far the ball goes and how high, by the runs scored. A single dribbles
| and stops inside the ring; a six clears the rope without bouncing.
*/
const flightProfile = (runs) => {
  const n = Number(runs);

  if (n >= 6) return { peak: 0.46, bounces: 0, carry: 1.06 };
  if (n === 5) return { peak: 0.30, bounces: 1, carry: 1.0 };
  if (n === 4) return { peak: 0.20, bounces: 1, carry: 1.0 };
  if (n === 3) return { peak: 0.11, bounces: 2, carry: 0.88 };
  if (n === 2) return { peak: 0.08, bounces: 2, carry: 0.70 };
  if (n === 1) return { peak: 0.06, bounces: 3, carry: 0.52 };

  return { peak: 0.05, bounces: 3, carry: 0.30 };
};

/*
| Normalised height (0..1 of peak) at ground-progress t.
|
| Each bounce covers a shorter slice of the ground than the one before it
| and reaches a lower peak, which is what a real ball does and what makes
| the arc read as a bounce rather than a wave.
*/
const heightAt = (t, bounces) => {
  if (bounces === 0) return Math.sin(Math.PI * Math.min(1, Math.max(0, t)));

  const spans = [];
  let w = 1;
  let total = 0;

  for (let i = 0; i <= bounces; i += 1) {
    spans.push(w);
    total += w;
    w *= 0.62;
  }

  for (let i = 0; i <= bounces; i += 1) spans[i] /= total;

  let start = 0;
  let decay = 1;

  for (let i = 0; i <= bounces; i += 1) {
    const end = start + spans[i];

    if (t <= end || i === bounces) {
      let local = (t - start) / (end - start);
      local = Math.max(0, Math.min(1, local));

      return Math.sin(Math.PI * local) * decay;
    }

    start = end;
    decay *= 0.42;
  }

  return 0;
};

/* ── The field, drawn once ─────────────────────────────────────────────── */

/* Three stumps at one end of the pitch. */
const Stumps = ({ y }) => (
  <G>
    {[-3.5, 0, 3.5].map((dx) => (
      <Line
        key={`st${y}-${dx}`}
        x1={CX + dx}
        y1={y - 3.5}
        x2={CX + dx}
        y2={y + 3.5}
        stroke="#10281a"
        strokeWidth={1.3}
        strokeOpacity={0.8}
      />
    ))}
  </G>
);

const FieldBackdrop = React.memo(function FieldBackdrop({ hand }) {
  /* Mown stripes, cut across the square the way a real ground is. */
  const stripes = [];

  for (let x = CX - R; x < CX + R; x += 34) {
    stripes.push(
      <Rect
        key={`s${x}`}
        x={x}
        y={CY - R}
        width={17}
        height={R * 2}
        fill={FIELD.turfB}
      />,
    );
  }

  /*
  | Wedge dividers, on the boundaries between zones rather than their
  | middles - and drawn FROM THE BATSMAN, because that is where the wedges
  | are measured from. Fanning them out of the ground's centre instead would
  | put a shot on one side of a line on screen and in the wedge on the other
  | side in the data.
  */
  const dividers = [];

  for (let i = 0; i < 12; i += 1) {
    const p = shotPoint(i * 30 + 15, 1);

    dividers.push(
      <Line
        key={`d${i}`}
        x1={BX}
        y1={BY}
        x2={p.x}
        y2={p.y}
        stroke={FIELD.chalkSoft}
        strokeWidth={1}
      />,
    );
  }

  const labels = [];

  for (let i = 0; i < 12; i += 1) {
    /* Mirror where the label sits, not just what it says. */
    const screenAngle = screenAngleForZone(i, hand);
    const p = labelPoint(screenAngle, 0.845);
    const s = Math.sin((screenAngle * Math.PI) / 180);

    labels.push(
      <SvgText
        key={`l${i}`}
        x={p.x}
        y={p.y + 3.5}
        fill={FIELD.chalk}
        fontSize={10.5}
        fontWeight="700"
        textAnchor={s > 0.35 ? "end" : s < -0.35 ? "start" : "middle"}
      >
        {ZONES_SHORT[i]}
      </SvgText>,
    );
  }

  return (
    <G>
      <Defs>
        <ClipPath id="ccWagonRope">
          <Circle cx={CX} cy={CY} r={R} />
        </ClipPath>
      </Defs>

      <G clipPath="url(#ccWagonRope)">
        <Circle cx={CX} cy={CY} r={R} fill={FIELD.turfA} />

        {stripes}

        <Circle
          cx={CX}
          cy={CY}
          r={RING}
          fill={FIELD.turfRing}
          fillOpacity={0.5}
        />

        {dividers}
      </G>

      {/* 30-yard circle */}
      <Circle
        cx={CX}
        cy={CY}
        r={RING}
        fill="none"
        stroke={FIELD.chalk}
        strokeWidth={1.5}
        strokeDasharray="5 7"
      />

      {/* The rope */}
      <Circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke={FIELD.rope}
        strokeWidth={4}
      />

      {/*
      |----------------------------------------------------------------
      | Which end is which
      |----------------------------------------------------------------
      |
      | Batsman at the TOP, bowler at the BOTTOM - the way the scorer is
      | standing when they watch the over.
      |
      | The batsman sits exactly ON the centre, which is the point every
      | shot line radiates from, so where the ball starts and where the
      | batsman stands are the same place. Keeper above them, pitch running
      | down to the bowler's end below.
      |
      | Turning the picture round means turning the ZONE NAMES round with
      | it - straight is now straight DOWN the screen, and the keeper is at
      | the top. That is the +180 inside zoneIndexFor; the two are one
      | decision and must never be changed apart, or every ball gets filed
      | under the position opposite the one it went to.
      */}

      <Rect
        x={CX - 13}
        y={PITCH_NEAR}
        width={26}
        height={PITCH_FAR - PITCH_NEAR}
        rx={2}
        fill={FIELD.pitch}
      />

      {/* Batting crease - the batsman stands just behind it */}
      <Line
        x1={CX - 13}
        y1={BY + 10}
        x2={CX + 13}
        y2={BY + 10}
        stroke={FIELD.pitchLine}
        strokeWidth={1.5}
      />

      {/* Bowling crease, at the far end */}
      <Line
        x1={CX - 13}
        y1={PITCH_FAR - 16}
        x2={CX + 13}
        y2={PITCH_FAR - 16}
        stroke={FIELD.pitchLine}
        strokeWidth={1.5}
      />

      <Stumps y={BY - 6} />
      <Stumps y={PITCH_FAR - 9} />

      {/* The keeper, behind the batsman's stumps */}
      <Circle
        cx={CX}
        cy={PITCH_NEAR - 14}
        r={3.5}
        fill="none"
        stroke={FIELD.chalk}
        strokeWidth={1.6}
      />

      {/* The batsman, dead on centre */}
      <Circle
        cx={BX}
        cy={BY}
        r={5.5}
        fill="#10281a"
        stroke={FIELD.pitchLine}
        strokeWidth={2}
      />

      {/* The bat, so the marker reads as a person holding one */}
      <Line
        x1={BX + 5}
        y1={BY - 2}
        x2={BX + 12}
        y2={BY - 9}
        stroke="#10281a"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      <SvgText
        x={BX + 20}
        y={BY - 4}
        fill={FIELD.chalk}
        fontSize={9.5}
        fontWeight="700"
        textAnchor="start"
      >
        BATSMAN
      </SvgText>

      {/* The bowler, at the far end */}
      <Circle
        cx={CX}
        cy={PITCH_FAR + 11}
        r={4}
        fill="none"
        stroke={FIELD.chalk}
        strokeWidth={2}
      />

      <SvgText
        x={CX + 20}
        y={PITCH_FAR + 14}
        fill={FIELD.chalk}
        fontSize={9.5}
        fontWeight="700"
        textAnchor="start"
      >
        BOWLER
      </SvgText>

      {labels}
    </G>
  );
});

/* ── Screen ────────────────────────────────────────────────────────────── */

export default function WagonWheelModal() {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    matchId,
    inningsId,
    runs,
    batsmanId,
    bowlerId,
    shotType,
    /* Optional. Pass "L" from the scoring screen when the striker's
       battingStyle is known and the toggle becomes a correction rather
       than a required step. */
    batterHand,
  } = route.params || {};

  /*
  | ballLoading, not loading: `loading` is shared by every scoring thunk in
  | the app, so an unrelated request in flight made Confirm silently refuse
  | to submit - no alert, no navigation, no ball recorded.
  */

  const { addBall, ballLoading } = useScoring();

  const [hand, setHand] = useState(batterHand === "L" ? "L" : "R");
  const [selection, setSelection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => {
        if (alive) setReduceMotion(!!on);
      })
      .catch(() => undefined);

    return () => {
      alive = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | The flight, sampled once per selection
  |--------------------------------------------------------------------------
  |
  | Recomputing the curve on every animation frame meant re-rendering fifty
  | SVG nodes sixty times a second, which stutters on a mid-range phone at
  | exactly the moment the scorer is watching it.
  |
  | Instead the path is sampled ONCE into a fixed list of points, and the
  | animation only drives interpolations across that list - so each frame
  | moves two circles and one dash offset, and the geometry never changes.
  */

  const flight = useMemo(() => {
    if (!selection) return null;

    const prof = flightProfile(runs);

    const reach = Math.min(
      1.08,
      selection.distance * prof.carry + (Number(runs) >= 6 ? 0.12 : 0),
    );

    const air = [];
    const ground = [];
    const lifts = [];

    for (let i = 0; i < SAMPLES; i += 1) {
      const p = i / (SAMPLES - 1);
      const g = shotPoint(selection.angle, reach * p);
      const lift = heightAt(p, prof.bounces) * prof.peak * R;

      ground.push(g);
      lifts.push(lift);
      air.push({ x: g.x, y: g.y - lift });
    }

    let d = "";
    let length = 0;

    for (let i = 0; i < air.length; i += 1) {
      d += `${i ? "L" : "M"}${air[i].x.toFixed(1)} ${air[i].y.toFixed(1)}`;

      if (i) {
        const dx = air[i].x - air[i - 1].x;
        const dy = air[i].y - air[i - 1].y;
        length += Math.sqrt(dx * dx + dy * dy);
      }
    }

    const input = air.map((_, i) => i / (SAMPLES - 1));
    const end = ground[ground.length - 1];

    return {
      d,
      length: Math.max(1, length),
      input,
      airX: air.map((p) => p.x),
      airY: air.map((p) => p.y),
      groundX: ground.map((p) => p.x),
      groundY: ground.map((p) => p.y),
      shadowRx: lifts.map((l) => 4.5 + l * 0.06),
      shadowRy: lifts.map((l) => 2 + l * 0.02),
      endX: end.x,
      endY: end.y,
      reach,
    };
  }, [selection, runs]);

  useEffect(() => {
    if (!flight) return;

    if (reduceMotion) {
      t.setValue(1);
      return;
    }

    t.setValue(0);

    Animated.timing(t, {
      toValue: 1,
      duration: 780,
      easing: Easing.out(Easing.quad),
      /* SVG attributes are not native-drivable. */
      useNativeDriver: false,
    }).start();
  }, [flight, reduceMotion, t]);

  /* ── Input ───────────────────────────────────────────────────────────── */

  const handleFieldPress = useCallback((event) => {
    const { locationX, locationY } = event.nativeEvent;

    /* Touch coordinates are in on-screen pixels; the drawing is 400 wide. */
    const scale = VB / FIELD_PX;
    const x = locationX * scale;
    const y = locationY * scale;

    /*
    | Measured from the BATSMAN, not the centre of the ground - the same
    | origin the lines are drawn from, so what is tapped and what is drawn
    | cannot disagree.
    */

    const dx = x - BX;
    const dy = y - BY;

    const reach = Math.sqrt(dx * dx + dy * dy);

    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    /*
    | Carry as a fraction of the rope IN THAT DIRECTION. Dividing by a flat
    | R would read over 100% behind the batsman, where the boundary is
    | nearer, and under 100% straight down the ground.
    */

    const dist = Math.min(1, reach / boundaryT(angle));

    /* A tap on the striker is almost always a mis-tap, not a shot to
       nowhere - ignore it rather than recording a zero-length ball. */
    if (dist < 0.06) return;

    setSelection({
      angle: Math.round(angle),
      distance: Number(dist.toFixed(2)),
    });
  }, []);

  const handleReset = () => setSelection(null);

  const zoneIdx = selection ? zoneIndexFor(selection.angle, hand) : -1;
  const regionName = zoneIdx >= 0 ? ZONES[zoneIdx] : "";

  /* ── Submit ──────────────────────────────────────────────────────────── */

  const handleConfirm = async () => {
    if (submitting || ballLoading || !selection) return;

    setSubmitting(true);

    try {
      /*
      | NO Promise.race timeout here any more.
      |
      | The race rejected at 15 seconds but could not cancel the request, so
      | on a slow connection the server still recorded the ball at ~16s
      | while the scorer read "Request timed out - try again". Tapping
      | Confirm again recorded the SAME delivery twice; not tapping it meant
      | the late result was pushed into Redux with afterBall never running,
      | so the over-complete, all-out and target checks were skipped for
      | that ball entirely.
      |
      | A write that may have succeeded must not be presented as a failure.
      | The request is allowed to finish and its real answer is used.
      */

      const result = await addBall({
        matchId,
        inningsId,
        batsmanId,
        bowlerId,
        runs,
        shotType: shotType || "",

        /*
        | region travels with the angle. It is computed here for the
        | on-screen label anyway, and sending it means the server stores the
        | zone the scorer actually saw - including the mirror applied for a
        | left-hander, which the server has no way to know about.
        */
        wagonWheel: {
          angle: selection.angle,
          distance: selection.distance,
          region: regionName,
        },
      });

      if (!result?.success) {
        Alert.alert("Failed", result?.error || "Could not record that ball.");
        return;
      }

      /*
      | The result goes through the handoff module and the navigation
      | carries NO params, so LiveScoringScreen's battingSquad, bowlingSquad
      | and target survive - see utils/ballHandoff.js.
      |
      | Navigating by name (rather than goBack) also pops ShotSelectionModal
      | underneath, so it does not reappear.
      */

      setPendingBallResult(result);

      navigation.navigate("LiveScoringScreen");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Could not record that ball.";

      Alert.alert("Failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = ballLoading || submitting;

  const trailColor =
    Number(runs) >= 6
      ? FIELD.ballSix
      : Number(runs) === 4
        ? FIELD.ballFour
        : FIELD.ball;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Ball Direction</Text>

            <Text style={styles.subtitle}>
              {runs === 1 ? "1 run" : `${runs} runs`}
              {shotType ? ` · ${shotType}` : ""}
            </Text>
          </View>

          <View style={styles.headerRight}>
            {/*
            | Which way round the field is. A left-hander's cover drive is a
            | right-hander's square leg, so this is not cosmetic - it decides
            | the name that gets written to the ball.
            */}
            <View style={styles.handToggle}>
              <TouchableOpacity
                style={[styles.handBtn, hand === "R" && styles.handBtnOn]}
                onPress={() => setHand("R")}
              >
                <Text
                  style={[styles.handText, hand === "R" && styles.handTextOn]}
                >
                  RH
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.handBtn, hand === "L" && styles.handBtnOn]}
                onPress={() => setHand("L")}
              >
                <Text
                  style={[styles.handText, hand === "L" && styles.handTextOn]}
                >
                  LH
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={COLORS.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={styles.fieldWrap}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleFieldPress}
        >
          <Svg width={FIELD_PX} height={FIELD_PX} viewBox={`0 0 ${VB} ${VB}`}>
            <FieldBackdrop hand={hand} />

            {flight && (
              <G>
                {/* The straight track along the turf */}
                <Line
                  x1={BX}
                  y1={BY}
                  x2={flight.endX}
                  y2={flight.endY}
                  stroke={FIELD.shadow}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray="2 5"
                />

                {/* The flight, revealed as the ball travels */}
                <AnimatedPath
                  d={flight.d}
                  fill="none"
                  stroke={trailColor}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeOpacity={0.9}
                  strokeDasharray={`${flight.length} ${flight.length}`}
                  strokeDashoffset={t.interpolate({
                    inputRange: [0, 1],
                    outputRange: [flight.length, 0],
                  })}
                />

                {/* Ball shadow - spreads and softens as the ball climbs */}
                <AnimatedEllipse
                  cx={t.interpolate({
                    inputRange: flight.input,
                    outputRange: flight.groundX,
                  })}
                  cy={t.interpolate({
                    inputRange: flight.input,
                    outputRange: flight.groundY,
                  })}
                  rx={t.interpolate({
                    inputRange: flight.input,
                    outputRange: flight.shadowRx,
                  })}
                  ry={t.interpolate({
                    inputRange: flight.input,
                    outputRange: flight.shadowRy,
                  })}
                  fill="rgba(0,0,0,0.32)"
                />

                {/* The cherry */}
                <AnimatedCircle
                  cx={t.interpolate({
                    inputRange: flight.input,
                    outputRange: flight.airX,
                  })}
                  cy={t.interpolate({
                    inputRange: flight.input,
                    outputRange: flight.airY,
                  })}
                  r={5}
                  fill={FIELD.ball}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              </G>
            )}
          </Svg>
        </View>

        <View style={styles.readout}>
          <View style={styles.readoutMain}>
            <Text style={styles.readoutLabel}>DIRECTION</Text>

            <Text
              style={[
                styles.readoutValue,
                !selection && styles.readoutValueMuted,
              ]}
              numberOfLines={1}
            >
              {selection ? regionName : "Tap the ground"}
            </Text>
          </View>

          {selection && (
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{selection.angle}°</Text>
                <Text style={styles.metricLabel}>ANGLE</Text>
              </View>

              <View style={styles.metric}>
                <Text style={styles.metricValue}>
                  {Math.round(selection.distance * 100)}%
                </Text>
                <Text style={styles.metricLabel}>CARRY</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={busy}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>

          {/*
          | Confirm stays disabled until the field has been tapped.
          |
          | It used to submit with selection === null, writing an empty
          | region - so a ball whose direction was never chosen looked
          | identical to one that had been recorded properly, and the
          | commentary had nothing to say about where it went.
          */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selection && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={busy || !selection}
          >
            {busy ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <>
                <Text style={styles.confirmText}>
                  {selection ? `Confirm · ${regionName}` : "Tap the ground first"}
                </Text>

                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.onPrimary}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },

  modal: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 20,
    padding: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  handToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 999,
    overflow: "hidden",
  },

  handBtn: {
    paddingHorizontal: 11,
    paddingVertical: 5,
  },

  handBtnOn: {
    backgroundColor: COLORS.primary,
  },

  handText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: COLORS.onSurfaceVariant,
  },

  handTextOn: {
    color: COLORS.onPrimary,
  },

  fieldWrap: {
    width: FIELD_PX,
    height: FIELD_PX,
    alignSelf: "center",
    borderRadius: FIELD_PX / 2,
    overflow: "hidden",
  },

  readout: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 13,
    borderRadius: 13,
    backgroundColor: COLORS.surfaceContainer,
  },

  readoutMain: { flex: 1 },

  readoutLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
  },

  readoutValue: {
    marginTop: 3,
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.primary,
  },

  readoutValueMuted: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
  },

  metrics: {
    flexDirection: "row",
    gap: 16,
  },

  metric: { alignItems: "flex-end" },

  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  metricLabel: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },

  resetButton: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  resetText: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "700",
  },

  confirmButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  confirmButtonDisabled: {
    opacity: 0.5,
  },

  confirmText: {
    color: COLORS.onPrimary,
    fontWeight: "800",
    marginRight: 8,
  },
});