import React, { useState, useMemo } from "react";

import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";

import useAuth from "../hooks/useAuth";
import useCountryCode from "../hooks/useCountryCode";

import { sendOtp } from "../store/authSlice";

import { COLORS } from "../../../constants/colors";
import { SPACING } from "../../../constants/spacing";

import {
  SUPPORTED_COUNTRIES,
  findCountry,
  formatNational,
  sanitiseNational,
  validateNational,
} from "../../../constants/countries";

import PrimaryButton from "../../../components/Button/PrimaryButton";
import TextInput from "../../../components/Input/TextInput";

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
|
| FOUR THINGS WERE WRONG WITH THE PREVIOUS VERSION.
|
| 1. THE TEN-DIGIT LIMIT DID NOT HOLD.
|
|    handlePhoneChange sliced to ten and called setPhone. Once ten digits
|    were already entered, slicing an eleventh produced the SAME string that
|    was already in state - so React saw no change, skipped the re-render,
|    and never pushed a corrected value back down to the native input. State
|    was right; the box on screen showed eleven digits.
|
|    Rejecting a keystroke by setting state to the value it already holds is
|    a no-op. `maxLength` fixes it properly: the eleventh key never reaches
|    JavaScript at all. The sanitiser stays, because maxLength does not
|    strip letters or a pasted "+91 98765 43210".
|
| 2. THE BUTTON COULD BE TAPPED WHILE SENDING.
|
|    PrimaryButton already accepts `loading` and `disabled` and computes
|    isDisabled from them - but neither was passed. Only the title changed.
|    Five taps sent five OTPs, each one costing money, and the spinner the
|    button can render never appeared.
|
| 3. NOTHING WAS EVER SHOWN TO THE USER.
|
|    Validation failures went to console.warn, which is invisible in a
|    release build. Someone typing nine digits tapped the button and watched
|    nothing happen, with no way to find out why.
|
| 4. "0000000000" PASSED.
|
|    The only check was length. Indian mobile numbers start 6, 7, 8 or 9;
|    everything else is a landline or nothing at all, and sending an OTP to
|    one is a message that can never arrive.
|
*/

export default function LoginScreen({ navigation, route }) {
  const { sendOTP, loading } = useAuth();

  const { country: detectedCountry } = useCountryCode();

  /*
  | Prefill, sent back by the OTP screen's "Change it" link.
  |
  | Without this the Edit button cleared the field and made the user type
  | all ten digits again to correct a single one - which is exactly the
  | moment people give up and close the app.
  */

  const { prefillPhone = "", prefillCountryCode } = route?.params || {};

  const [country, setCountry] = useState(
    prefillCountryCode ? findCountry(prefillCountryCode) : detectedCountry,
  );

  const [phone, setPhone] = useState(
    prefillPhone
      ? sanitiseNational(
          prefillPhone,
          prefillCountryCode ? findCountry(prefillCountryCode) : detectedCountry,
        )
      : "",
  );
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  /*
  | The picker is only worth opening when there is a choice. With one
  | deliverable country the chip is a label, not a button - a dropdown that
  | opens to a single option is a small lie about what the app can do.
  */

  const canChooseCountry = SUPPORTED_COUNTRIES.length > 1;

  const validationError = useMemo(
    () => validateNational(phone, country),
    [phone, country],
  );

  const isComplete = phone.length === country.nationalLength;

  const handlePhoneChange = (text) => {
    setPhone(sanitiseNational(text, country));

    /* Clear a stale error the moment they start correcting it. */
    if (error) setError("");
  };

  const handleCountryChange = (next) => {
    setCountry(next);
    setPickerOpen(false);

    /*
    | Number lengths differ between countries, so a number typed for one is
    | rarely valid for another. Clearing is less confusing than silently
    | truncating it.
    */

    setPhone("");
    setError("");
  };

  const handleSendOtp = async () => {
    if (loading) return;

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const result = await sendOTP(phone, country.code);

    if (sendOtp.fulfilled.match(result)) {
      navigation.navigate("OtpScreen", {
        phone,
        dialCode: country.dialCode,
        countryCode: country.code,

        /*
        | The server decides how long before a resend is allowed, so the
        | countdown on the next screen matches the limit that will actually
        | be enforced. Hard-coding 30 there would show "Resend" while the
        | server still refuses.
        */
        resendAfterSeconds: result.payload?.resendAfterSeconds || 30,

        /*
        | Whether an SMS actually left. False in development with no MSG91
        | credentials, so the OTP screen can say "no SMS was sent" instead
        | of running a countdown for a message that will never arrive.
        */
        delivered: result.payload?.delivered !== false,

        /*
        | Testing build: the server is running a fixed code for every
        | number instead of sending real OTPs. It tells us so, and tells us
        | the code, so the next screen can show both rather than leave a
        | tester waiting for an SMS that was never sent.
        |
        | Both are absent once real OTPs are switched on, so the banner
        | disappears on its own - nothing to remember to remove here.
        */
        testingMode: result.payload?.testingMode === true,
        testingOtp: result.payload?.testingOtp || "",
      });

      return;
    }

    /*
    | The request failed. The user is told, on screen, in words - not in a
    | console nobody can see. The server's own message is preferred because
    | it is the specific one ("Too many attempts, try again in 10 minutes"),
    | with a generic fallback for a network drop that has no message.
    */

    setError(
      result.payload?.message ||
        result.payload ||
        "Could not send the OTP. Check your connection and try again.",
    );
  };

  return (
    <ImageBackground
      source={require("../../../../assets/splash-icon.png")}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🏟 CricIn</Text>

          <Text style={styles.tagline}>Every Cricketer’s Identity</Text>

          <Text style={styles.subTagline}>Har Cricketer Ki Pehchaan</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>MOBILE NUMBER</Text>

          <View style={styles.phoneRow}>
            <TouchableOpacity
              activeOpacity={canChooseCountry ? 0.7 : 1}
              onPress={canChooseCountry ? () => setPickerOpen(true) : undefined}
              disabled={!canChooseCountry}
              style={[
                styles.countryCode,
                !!error && styles.countryCodeError,
              ]}
              accessibilityRole={canChooseCountry ? "button" : "text"}
              accessibilityLabel={`Country code ${country.dialCode}, ${country.name}`}
            >
              <Text style={styles.flagText}>{country.flag}</Text>

              <Text style={styles.codeText}>{country.dialCode}</Text>

              {canChooseCountry && <Text style={styles.chevron}>▾</Text>}
            </TouchableOpacity>

            <View style={styles.phoneInputWrap}>
              <TextInput
                value={formatNational(phone, country)}
                onChangeText={handlePhoneChange}
                placeholder={country.placeholder}
                /*
                | phone-pad gives the same digits on both platforms and, on
                | iOS, the layout people expect for a phone number.
                */
                keyboardType="phone-pad"
                /*
                | The real cap. Enforced natively, so the extra keystroke
                | never reaches JavaScript and the no-op re-render problem
                | above cannot happen. The +1 leaves room for the display
                | spaces that formatNational adds.
                */
                maxLength={
                  country.nationalLength +
                  Math.max((country.format?.length || 1) - 1, 0)
                }
                /* iOS autofill */
                textContentType="telephoneNumber"
                /* Android autofill */
                autoComplete="tel"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
                style={!!error && styles.inputError}
              />
            </View>
          </View>

          {!!error && (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}

          <PrimaryButton
            title="Get OTP"
            onPress={handleSendOtp}
            /*
            | Both are passed now. `loading` renders the spinner the button
            | already knew how to draw; `disabled` is what actually stops a
            | second tap sending a second SMS.
            */
            loading={loading}
            disabled={loading || !isComplete}
          />

          <View style={styles.statusRow}>
            <View style={styles.dot} />

            <Text style={styles.statusText}>
              {loading ? "SENDING OTP" : "SYSTEMS LIVE"}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.linksRow}>
            <Text style={styles.link}>Privacy</Text>
            <Text style={styles.dotSep}>•</Text>
            <Text style={styles.link}>Terms</Text>
            <Text style={styles.dotSep}>•</Text>
            <Text style={styles.link}>Help</Text>
          </View>

          <Text style={styles.copy}>
            © {new Date().getFullYear()} CRICIN.APP
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/*
      | Rendered only when there is something to choose between, so it costs
      | nothing while India is the only deliverable country.
      */}

      {canChooseCountry && (
        <Modal
          visible={pickerOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setPickerOpen(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setPickerOpen(false)}
          >
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <Text style={styles.modalTitle}>Select country</Text>

              <FlatList
                data={SUPPORTED_COUNTRIES}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryRow}
                    onPress={() => handleCountryChange(item)}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>

                    <Text style={styles.countryName}>{item.name}</Text>

                    <Text style={styles.countryDial}>{item.dialCode}</Text>
                  </TouchableOpacity>
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  inner: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
  },

  tagline: {
    fontSize: 16,
    color: "#aef49a",
    marginTop: 8,
    fontWeight: "600",
  },

  subTagline: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.8,
    marginTop: 4,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    padding: 20,
  },

  label: {
    fontSize: 12,
    letterSpacing: 2,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: "600",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  phoneInputWrap: {
    flex: 1,
  },

  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    marginRight: 10,
  },

  countryCodeError: {
    borderColor: COLORS.error,
  },

  flagText: {
    fontSize: 18,
    marginRight: 6,
  },

  codeText: {
    fontWeight: "700",
    color: COLORS.primary,
  },

  chevron: {
    marginLeft: 6,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },

  inputError: {
    borderColor: COLORS.error,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 10,
    marginTop: 2,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },

  statusText: {
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.primary,
    fontWeight: "600",
  },

  footer: {
    marginTop: 30,
    alignItems: "center",
  },

  linksRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  link: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.7,
  },

  dotSep: {
    marginHorizontal: 6,
    color: "#fff",
    opacity: 0.4,
  },

  copy: {
    marginTop: 10,
    fontSize: 10,
    letterSpacing: 2,
    color: "#fff",
    opacity: 0.5,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "60%",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.onSurface,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },

  countryFlag: {
    fontSize: 22,
    marginRight: 12,
  },

  countryName: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
  },

  countryDial: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
