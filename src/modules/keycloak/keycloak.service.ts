import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { KEYCLOAK_GRANT_TYPE } from '_config/enum/global.enum';
import { keycloakUserDto } from './keycloak.dto';

@Injectable()
export class KeycloakService {
  private readonly issuer = process.env.KEYCLOAK_ISSUER!;
  private readonly adminTokenUrl = process.env.KEYCLOAK_ADMIN_TOKEN_URL!;
  private readonly clientId = process.env.KEYCLOAK_MASTER_CLIENT_ID!;
  private readonly clientSecret = process.env.KEYCLOAK_MASTER_CLIENT_SECRET!;

  private async getAdminToken(): Promise<string> {
    const response = await axios.post(
      this.adminTokenUrl,
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: KEYCLOAK_GRANT_TYPE.CLIENT_CREDENTIALS,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    return response.data.access_token;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAdminToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async updateUserProfile(
    keycloakId: string,
    values: keycloakUserDto,
  ): Promise<{ message: string }> {
    if (!keycloakId) {
      throw new BadRequestException('ID utilisateur Keycloak manquant');
    }

    const { enabled2MFA, ...userValues } = values;

    const payload: Record<string, any> = {
      ...userValues,
    };

    if (enabled2MFA) {
      payload.requiredActions = ['CONFIGURE_TOTP'];
    }

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('Aucune donnée à mettre à jour');
    }

    try {
      const headers = await this.getAuthHeaders();

      await axios.put(
        `http://localhost:8080/admin/realms/rental-platform/users/${keycloakId}`,
        payload,
        {
          headers,
        },
      );

      return { message: 'Mise à jour effectuée avec succès' };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la mise à jour utilisateur Keycloak:',
        error,
      );
      throw new BadRequestException('Échec de la mise à jour de l’utilisateur');
    }
  }
}
