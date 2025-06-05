import { Module } from '@nestjs/common';
import { CategoryController } from './equipment.controller';
import { EquipmentsService } from './equipment.service';
import { PrismaService } from '_config/services';

@Module({
  controllers: [CategoryController],
  providers: [EquipmentsService, PrismaService],
  exports: [EquipmentsService],
})
export class EquipmentModule {}
