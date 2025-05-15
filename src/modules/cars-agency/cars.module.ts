import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ManageCarModule } from './manage-cars/manage-cars.module';
import { EquipmentModule } from './equipments/equipment.module';

@Module({
  imports: [CategoryModule, EquipmentModule, ManageCarModule],
})
export class CarModules {}
