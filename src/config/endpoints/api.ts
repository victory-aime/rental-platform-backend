import { BASE_APIS_URL } from '../enum/global.enum';

export const APIS_URL = {
  USER_MANAGEMENT: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/user`,
    USER_INFO: `${BASE_APIS_URL.SECURED}/user/me`,
  },
};
