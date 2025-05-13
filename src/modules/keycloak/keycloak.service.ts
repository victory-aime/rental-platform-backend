import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { KEYCLOAK_GRANT_TYPE } from '../../config/enum/global.enum';

@Injectable()
export class KeycloakService {
  async getAdminToken(): Promise<string> {
    const response = await axios.post(
      process.env.KEYCLOAK_ADMIN_TOKEN_URL!,
      new URLSearchParams({
        client_id: process.env.KEYCLOAK_MASTER_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_MASTER_CLIENT_SECRET!,
        grant_type: KEYCLOAK_GRANT_TYPE.CLIENT_CREDENTIALS,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    return response.data.access_token;
  }
}
