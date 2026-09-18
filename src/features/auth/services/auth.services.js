import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

/*
|--------------------------------------------------------------------------
| Auth API
|--------------------------------------------------------------------------
|
| `countryCode` is new and optional on purpose.
|
| The server treats a missing country as India, which is what every account
| created before this change already is - so an older build of the app that
| sends only a bare phone number keeps working exactly as it did. Nothing
| has to be migrated and no user is locked out mid-rollout.
|
| The number itself is always the BARE NATIONAL FORM - ten digits for India,
| no dial code, no spaces. The dial code travels separately in countryCode.
| Sending "+91 98765 43210" here would reach the server as a string it has
| to guess at, and guessing is how an OTP ends up at the wrong number.
|
*/

export const sendOtpApi = (phone, countryCode = "IN") =>
  apiClient.post(ENDPOINTS.AUTH.SEND_OTP, {
    phone,
    countryCode,
  });

export const verifyOtpApi = (phone, otp, countryCode = "IN") =>
  apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, {
    phone,
    otp,
    countryCode,
  });
