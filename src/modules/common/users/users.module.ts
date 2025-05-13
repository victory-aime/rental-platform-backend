import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/config/services';
import { KeycloakService } from 'src/modules/keycloak/keycloak.service';

@Module({
  providers: [
    UsersService,
    PrismaService,
    KeycloakService,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
