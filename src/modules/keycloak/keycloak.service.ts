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
  ): Promise<void> {
    try {
      const token = await this.getAdminToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const { enabled2MFA, password, ...userFields } = values;

      // Préparation du payload utilisateur (profil)
      const userPayload: Record<string, any> = {
        ...Object.fromEntries(
          Object.entries(userFields).filter(([_, v]) => v !== undefined),
        ),
      };

      // Ajout de l'action MFA si nécessaire
      if (enabled2MFA === true) {
        userPayload.requiredActions = ['CONFIGURE_TOTP'];
      }

      // Envoi de la mise à jour du profil si au moins une info est présente
      if (Object.keys(userPayload).length > 0) {
        await axios.put(
          `http://localhost:8080/admin/realms/rental-platform/users/${keycloakId}`,
          userPayload,
          { headers },
        );
      }

      // Mise à jour du mot de passe si nécessaire
      if (password) {
        await axios.put(
          `http://localhost:8080/admin/realms/rental-platform/users/${keycloakId}/reset-password`,
          {
            type: 'password',
            value: password,
            temporary: false,
          },
          { headers },
        );
      }
    } catch (error) {
      console.error(
        '❌ Erreur updateUserProfile Keycloak:',
        error?.response?.data || error,
      );
      throw new BadRequestException('Échec de la mise à jour de l’utilisateur');
    }
  }

  async deactivateOrEnabledUser(keycloakId: string, enabled: boolean) {
    const token = await this.getAdminToken();
    try {
      await axios.put(
        `http://localhost:8080/admin/realms/rental-platform/users/${keycloakId}`,
        { enabled: enabled },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (e) {
      console.error(e);
    }
  }

  async closeAllSessions(keycloakId: string): Promise<void> {
    try {
      const token = await this.getAdminToken();
      if (!keycloakId) {
        throw new BadRequestException(
          'Keycloak ID est requis pour fermer les sessions',
        );
      }
      await axios.post(
        `http://localhost:8080/admin/realms/rental-platform/users/${keycloakId}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error(
        '❌ Erreur closeAllSessions Keycloak:',
        error?.response?.data || error,
      );
      throw new BadRequestException('Échec de la fermeture des sessions');
    }
  }
}
