import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateKeycloakUserDto, UsersService } from './';
import { COMMON_API_URL } from 'src/config/endpoints/api';
import { KEYCLOAK_USERS_ROLES } from 'src/config/enum/global.enum';
import { KeycloakRolesGuard, Roles } from 'src/config/guard/keycloak.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from '_common/uploads/uploads.service';

@UseGuards(KeycloakRolesGuard)
@Roles(KEYCLOAK_USERS_ROLES.AUTOMOBILISTE, KEYCLOAK_USERS_ROLES.HOTELIER)
@Controller()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private uploadFiles: UploadsService,
  ) {}

  @Get(COMMON_API_URL.USER_MANAGEMENT.USER_INFO)
  async getUserInfo(@Query('userId') userId: string) {
    return this.usersService.userInfo(userId);
  }

  @Patch(COMMON_API_URL.USER_MANAGEMENT.USER_UPDATE)
  @UseInterceptors(FilesInterceptor('picture'))
  async updateInfo(
    @Body() data: UpdateKeycloakUserDto,
    @Query('keycloakId') keycloakId: string,
    @UploadedFiles() file: Express.Multer.File,
  ) {
    let cloudinaryFileUrl: string = '';
    if (file) {
      const uploadResult = await this.uploadFiles.uploadUsersImage(file[0]);
      cloudinaryFileUrl = uploadResult.secure_url;
    }
    return this.usersService.updateUserInfo(
      {
        ...data,
        enabled2MFA:
          typeof data?.enabled2MFA === 'string'
            ? data.enabled2MFA === 'true'
            : !!data?.enabled2MFA,
        picture: cloudinaryFileUrl,
      },
      keycloakId,
    );
  }

  @Put(COMMON_API_URL.USER_MANAGEMENT.DEACTIVATE_ACCOUNT)
  async deactivateAccount(
    @Query('keycloakId') keycloakId: string,
    @Query('deactivateUser') deactivateUser: boolean,
  ) {
    console.log('values', keycloakId, deactivateUser)
    return this.usersService.deactivate(keycloakId, deactivateUser);
  }

  @Post(COMMON_API_URL.USER_MANAGEMENT.CLEAR_ALL_SESSIONS)
  async clearSessions(@Query('keycloakId') keycloakId: string) {
    return this.usersService.clearAllSessions(keycloakId);
  }

  @Post(COMMON_API_URL.USER_MANAGEMENT.ACTIVATE_ACCOUNT)
  async activeAccount(@Body() payload: { email: string }) {
    return this.usersService.activateUser(payload?.email);
  }

  @Post(COMMON_API_URL.USER_MANAGEMENT.REGISTER_PASSKEY)
  async registerPasskey(@Query('keycloakId') keycloakId: string) {
    return this.usersService.createPasskey(keycloakId);
  }
  
  @Post(COMMON_API_URL.USER_MANAGEMENT.REVOKE_PASSKEY)
  async revokeCredential(
    @Query('keycloakId') keycloakId: string,
    @Query('credentialId') credentialId: string,
  ) {
    return this.usersService.revokeUserCredentials(keycloakId, credentialId);
  }
  @Get(COMMON_API_URL.USER_MANAGEMENT.CREDENTIALS_LIST)
  async crendentialList(@Query('keycloakId') keycloakId: string) {
    return this.usersService.getUserCredentials(keycloakId);
  }

  @Get(COMMON_API_URL.USER_MANAGEMENT.MY_SESSIONS)
  async sessions(@Query('keycloakId') keycloakId: string) {
    return this.usersService.getUserSessions(keycloakId);
  }
  @Post(COMMON_API_URL.USER_MANAGEMENT.REVOKE_SESSIONS)
  async revokeSessions(@Query('keycloakId') keycloakId: string) {
    return this.usersService.revokeSessions(keycloakId);
  }
}
