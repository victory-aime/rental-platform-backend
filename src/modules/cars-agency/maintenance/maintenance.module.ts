import { Module } from '@nestjs/common';
import { PrismaService } from '_config/services';
import { KeycloakService } from 'src/modules/keycloak/keycloak.service';
import { MaintenanceService } from './maintenace.service';
import { AgencyServices } from '_common/agency/agency.service';
import { MaintenanceController } from './maintenance.controller';

@Module({
  controllers: [MaintenanceController],
  providers: [
    KeycloakService,
    PrismaService,
    MaintenanceService,
    AgencyServices,
  ],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
