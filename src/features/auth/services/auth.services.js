import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

export const sendOtpApi = (phone) => {
  return apiClient.post(
    ENDPOINTS.AUTH.SEND_OTP,
    {
      phone,
    }
  );
};

export const verifyOtpApi = (
  phone,
  otp
) => {
  return apiClient.post(
    ENDPOINTS.AUTH.VERIFY_OTP,
    {
      phone,
      otp,
    }
  );
};