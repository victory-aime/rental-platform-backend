import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ManageCarModule } from './manage-cars/manage-cars.module';
import { EquipmentModule } from './equipments/equipment.module';
import { ManageParcModule } from './manage-parcs/manage-parc.module';

@Module({
  imports: [CategoryModule, EquipmentModule, ManageCarModule, ManageParcModule],
})
export class CarModules {}
