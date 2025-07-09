import { Body, Controller, Post, Get } from '@nestjs/common';
import { EquipmentsService } from './equipment.service';
import { COMMON_API_URL } from 'src/config/endpoints/api';

//@ApiTags(SWAGGER_TAGS.CATEGORIES)
@Controller(COMMON_API_URL.EQUIPMENTS.GLOBAL_ROUTES)
export class CategoryController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Get()
  getEquipments() {
    return this.equipmentsService.getEquipments();
  }
  //@Roles(KEYCLOAK_USERS_ROLES.ADMIN)
  @Post(COMMON_API_URL.EQUIPMENTS.ADD)
  async addNewEquipment(@Body() data: string | string[]) {
    return this.equipmentsService.addEquipments(data);
  }
}
