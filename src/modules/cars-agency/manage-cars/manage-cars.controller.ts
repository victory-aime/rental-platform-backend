import { Body, Controller, Post } from '@nestjs/common';
import { CreateCarDto } from './manage-cars.dto';
import { ManageCarService } from './manage-cars.service';
import { Roles } from '_config/guard/keycloak.guard';
import { KEYCLOAK_USERS_ROLES } from '_config/enum/global.enum';
import { CARS_MODULES_APIS_URL } from '_config/endpoints/api';

@Controller(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.GLOBAL_ROUTES)
export class CarController {
  constructor(private readonly carService: ManageCarService) {}

  @Post(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.ADD_CAR)
  @Roles(KEYCLOAK_USERS_ROLES.AUTOMOBILISTE)
  async create(@Body() dto: CreateCarDto) {
    return this.carService.createCar(dto);
  }
}
