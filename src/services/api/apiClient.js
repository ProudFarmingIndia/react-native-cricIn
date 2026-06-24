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
import { API_CONFIG } from "./apiConstants";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;