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
        enabled2MFA: Boolean(data.enabled2MFA),
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
    return this.usersService.deactivateOrDisabledUser(
      keycloakId,
      deactivateUser,
    );
  }

  @Post(COMMON_API_URL.USER_MANAGEMENT.CLEAR_ALL_SESSIONS)
  async clearSessions(@Query('keycloakId') keycloakId: string) {
    console.log('keycloakId', keycloakId);
    return this.usersService.clearAllSessions(keycloakId);
  }
}
