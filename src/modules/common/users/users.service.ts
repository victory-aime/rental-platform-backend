import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/config/services';
import { UpdateKeycloakUserDto } from './users.dto';
import { KeycloakService } from 'src/modules/keycloak/keycloak.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloakService: KeycloakService,
  ) {}

  async findUser(
    keycloakId?: string,
    email?: string,
  ): Promise<{
    user: User | null;
  }> {
    if (!keycloakId && !email) {
      return { user: null };
    }

    const user = await this.prisma.user.findFirst({
      where: email ? { email } : { keycloakId },
    });

    return { user };
  }

  async userInfo(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { keycloakId: userId },
        include: {
          establishment: {
            include: {
              subscription: {
                where: { status: 'ACTIVE' },
                include: {
                  plan: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Utilisateur introuvable');
      }

      return {
        ...user,
        establishment: user.establishment
          ? {
              ...user.establishment,
              subscription: user.establishment.subscription || null,
            }
          : null,
      };
    } catch {
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }

  async updateUserInfo(
    data: UpdateKeycloakUserDto,
    keycloakId: string,
  ): Promise<{ message: string }> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const { user } = await this.findUser(keycloakId);
        if (!user) {
          throw new NotFoundException('Utilisateur introuvable');
        }

        const userUpdateData = Object.fromEntries(
          Object.entries({
            name: data?.name,
            firstName: data?.firstName,
            email: data?.email,
            enabled2MFA: data?.enabled2MFA,
            preferredLanguage: data?.preferredLanguage,
            picture: data?.picture === '' ? null : data?.picture,
          }).filter(([key, value]) => {
            if (key === 'picture') return true;
            return value !== undefined && value !== null && value !== '';
          }),
        );
        if (Object.keys(userUpdateData).length === 0) {
          throw new BadRequestException('Aucune donnée valide à mettre à jour');
        }

        await prisma.user.update({
          where: { id: user.id },
          data: userUpdateData,
        });
        return {
          message: 'Compte mis à jour avec succès',
        };
      });
    } catch {
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }

  async deactivate(keycloakId: string, deactivateUser: boolean) {
    try {
      const { user } = await this.findUser(keycloakId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      console.log('keycloakId', keycloakId, 'value', deactivateUser);

      await this.keycloakService.deactivateOrEnabledUser(
        keycloakId,
        deactivateUser,
      );

      return {
        message: 'Compte supprimer',
      };
    } catch {
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }

  async clearAllSessions(keycloakId: string): Promise<void> {
    try {
      const { user } = await this.findUser(keycloakId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }
      await this.keycloakService.closeAllSessions(keycloakId);
    } catch {
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }

  async activateUser(email: string): Promise<{ message: string }> {
    try {
      const { user } = await this.findUser(undefined, email);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      await this.keycloakService.deactivateOrEnabledUser(
        user?.keycloakId ?? '',
        true,
      );
      return { message: 'Compte activé avec succès' };
    } catch {
      throw new BadRequestException(
        'Le service est indisponible pour le moment.',
      );
    }
  }
  async createPasskey(keycloakId: string) {
    try {
      const { user } = await this.findUser(keycloakId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }
      await this.keycloakService.triggerPasskeyRegistration(keycloakId);
      return { message: 'Operation ajoute avec success' };
    } catch {
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }
  async getUserCredentials(keycloakId: string) {
    try {
      const { user } = await this.findUser(keycloakId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }
      const data = await this.keycloakService.listUserCredentials(keycloakId);
      return { message: 'Operation reussie avec success', data };
    } catch {
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }

  async revokeUserCredentials(keycloakId: string, credentialId: string) {
    try {
      const { user } = await this.findUser(keycloakId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }
      await this.keycloakService.deleteUserCredential(keycloakId, credentialId);
      return { message: 'Operation reussie avec success' };
    } catch {
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }
  async revokeSessions(sessionId: string) {
    try {
      await this.keycloakService.revokeSession(sessionId);
      return { message: 'Operation reussie avec success' };
    } catch {
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }
  async getUserSessions(keycloakId: string) {
    try {
      const { user } = await this.findUser(keycloakId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }
      const sessions = await this.keycloakService.listUserSessions(keycloakId);
      return { message: 'Operation reussie avec success', sessions };
    } catch {
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }
}
