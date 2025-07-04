import { Module } from '@nestjs/common';
import { ManageCarService } from './manage-cars.service';
import { PrismaService } from '_config/services';
import { ManageCarsController } from './manage-cars.controller';
import { UploadsService } from '_common/uploads/uploads.service';
import { CloudinaryModule } from '_common/cloudinary/cloudinary.module';
import { AgencyServices } from '_common/agency/agency.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [ManageCarsController],
  providers: [ManageCarService, AgencyServices, PrismaService, UploadsService],
  exports: [ManageCarService],
})
export class ManageCarModule {}
