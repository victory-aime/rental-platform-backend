import { BASE_APIS_URL } from '../enum/global.enum';

export const CARS_MODULES_APIS_URL = {
  CARS_MANAGEMENT: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/manage-cars`,
    ADD_CAR: `${BASE_APIS_URL.SECURED}/manage-cars/add`,
  },
};

export const COMMON_API_URL = {
  USER_MANAGEMENT: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/user`,
    USER_INFO: `${BASE_APIS_URL.SECURED}/user/me`,
  },
  CATEGORIES: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/categories`,
    ADD: 'create-category',
  },
  EQUIPMENTS: {
    GLOBAL_ROUTES: `${BASE_APIS_URL.SECURED}/equipments`,
    ADD: 'create-equipment',
  },
};
