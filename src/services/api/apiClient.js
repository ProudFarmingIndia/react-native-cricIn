// import axios from 'axios';

// import { API_CONFIG }
//   from './apiConstants';

// const apiClient =
//   axios.create({

//     baseURL:
//       API_CONFIG.BASE_URL,

//     timeout:
//       API_CONFIG.TIMEOUT,

//     headers: {
//       'Content-Type':
//         'application/json',
//     },

//   });

// export default apiClient;
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "./apiConstants";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
    |--------------------------------------------------------------------------
    | Multipart Uploads
    |--------------------------------------------------------------------------
    |
    | The instance defaults to "application/json", which is wrong for a
    | FormData body - and setting "multipart/form-data" by hand is just as
    | wrong, because the boundary is missing. Multer needs the boundary to
    | split the parts, so a hand-written header means "no file was
    | uploaded" no matter what the client sent.
    |
    | Deleting the header lets the platform (the browser on web, the RN
    | networking layer on native) generate the full value including the
    | boundary. Done here rather than per call site so every multipart
    | request in the app is covered.
    |
    */

    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      if (typeof config.headers?.delete === "function") {
        // axios v1 wraps headers in an AxiosHeaders instance
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },

  (error) => Promise.reject(error),
);

export default apiClient;