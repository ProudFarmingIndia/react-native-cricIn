import { ENV } from "../../config/env";

/*
| Derived from config/env.js so the REST host and the socket host can
| never disagree again - they were separately hardcoded and had drifted
| to two different machines.
*/

export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,

  TIMEOUT: ENV.REQUEST_TIMEOUT,
};
