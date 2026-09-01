export const COLORS = {
  primary: "#00490e",
  primaryContainer: "#0d631b",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#8bdd86",
  secondary: "#8f4e00",
  secondaryContainer: "#ff8f04",
  onSecondary: "#ffffff",
  onSecondaryContainer: "#623300",
  background: "#f7fbf1",
  surface: "#f7fbf1",
  surfaceContainer: "#ebefe5",
  surfaceContainerLow: "#f1f5eb",
  surfaceContainerHigh: "#e5eae0",
  surfaceContainerHighest: "#e0e4da",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#181d17",
  onSurfaceVariant: "#40493d",
  outlineVariant: "#bfcaba",
  outline: "#707a6c",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  success: "#2e7d32",
  onSuccess: "#ffffff",
  warning: "#ff8f04",
  onWarning: "#ffffff",

  /*
  |--------------------------------------------------------------------------
  | Compatibility Aliases
  |--------------------------------------------------------------------------
  |
  | These seven names are used in roughly 40 places across the app -
  | HomeScreen, LoginScreen, OtpScreen, ShopScreen, GroundsScreen, the
  | search cards, the notification styles - but were never defined here.
  | They resolved to `undefined`, so those elements silently fell back to
  | platform defaults, which is why several screens carry their own local
  | colour objects.
  |
  | Mapped onto the Material tokens above rather than introducing new
  | values, so the palette stays a single system.
  |
  | For new code prefer the tokens directly: onSurface over text,
  | onSurfaceVariant over textLight, surfaceContainerLowest over card.
  |
  */

  text: "#181d17", // = onSurface
  textPrimary: "#181d17", // = onSurface
  textLight: "#40493d", // = onSurfaceVariant
  textSecondary: "#40493d", // = onSurfaceVariant
  border: "#bfcaba", // = outlineVariant
  card: "#ffffff", // = surfaceContainerLowest
  surfaceVariant: "#e0e4da", // = surfaceContainerHighest
};