import { Alert, Platform } from "react-native";

/*
|--------------------------------------------------------------------------
| Web Alert Shim
|--------------------------------------------------------------------------
|
| react-native-web does not implement Alert. Alert.alert() is a silent
| no-op there: no dialog, no console warning, and - critically - the
| onPress callbacks never run. Since almost every destructive action in
| this app (delete team, leave team, logout, undo ball, remove player)
| lives INSIDE a confirm callback, on web those actions simply never
| happen, and every error message is invisible.
|
| Rather than rewrite ~148 call sites, this patches the shared Alert
| object once at startup. Every `import { Alert } from "react-native"`
| in the app resolves to this same object, so all call sites are fixed
| without touching them.
|
| Native is untouched - the whole module short-circuits on Platform.OS.
|
| Import this once, for its side effect, at the top of App.js.
|
*/

const joinText = (title, message) =>
  [title, message].filter(Boolean).join("\n\n");

if (Platform.OS === "web" && typeof window !== "undefined" && Alert) {
  /*
  |--------------------------------------------------------------------------
  | Alert.alert
  |--------------------------------------------------------------------------
  |
  | RN signature: alert(title, message?, buttons?, options?)
  |
  |   0-1 buttons -> window.alert, then fire that button's onPress.
  |   2+ buttons  -> window.confirm. OK fires the primary action (the last
  |                  button that isn't style:"cancel", matching the iOS
  |                  convention this codebase writes to); Cancel fires the
  |                  cancel button's onPress if it has one.
  |
  | window.confirm only offers two choices, so a 3-button alert loses its
  | middle option. That is warned about rather than silently dropped.
  |
  */

  Alert.alert = (title, message, buttons, _options) => {
    const text = joinText(title, message);

    if (!Array.isArray(buttons) || buttons.length === 0) {
      // eslint-disable-next-line no-alert
      window.alert(text);
      return;
    }

    if (buttons.length === 1) {
      // eslint-disable-next-line no-alert
      window.alert(text);
      buttons[0]?.onPress?.();
      return;
    }

    if (buttons.length > 2) {
      console.warn(
        `[webAlert] "${title}" has ${buttons.length} buttons; the web shim ` +
          `can only offer two. Showing the last non-cancel button as OK.`,
      );
    }

    const cancelButton =
      buttons.find((b) => b?.style === "cancel") ?? buttons[0];

    const actionButtons = buttons.filter((b) => b?.style !== "cancel");
    const primaryButton =
      actionButtons[actionButtons.length - 1] ?? buttons[buttons.length - 1];

    const label = primaryButton?.text ? `\n\n[OK = ${primaryButton.text}]` : "";

    // eslint-disable-next-line no-alert
    if (window.confirm(`${text}${label}`)) {
      primaryButton?.onPress?.();
    } else if (cancelButton !== primaryButton) {
      cancelButton?.onPress?.();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Alert.prompt
  |--------------------------------------------------------------------------
  |
  | Alert.prompt is iOS-only in React Native, so screens that use it
  | (TeamAvailabilityScreen's block-date reason, NotificationScreen's
  | decline reason) already branch on its existence. Defining it here
  | lets web take the richer path instead of the fallback.
  |
  | RN signature: prompt(title, message?, callbackOrButtons?, type?,
  |                      defaultValue?)
  |
  */

  Alert.prompt = (
    title,
    message,
    callbackOrButtons,
    _type,
    defaultValue = "",
  ) => {
    // eslint-disable-next-line no-alert
    const result = window.prompt(joinText(title, message), defaultValue);

    // Cancelled - window.prompt returns null. Match iOS: do nothing.
    if (result === null) {
      return;
    }

    if (typeof callbackOrButtons === "function") {
      callbackOrButtons(result);
      return;
    }

    if (Array.isArray(callbackOrButtons)) {
      const submit =
        callbackOrButtons.filter((b) => b?.style !== "cancel").pop() ??
        callbackOrButtons[callbackOrButtons.length - 1];

      submit?.onPress?.(result);
    }
  };
}
