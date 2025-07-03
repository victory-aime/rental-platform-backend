import { BASE_APIS_URL } from '../enum/global.enum';

export const CARS_MODULES_APIS_URL = {
  CARS_MANAGEMENT: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/manage-cars`,
    ADD_CAR: `add`,
    UPDATE_CAR: 'update-car',
    GET_CARS: 'cars-list',
  },
  PARC_MANAGEMENT: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/manage-parcs`,
    LIST: 'list',
    ADD: 'create-parc',
    UPDATE: 'update-parc',
    DELETE: 'delete-parc',
  },
  MAINTENANCE_MANAGEMENT: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/maintenances`,
    LIST: 'list',
    ADD: 'add',
    UPDATE: 'update',
    CLOSED: 'close-maintenance',
  },
};

export const COMMON_API_URL = {
  USER_MANAGEMENT: {
    USER_INFO: `${BASE_APIS_URL.SECURED}/user/me`,
    USER_UPDATE: `${BASE_APIS_URL.SECURED}/user/update-user`,
    DEACTIVATE_ACCOUNT: `${BASE_APIS_URL.SECURED}/user/deactivate-account`,
    CLEAR_ALL_SESSIONS: `${BASE_APIS_URL.SECURED}/user/clear-all-sessions`,
    ACTIVATE_ACCOUNT: `${BASE_APIS_URL.SECURED}/user/activate-account`,
  },
  CATEGORIES: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/categories`,
    ADD: 'create-category',
  },
  EQUIPMENTS: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/equipments`,
    ADD: 'create-equipment',
  },
  OTP: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.UNSECURED}/otp`,
    GENERATE: 'generate',
    RENEW: 'renewOtp',
    VALIDATE: 'validate',
  },
};
