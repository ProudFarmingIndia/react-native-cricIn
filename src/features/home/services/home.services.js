import apiClient from '../../../services/api/apiClient';

export const getDashboardApi =
  () => {
    return apiClient.get(
      '/dashboard',
    );
  };