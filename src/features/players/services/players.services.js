import apiClient
  from '../../../services/api/apiClient';

import ENDPOINTS
  from '../../../services/api/endpoints';

export const getPlayersApi =
  () => {

    return apiClient.get(
      ENDPOINTS.PLAYERS.GET_ALL
    );

  };