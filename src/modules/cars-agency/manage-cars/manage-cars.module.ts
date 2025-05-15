import { Module } from '@nestjs/common';
import { ManageCarService } from './manage-cars.service';
import { KeycloakService } from 'src/modules/keycloak/keycloak.service';
import { PrismaService } from '_config/services';
import { ManageCarsController } from './manage-cars.controller';
import { UploadsService } from 'src/modules/common/uploads/uploads.service';
import { CloudinaryModule } from 'src/modules/common/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [ManageCarsController],
  providers: [ManageCarService, KeycloakService, PrismaService, UploadsService],
  exports: [ManageCarService],
})
export class ManageCarModule {}
