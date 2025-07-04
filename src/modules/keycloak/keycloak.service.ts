import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { KEYCLOAK_GRANT_TYPE } from '_config/enum/global.enum';
import { keycloakUserDto } from './keycloak.dto';

@Injectable()
export class KeycloakService {
  private readonly issuer = process.env.KEYCLOAK_ISSUER!;
  private readonly baseUrl =
    'http://localhost:8080/admin/realms/rental-platform';

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

      const { password, ...userFields } = values;

      const userPayload: Record<string, any> = {
        ...Object.fromEntries(
          Object.entries(userFields).filter(([_, v]) => v !== undefined),
        ),
      };

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

  // 1. Ajouter requiredAction pour créer une passkey
  async triggerPasskeyRegistration(keycloakId: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    // Récupérer utilisateur pour ne pas écraser les actions existantes
    const userResp = await axios.get(`${this.baseUrl}/users/${keycloakId}`, {
      headers,
    });
    const existingActions: string[] = userResp.data.requiredActions || [];


    if (!existingActions.includes('webauthn-register-passwordless')) {
      existingActions.push('webauthn-register-passwordless');
    }

    await axios.put(
      `${this.baseUrl}/users/${keycloakId}`,
      { requiredActions: existingActions },
      { headers },
    );
  }

  // 2. Lister tous les credentials utilisateur
  async listUserCredentials(keycloakId: string): Promise<any[]> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(
      `${this.baseUrl}/users/${keycloakId}/credentials`,
      { headers },
    );
    return response.data;
  }

  // 3. Supprimer un credential par son ID
  async deleteUserCredential(
    keycloakId: string,
    credentialId: string,
  ): Promise<void> {
    const headers = await this.getAuthHeaders();
    try {
      await axios.delete(
        `${this.baseUrl}/users/${keycloakId}/credentials/${credentialId}`,
        { headers },
      );
    } catch (error) {
      throw new BadRequestException('Impossible de supprimer la clé');
    }
  }

  async listUserSessions(keycloakId: string) {
  const headers = await this.getAuthHeaders();
  const response = await axios.get(
    `${this.baseUrl}/users/${keycloakId}/sessions`,
    { headers },
  );
  return response.data;
}
async revokeSession(sessionId: string) {
  const headers = await this.getAuthHeaders();
  await axios.delete(
    `${this.baseUrl}/sessions/${sessionId}`,
    { headers },
  );
}


}
