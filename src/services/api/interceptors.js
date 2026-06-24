import AsyncStorage
  from '@react-native-async-storage/async-storage';

import apiClient
  from './apiClient';

apiClient.interceptors.request.use(
  async config => {

    const token =
      await AsyncStorage.getItem(
        'accessToken',
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  error =>
    Promise.reject(error),
);

apiClient.interceptors.response.use(

  response => response,

  async error => {

    if (
      error.response?.status === 401
    ) {

      await AsyncStorage.removeItem(
        'accessToken',
      );

    }

    return Promise.reject(error);
  },
);

export default apiClient;