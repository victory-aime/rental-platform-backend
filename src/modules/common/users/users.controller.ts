import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './';
import { COMMON_API_URL } from 'src/config/endpoints/api';
import { KEYCLOAK_USERS_ROLES } from 'src/config/enum/global.enum';
import { KeycloakRolesGuard, Roles } from 'src/config/guard/keycloak.guard';

@UseGuards(KeycloakRolesGuard)
@Roles(KEYCLOAK_USERS_ROLES.AUTOMOBILISTE, KEYCLOAK_USERS_ROLES.HOTELIER)
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(COMMON_API_URL.USER_MANAGEMENT.USER_INFO)
  async getUserInfo(@Query('userId') userId: string) {
    return this.usersService.userInfo(userId);
  }
}
