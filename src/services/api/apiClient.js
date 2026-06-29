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

    const token =
      await AsyncStorage.getItem(
        "accessToken"
      );

    console.log(
      "AUTH HEADER TOKEN =>",
      token
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

export default apiClient;