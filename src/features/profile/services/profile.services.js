// import apiClient from "../../../services/api/apiClient";
// import { ENDPOINTS } from "../../../services/api/endpoints";

// export const getProfileApi = () => {
//   return apiClient.get(
//     ENDPOINTS.PROFILE.GET_PROFILE
//   );
// };

// export const updateProfileApi = (
//   payload
// ) => {
//   return apiClient.put(
//     ENDPOINTS.PROFILE.UPDATE_PROFILE,
//     payload
//   );
// };

// // export const uploadProfileImageApi = (
// //   formData
// // ) => {
// //   return apiClient.post(
// //     ENDPOINTS.PROFILE.UPLOAD_PROFILE_IMAGE,
// //     formData,
// //     {
// //       headers: {
// //         "Content-Type":
// //           "multipart/form-data",
// //       },
// //     }
// //   );
// // };

import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

// GET /api/players/me
export const getProfileApi = () => {
  return apiClient.get(ENDPOINTS.PLAYER.ME);
};

// PUT /api/players/me
export const updateProfileApi = (payload) => {
  return apiClient.put(ENDPOINTS.PLAYER.UPDATE, payload);
};

// POST /api/players  — only called once to create the player profile
export const createPlayerProfileApi = (payload) => {
  return apiClient.post(ENDPOINTS.PLAYER.CREATE, payload);
};