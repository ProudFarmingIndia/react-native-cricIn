import React, { useState, useRef, useEffect, useCallback } from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import useAuth from "../hooks/useAuth";

import { verifyOtp, sendOtp } from "../store/authSlice";

import { COLORS } from "../../../constants/colors";
import { SPACING } from "../../../constants/spacing";

import { findCountry, formatNational } from "../../../constants/countries";

import PrimaryButton from "../../../components/Button/PrimaryButton";

const OTP_LENGTH = 6;

/*
|--------------------------------------------------------------------------
| Verify OTP
|--------------------------------------------------------------------------
|
| FIVE THINGS THE PREVIOUS VERSION DID NOT DO.
|
| 1. IT NEVER TOLD THE USER ANYTHING WENT WRONG.
|
|    handleVerifyOtp logged the result and, on failure, did nothing at all.
|    A wrong code, an expired code, a rate limit - all produced a button
|    press followed by silence. Every one of those now has a message on
|    screen, including the server's "2 attempts remaining".
|
| 2. AUTOFILL DID NOT WORK, AND COULD NOT.
|
|    Each box had maxLength={1} and no autofill hint. iOS delivers the whole
|    six-digit code to a single field, so it was discarded; Android was
|    never asked to offer it. Both hints are now set, and handleChange
|    spreads a multi-character value across the boxes - which is also what
|    makes pasting work.
|
| 3. THE COUNTRY CODE WAS HARDCODED.
|
|    "+91 {phone}" is right today and becomes a lie the moment a second
|    country is switched on. The dial code now travels from the login
|    screen alongside the number.
|
| 4. EDIT SENT THE NUMBER BACK BUT LOGIN NEVER READ IT.
|
|    navigation.replace("Login", { phone }) passed a prefill that the login
|    screen ignored, so "Edit" cleared the field and made the user type all
|    ten digits again. LoginScreen now reads it.
|
| 5. THE BUTTON WAS NEVER DISABLED.
|
|    Same bug as the login screen: PrimaryButton accepts `loading` and
|    `disabled` and neither was passed, so it could be tapped repeatedly
|    while a verify was already in flight - burning attempts against the
|    server's cap.
|
*/

export default function OtpScreen({ navigation, route }) {
  const { verifyOTP, sendOTP, loading } = useAuth();

  const {
    phone = "",
    countryCode = "IN",
    dialCode,
    resendAfterSeconds = 30,
    delivered: routeDelivered = true,

    /*
    | Set by the server while the build is in testing: one fixed code works
    | for every number and no SMS is sent. Both default to off, so the
    | banner below simply stops rendering the day real OTPs are switched
    | on - there is nothing here to remember to take out.
    */
    testingMode = false,
    testingOtp = "",
  } = route.params || {};

  const country = findCountry(countryCode);

  const displayDial = dialCode || country.dialCode;

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [seconds, setSeconds] = useState(resendAfterSeconds);
  const [resending, setResending] = useState(false);

  /*
  |----------------------------------------------------------------------
  | IS THERE ACTUALLY A CODE ON ITS WAY?
  |----------------------------------------------------------------------
  |
  | This screen used to assume there was. It always said "Wrong number?
  | Change it" and always ran a resend countdown - which reads as an
  | accusation when everything worked, and as a lie when nothing was sent.
  |
  | `sendFailed` is set when a RESEND is refused. Arriving here at all
  | means the first send succeeded, because LoginScreen only navigates on
  | sendOtp.fulfilled - so it starts false.
  |
  | When it is true there is no code in flight: the countdown and the
  | resend button are hidden (there is nothing to count down TO), and the
  | screen offers the only thing that can help - changing the number.
  */

  const [sendFailed, setSendFailed] = useState(false);

  /*
  | The server tells us whether an SMS really left. In development, with no
  | MSG91 credentials, it generates the code and prints it to the console -
  | which is useful, but the app must not pretend a message was sent.
  */

  const [delivered, setDelivered] = useState(routeDelivered !== false);

  const inputs = useRef([]);

  /*
  | Guards the auto-submit below. Without it, a failed verify leaves six
  | digits in the boxes and the effect fires again immediately, spending
  | every remaining attempt in a fraction of a second.
  */
  const submittedFor = useRef("");

  const code = digits.join("");

  /* ── Resend countdown ─────────────────────────────────────────────── */

  useEffect(() => {
    if (seconds <= 0) return undefined;

    const timer = setInterval(() => {
      setSeconds((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  /* ── Entry ─────────────────────────────────────────────────────────── */

  const focusBox = (index) => {
    if (index < 0 || index >= OTP_LENGTH) return;
    inputs.current[index]?.focus();
  };

  const handleChange = (text, index) => {
    const clean = String(text || "").replace(/\D/g, "");

    if (error) setError("");
    if (info) setInfo("");

    /*
    |------------------------------------------------------------------
    | TWO DIFFERENT THINGS ARRIVE AS "MORE THAN ONE CHARACTER"
    |------------------------------------------------------------------
    |
    | React Native reports the field's WHOLE new value, not the key that
    | was pressed. So a box already holding "4" that receives a "7" is
    | reported as "47" - the same shape as an autofilled six-digit code
    | landing in one box.
    |
    | Treating both as a paste is a real bug and it is nasty, because the
    | user cannot see what went wrong: tap back to fix ONE mistyped digit
    | and the whole code collapses to two. They retype it, submit, and the
    | server correctly says the code is incorrect.
    |
    | They are told apart by whether the new value is the old one with a
    | single character appended. If it is, the user typed over a filled
    | box and only that digit changes.
    */

    const existing = digits[index] || "";

    const isOverwrite =
      existing.length > 0 &&
      clean.length === existing.length + 1 &&
      clean.startsWith(existing);

    const isBulk = !isOverwrite && clean.length > 1;

    /*
    | The functional form of setState. `digits` captured in this closure is
    | whatever the last render saw; the updater always receives the latest
    | committed state. With six inputs firing in quick succession that
    | difference is the gap a dropped digit falls through.
    */

    if (isBulk) {
      setDigits(() => {
        const next = Array(OTP_LENGTH).fill("");

        clean
          .slice(0, OTP_LENGTH)
          .split("")
          .forEach((character, position) => {
            next[position] = character;
          });

        return next;
      });

      focusBox(Math.min(clean.length, OTP_LENGTH - 1));

      return;
    }

    const incoming = isOverwrite ? clean.slice(-1) : clean;

    setDigits((previous) => {
      const next = [...previous];
      next[index] = incoming;
      return next;
    });

    if (incoming) focusBox(index + 1);
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key !== "Backspace") return;

    /*
    | Backspace in an empty box steps back AND clears the previous one. The
    | old version only moved focus, so the user pressed backspace, saw
    | nothing disappear, and pressed it again.
    */

    if (!digits[index] && index > 0) {
      setDigits((previous) => {
        const next = [...previous];
        next[index - 1] = "";
        return next;
      });

      focusBox(index - 1);
    }
  };

  /* ── Verify ────────────────────────────────────────────────────────── */

  const handleVerify = useCallback(
    async (candidate) => {
      const value = candidate ?? code;

      if (loading) return;

      if (value.length !== OTP_LENGTH) {
        setError(`Enter all ${OTP_LENGTH} digits of the code.`);
        return;
      }

      setError("");
      setInfo("");

      const result = await verifyOTP(phone, value);

      if (verifyOtp.fulfilled.match(result)) return;

      /*
      | The server's message is the specific one - "Incorrect OTP. 3
      | attempts remaining", "That code has expired". Preferring it over a
      | generic string is the whole difference between a user who knows
      | what to do next and one who taps the button again.
      */

      setError(
        result.payload?.message ||
          result.payload ||
          "Could not verify the code. Check your connection and try again.",
      );

      setDigits(Array(OTP_LENGTH).fill(""));
      focusBox(0);
    },
    [code, loading, phone, verifyOTP],
  );

  /*
  | Submit as soon as the sixth digit lands, so an autofilled code needs no
  | button press at all. submittedFor stops it retrying the same wrong code
  | on every render.
  */

  useEffect(() => {
    if (code.length !== OTP_LENGTH) return;
    if (submittedFor.current === code) return;

    submittedFor.current = code;

    handleVerify(code);
  }, [code, handleVerify]);

  /* ── Resend ────────────────────────────────────────────────────────── */

  const handleResend = async () => {
    if (seconds > 0 || resending) return;

    setResending(true);
    setError("");
    setInfo("");

    const result = await sendOTP(phone, country.code);

    setResending(false);

    if (sendOtp.fulfilled.match(result)) {
      const wasDelivered = result.payload?.delivered !== false;

      setDigits(Array(OTP_LENGTH).fill(""));
      submittedFor.current = "";
      setSendFailed(false);
      setDelivered(wasDelivered);
      /*
      | `??`, not `||` - the server sends 0 in testing mode because resend is
      | free there, and `|| 30` turned that into a countdown nobody was
      | waiting for. See the matching note in LoginScreen.
      */
      setSeconds(result.payload?.resendAfterSeconds ?? 30);

      /*
      | Three different situations, three different sentences. The old copy
      | sent a tester on a testing build to "check the server console" - a
      | console they do not have, for a code that is already printed on this
      | screen.
      */
      setInfo(
        wasDelivered
          ? `A new code has been sent to ${displayDial} ${formatNational(phone, country)}.`
          : testingMode
            ? `This is a testing build - no SMS is sent. Use ${result.payload?.testingOtp || testingOtp || "123456"}.`
            : "A new code was generated. No SMS was sent - check the server console.",
      );

      focusBox(0);
      return;
    }

    /*
    | The resend was refused. There is now no live code, so the countdown
    | and the resend button are meaningless - `sendFailed` hides them and
    | the screen switches to offering a number change instead.
    |
    | A rate limit is NOT a failed send: the previous code is still valid
    | and still arriving. Treating it as one would hide a working resend
    | timer from someone who just needs to wait.
    */

    const message =
      result.payload?.message ||
      result.payload ||
      "Could not resend the code. Please try again.";

    const isRateLimit = /wait|too many|limit/i.test(String(message));

    setSendFailed(!isRateLimit);
    setError(message);
  };

  /* ── Change number ─────────────────────────────────────────────────── */

  const handleEditNumber = () => {
    /*
    | replace, not navigate: going "back" from the login screen to an OTP
    | screen for a number the user has just abandoned makes no sense, and
    | the code there is already dead.
    |
    | The number travels back so the field is prefilled - having to retype
    | ten digits to correct one is the reason people give up here.
    */

    navigation.replace("Login", {
      prefillPhone: phone,
      prefillCountryCode: country.code,
    });
  };

  const isComplete = code.length === OTP_LENGTH;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>🏏</Text>
        </View>

        <Text style={styles.title}>Verify OTP</Text>

        <Text style={styles.subtitle}>
          {sendFailed
            ? "We could not send a code to"
            : `Enter the ${OTP_LENGTH}-digit code sent to`}
          {"\n"}
          <Text style={styles.phoneBold}>
            {displayDial} {formatNational(phone, country)}
          </Text>
        </Text>

        {/*
        | The link is NEUTRAL while everything is working. "Wrong number?"
        | on a screen where the SMS arrived correctly reads as though the
        | app has spotted a problem the user has not.
        |
        | It only becomes an alarm when there is genuinely something wrong,
        | and then it is a full-width button rather than a small link -
        | because at that point it is the only action that helps.
        */}

        {!sendFailed && (
          <TouchableOpacity
            onPress={handleEditNumber}
            hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}
            accessibilityRole="button"
            accessibilityLabel="Change mobile number"
          >
            <Text style={styles.edit}>Change number</Text>
          </TouchableOpacity>
        )}
      </View>

      {sendFailed && (
        <View style={styles.failureCard}>
          <Text style={styles.failureTitle}>
            That number did not receive an OTP
          </Text>

          <Text style={styles.failureBody}>
            {error ||
              "Please check the mobile number and try again."}
          </Text>

          <TouchableOpacity
            style={styles.failureButton}
            onPress={handleEditNumber}
            accessibilityRole="button"
          >
            <Text style={styles.failureButtonText}>Change Number</Text>
          </TouchableOpacity>
        </View>
      )}

      {/*
      | Development only: the code exists but no SMS was sent, so waiting
      | for a message is waiting forever. Say so rather than let the user
      | sit through a countdown for nothing.
      */}

      {/*
      | Testing build: say it plainly and hand over the code.
      |
      | A tester who has not been told will wait for an SMS, then try to
      | resend, then report a bug - so the honest version of this screen
      | states what the build is and what to type, in that order.
      */}

      {!sendFailed && testingMode && (
        <View style={styles.testBanner}>
          <Text style={styles.testBannerTitle}>Testing build</Text>

          <Text style={styles.testBannerBody}>
            This app is still under testing, so no SMS is sent. Use this
            code for every account:
          </Text>

          <Text style={styles.testBannerCode} selectable>
            {testingOtp || "123456"}
          </Text>

          <Text style={styles.testBannerFoot}>
            Real OTPs over SMS are switched on before launch.
          </Text>
        </View>
      )}

      {/*
      | Not a testing build, but nothing was delivered either - the code
      | exists and is in the server console. Keeps local development honest
      | without promising an SMS that is not coming.
      */}

      {!sendFailed && !testingMode && !delivered && (
        <Text style={styles.devNotice}>
          Development mode - no SMS was sent. The code is in the server
          console.
        </Text>
      )}

      <View style={[styles.otpRow, sendFailed && styles.hidden]}>
        {digits.map((digit, index) => (
          <TextInput
            /*
            | Index is a safe key here and only here: the array is a fixed
            | six slots that are never reordered, inserted or removed.
            */
            key={`otp-${index}`}
            ref={(reference) => {
              inputs.current[index] = reference;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            /*
            | Six, not one. iOS autofill delivers the entire code into a
            | single field and maxLength={1} silently truncated it to the
            | first digit. handleChange spreads it across the boxes.
            */
            maxLength={OTP_LENGTH}
            /* iOS: offers the code above the keyboard automatically. */
            textContentType="oneTimeCode"
            /*
            | Android: needs this AND an 11-character app hash at the end of
            | the SMS body, which has to be added to the MSG91 template. The
            | hash differs between the debug and release signing keys.
            */
            autoComplete={Platform.OS === "android" ? "sms-otp" : "off"}
            importantForAutofill="yes"
            selectTextOnFocus
            autoFocus={index === 0}
            style={[
              styles.otpBox,
              !!digit && styles.otpBoxFilled,
              !!error && styles.otpBoxError,
            ]}
          />
        ))}
      </View>

      {!!error && !sendFailed && (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      {!!info && !error && (
        <Text style={styles.infoText} accessibilityLiveRegion="polite">
          {info}
        </Text>
      )}

      {/*
      | Everything below only exists while a code is actually in flight.
      | A "Verify" button with nothing to verify, and a countdown ticking
      | towards a resend of a message that was never sent, are both worse
      | than absent.
      */}

      {!sendFailed && (
        <>
          <PrimaryButton
            title="Verify & Login"
            onPress={() => handleVerify()}
            loading={loading}
            disabled={loading || !isComplete}
          />

          <View style={styles.resendContainer}>
            {seconds > 0 ? (
              <Text style={styles.timerText}>
                Didn’t get it? Resend in {seconds}s
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}
              >
                <Text style={styles.resendText}>
                  {resending ? "Sending…" : "Resend OTP"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  logo: {
    fontSize: 28,
    color: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },

  phoneBold: {
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  edit: {
    marginTop: 12,
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  otpBoxFilled: {
    borderColor: COLORS.primary,
  },

  otpBoxError: {
    borderColor: COLORS.error,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 14,
  },

  infoText: {
    color: COLORS.success,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 14,
  },

  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  timerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  resendText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  hidden: {
    display: "none",
  },

  failureCard: {
    backgroundColor: COLORS.errorContainer,
    borderRadius: 14,
    padding: 18,
    marginBottom: 8,
  },

  failureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onErrorContainer,
    marginBottom: 6,
  },

  failureBody: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onErrorContainer,
    marginBottom: 16,
  },

  failureButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  failureButtonText: {
    color: COLORS.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  devNotice: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.warning,
    textAlign: "center",
    marginBottom: 14,
  },

  /*
  | Deliberately the loudest thing on the screen. It is temporary, it is
  | the answer to the only question the tester has, and it should be
  | impossible to mistake this build for the real one.
  */

  testBanner: {
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: "center",
  },

  testBannerTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLORS.warning,
    marginBottom: 6,
  },

  testBannerBody: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  testBannerCode: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 8,
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 6,
  },

  testBannerFoot: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
