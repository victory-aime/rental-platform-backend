import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload, verify, decode } from 'jsonwebtoken';
import { Request } from 'express';
import axios from 'axios';
import { SetMetadata } from '@nestjs/common';

@Injectable()
export class KeycloakRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('Token manquant ou invalide');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = decode(token, { complete: true }) as {
        header: any;
        payload: JwtPayload;
      };
      if (!decodedToken) {
        throw new ForbiddenException('Token invalide');
      }

      const publicKey = await this.getKeycloakPublicKey();

      const verifiedToken = verify(token, publicKey, {
        algorithms: ['RS256'],
      }) as JwtPayload;
      const userRoles = verifiedToken.realm_access?.roles || [];

      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException(
          `Accès refusé : Rôle(s) requis ${requiredRoles.join(', ')}`,
        );
      }

      return true;
    } catch (error) {
      console.error('Erreur de validation du token Keycloak:', error);
      throw new UnauthorizedException('Erreur de validation du token Keycloak');
    }
  }

  private async getKeycloakPublicKey(): Promise<string> {
    try {
      const response = await axios.get(
        process.env.KEYCLOAK_GET_PUBLIC_KEY_URL!,
      );
      const signingKey = response.data.keys.find(
        (key) => key.use === 'sig' && key.alg === 'RS256',
      );

      if (!signingKey) {
        throw new Error('Clé de signature non trouvée');
      }

      return `-----BEGIN CERTIFICATE-----\n${signingKey.x5c[0]}\n-----END CERTIFICATE-----`;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération de la clé publique Keycloak:',
        error,
      );
      throw new ForbiddenException(
        'Impossible de récupérer la clé publique de Keycloak',
      );
    }
  }
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
