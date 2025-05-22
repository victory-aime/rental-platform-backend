import { Module } from '@nestjs/common';
import { PrismaService } from '_config/services';
import { ManageParcService } from './manage-parc.service';
import { ManageParcController } from './manage-parc.controller';
import { AgencyServices } from '_common/agency/agency.service';

@Module({
  controllers: [ManageParcController],
  providers: [PrismaService, ManageParcService, AgencyServices],
  exports: [ManageParcService],
})
export class ManageParcModule {}
