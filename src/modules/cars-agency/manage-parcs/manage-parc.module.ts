import { Module } from '@nestjs/common';
import { PrismaService } from '_config/services';
import { ManageParcService } from './manage-parc.service';
import { ManageParcController } from './manage-parc.controller';
import { ManageCarService } from '../manage-cars/manage-cars.service';

@Module({
  controllers: [ManageParcController],
  providers: [PrismaService, ManageParcService, ManageCarService],
  exports: [ManageParcService],
})
export class ManageParcModule {}
