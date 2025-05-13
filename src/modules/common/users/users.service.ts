import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/config/services';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findUserByEmail(email: string): Promise<{
    user: User | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {user: null};
    }
    return { user };
  }

  async findUserById(userId: string): Promise<{
    user: User | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId: userId },
    });

    if (!user) {
      return {user:null};
    }
    return { user };
  }

 
  async userInfo(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { keycloakId: userId },
        include: {
          etablissement: {
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
        etablissement: user.etablissement
          ? {
              ...user.etablissement,
              subscription: user.etablissement.subscription || null,
           
            }
          : null,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Service indisponible pour le moment');
    }
  }
  
  
}
