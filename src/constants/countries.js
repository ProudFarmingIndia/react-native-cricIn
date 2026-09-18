/*
|--------------------------------------------------------------------------
| Countries
|--------------------------------------------------------------------------
|
| One table, two jobs: what to show in the country picker, and how to
| validate a number once a country is chosen.
|
| WHY A CONSTANTS FILE AND NOT libphonenumber-js
|
| libphonenumber-js is the right answer once there are more than three or
| four countries to support - phone numbering plans genuinely change, and a
| hand-written regex quietly starts rejecting valid new number ranges. It is
| also pure JavaScript, so adding it later needs no native rebuild.
|
| Today it would be ~145 KB of Google's metadata to validate one country, so
| this table is the honest choice. The shape below is deliberately the same
| shape libphonenumber gives back, so swapping it in later is one file.
|
| WHY MOST OF THESE ARE TURNED OFF
|
| `otpSupported` is not about whether the country exists. It is about
| whether CricIn can actually DELIVER an OTP there.
|
| msg91.service.ts currently builds the destination as:
|
|     mobiles: `91${phone}`
|
| The country code is hardcoded. Offer a user +44 today and their OTP is
| sent to "91" followed by a British number - which reaches either nobody or
| a stranger in India, and they can never sign in to tell you.
|
| So the picker shows only what works. Turn a country on here at the same
| time as the backend learns to dial it, and not one release earlier.
|
*/

export const COUNTRIES = [
  {
    code: "IN",
    dialCode: "+91",
    name: "India",
    flag: "🇮🇳",

    /* Digits AFTER the dial code. Drives maxLength on the input. */
    nationalLength: 10,

    /* Indian mobile numbers begin 6, 7, 8 or 9. Landlines are not valid
       for OTP, and "0000000000" should not pass. */
    pattern: /^[6-9]\d{9}$/,

    placeholder: "00000 00000",

    /* Grouping for display only - never sent to the API. */
    format: [5, 5],

    otpSupported: true,
  },

  /*
  | The rest are the other cricket-playing nations, present so the table has
  | a real shape rather than one row. All disabled until MSG91 can reach
  | them - see the note above.
  */

  {
    code: "PK", dialCode: "+92", name: "Pakistan", flag: "🇵🇰",
    nationalLength: 10, pattern: /^3\d{9}$/,
    placeholder: "300 0000000", format: [3, 7], otpSupported: false,
  },
  {
    code: "BD", dialCode: "+880", name: "Bangladesh", flag: "🇧🇩",
    nationalLength: 10, pattern: /^1[3-9]\d{8}$/,
    placeholder: "1700 000000", format: [4, 6], otpSupported: false,
  },
  {
    code: "LK", dialCode: "+94", name: "Sri Lanka", flag: "🇱🇰",
    nationalLength: 9, pattern: /^7\d{8}$/,
    placeholder: "70 000 0000", format: [2, 3, 4], otpSupported: false,
  },
  {
    code: "NP", dialCode: "+977", name: "Nepal", flag: "🇳🇵",
    nationalLength: 10, pattern: /^9\d{9}$/,
    placeholder: "980 0000000", format: [3, 7], otpSupported: false,
  },
  {
    code: "AE", dialCode: "+971", name: "UAE", flag: "🇦🇪",
    nationalLength: 9, pattern: /^5\d{8}$/,
    placeholder: "50 000 0000", format: [2, 3, 4], otpSupported: false,
  },
  {
    code: "GB", dialCode: "+44", name: "United Kingdom", flag: "🇬🇧",
    nationalLength: 10, pattern: /^7\d{9}$/,
    placeholder: "7400 000000", format: [4, 6], otpSupported: false,
  },
  {
    code: "AU", dialCode: "+61", name: "Australia", flag: "🇦🇺",
    nationalLength: 9, pattern: /^4\d{8}$/,
    placeholder: "400 000 000", format: [3, 3, 3], otpSupported: false,
  },
  {
    code: "NZ", dialCode: "+64", name: "New Zealand", flag: "🇳🇿",
    nationalLength: 9, pattern: /^2\d{8}$/,
    placeholder: "21 000 0000", format: [2, 3, 4], otpSupported: false,
  },
  {
    code: "ZA", dialCode: "+27", name: "South Africa", flag: "🇿🇦",
    nationalLength: 9, pattern: /^[6-8]\d{8}$/,
    placeholder: "82 000 0000", format: [2, 3, 4], otpSupported: false,
  },
  {
    code: "US", dialCode: "+1", name: "United States", flag: "🇺🇸",
    nationalLength: 10, pattern: /^[2-9]\d{9}$/,
    placeholder: "201 555 0123", format: [3, 3, 4], otpSupported: false,
  },
];

/* The only countries the picker offers. */
export const SUPPORTED_COUNTRIES = COUNTRIES.filter((c) => c.otpSupported);

export const DEFAULT_COUNTRY =
  SUPPORTED_COUNTRIES.find((c) => c.code === "IN") || SUPPORTED_COUNTRIES[0];

export const findCountry = (code) =>
  COUNTRIES.find((c) => c.code === code) || DEFAULT_COUNTRY;

/*
| Only for what the user reads. The API always receives bare digits - a
| space in a phone number is the kind of thing that passes every test on a
| developer's machine and fails on a live SMS gateway.
*/

export const formatNational = (digits, country) => {
  const groups = country?.format || [];

  if (!groups.length) return digits;

  const parts = [];
  let index = 0;

  for (const size of groups) {
    if (index >= digits.length) break;
    parts.push(digits.slice(index, index + size));
    index += size;
  }

  if (index < digits.length) parts.push(digits.slice(index));

  return parts.join(" ");
};

/*
| Strip everything that is not a digit, then drop a leading country code or
| trunk zero if the user pasted a full number.
|
| People paste "+91 98765 43210" and "098765 43210" constantly. Without
| this, the first becomes "919876543210" - twelve digits, silently truncated
| to the wrong ten by maxLength, and the OTP goes to a number that is not
| theirs.
*/

export const sanitiseNational = (input, country) => {
  let digits = String(input || "").replace(/\D/g, "");

  const dial = String(country?.dialCode || "").replace(/\D/g, "");

  if (dial && digits.length > country.nationalLength && digits.startsWith(dial)) {
    digits = digits.slice(dial.length);
  }

  /* A trunk "0" prefix, as written on Indian visiting cards. */
  if (digits.length > country.nationalLength && digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  return digits.slice(0, country.nationalLength);
};

export const validateNational = (digits, country) => {
  if (!digits) return "Enter your mobile number";

  if (digits.length < country.nationalLength) {
    return `Enter all ${country.nationalLength} digits`;
  }

  if (!country.pattern.test(digits)) {
    return country.code === "IN"
      ? "Indian mobile numbers start with 6, 7, 8 or 9"
      : "That does not look like a valid mobile number";
  }

  return "";
};
