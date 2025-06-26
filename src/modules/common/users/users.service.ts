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

  async findUserById(keycloakId: string): Promise<{
    user: User | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
    });

    if (!user) {
      return { user: null };
    }
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
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }

  async updateUserInfo(
    data: UpdateKeycloakUserDto,
    keycloakId: string,
  ): Promise<{ message: string }> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const { user } = await this.findUserById(keycloakId);
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
            picture: data?.picture,
          }).filter(([_, value]) => value !== undefined && value !== ''),
        );

        await prisma.user.update({
          where: { id: user.id },
          data: userUpdateData,
        });

        const shouldUpdate2MFA =
          typeof data?.enabled2MFA === 'boolean' &&
          data.enabled2MFA &&
          user.enabled2MFA === false;

        const keycloakPayload = Object.fromEntries(
          Object.entries({
            email: data?.email,
            firstName: data?.firstName,
            lastName: data?.name,
            password: data?.newPassword,
            enabled2MFA: shouldUpdate2MFA ? true : undefined,
          }).filter(([_, value]) => value !== undefined),
        );

        if (Object.keys(keycloakPayload).length > 0) {
          await this.keycloakService.updateUserProfile(
            keycloakId,
            keycloakPayload,
          );
        }

        return {
          message: 'Compte mis à jour avec succès',
        };
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }

  async deactivateOrDisabledUser(keycloakId: string, deactivateUser: boolean) {
    try {
      const { user } = await this.findUserById(keycloakId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      if (deactivateUser) {
        await this.keycloakService.deactivateOrEnabledUser(
          keycloakId,
          deactivateUser,
        );
      } else {
        await this.keycloakService.deactivateOrEnabledUser(
          keycloakId,
          deactivateUser,
        );
      }
      return {
        message: `Compte ${deactivateUser ? 'supprimer' : 'activé'} avec succès`,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }

  async clearAllSessions(keycloakId: string): Promise<void> {
    try {
      const { user } = await this.findUserById(keycloakId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }
      await this.keycloakService.closeAllSessions(keycloakId);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }
}
