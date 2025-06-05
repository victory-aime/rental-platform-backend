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

  async findUserById(userId: string): Promise<{
    user: User | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId: userId },
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

      const { keycloakId, ...safeUser } = user;

      return {
        ...safeUser,
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
  ): Promise<{ message: string }> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const { user } = await this.findUserById(data?.keycloakId);
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
          }).filter(([_, value]) => value !== undefined),
        );

        await prisma.user.update({
          where: { id: user.id },
          data: userUpdateData,
        });

        await this.keycloakService.updateUserProfile(data?.keycloakId, {
          email: data?.email,
          enabled2MFA: data?.enabled2MFA,
          firstName: data?.firstName,
          lastName: data?.name,
          password: data?.newPassword,
        });

        return {
          message: 'Compte mis à jour avec succès',
        };
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }
}
