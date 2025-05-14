enum BASE_APIS_URL {
  UNSECURED = '_api/v1/unsecured',
  SECURED = '_api/v1/secure',
}
const PAGINATION = {
  INIT: 1,
  PAGE_SIZE: 5,
  FULL_PAGE_SIZE: 10000,
};

enum SWAGGER_TAGS {
  USER_MANAGEMENT = 'user-management',
}

enum KEYCLOAK_GRANT_TYPE {
  PASSWORD = 'password',
  CLIENT_CREDENTIALS = 'client_credentials',
}

enum KEYCLOAK_USERS_ROLES {
  AUTOMOBILISTE = 'AUTOMOBILISTE',
  HOTELIER = 'HOTELIER',
  ADMIN = 'admin',
}

export {
  BASE_APIS_URL,
  PAGINATION,
  SWAGGER_TAGS,
  KEYCLOAK_GRANT_TYPE,
  KEYCLOAK_USERS_ROLES,
};
