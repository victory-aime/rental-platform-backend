enum BASE_APIS_URL {
  UNSECURED = '_api/v1/unsecured',
  SECURED = '_api/v1/secure',
}

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
  SWAGGER_TAGS,
  KEYCLOAK_GRANT_TYPE,
  KEYCLOAK_USERS_ROLES,
};
