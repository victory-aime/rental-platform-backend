import { Module } from '@nestjs/common';
import { CategoryController } from './equipment.controller';
import { EquipmentsService } from './equipment.service';
import { KeycloakService } from 'src/modules/keycloak/keycloak.service';
import { PrismaService } from '_config/services';

@Module({
  controllers: [CategoryController],
  providers: [EquipmentsService, PrismaService, KeycloakService],
  exports: [EquipmentsService],
})
export class EquipmentModule {}
