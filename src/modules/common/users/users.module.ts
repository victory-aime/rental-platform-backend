import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/config/services';
import { KeycloakModule } from 'src/modules/keycloak/keycloak.module';
import { CloudinaryModule } from '_common/cloudinary/cloudinary.module';
import { UploadsService } from '_common/uploads/uploads.service';

@Module({
 imports: [KeycloakModule, CloudinaryModule],
  providers: [UsersService, PrismaService, UploadsService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
