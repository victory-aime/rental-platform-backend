import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ManageParcService } from './manage-parc.service';
import { Roles } from '_config/guard/keycloak.guard';
import { KEYCLOAK_USERS_ROLES } from '_config/enum/global.enum';
import { PAGINATION } from '_config/constants/pagination';
import { CARS_MODULES_APIS_URL } from '_config/endpoints/api';
import { ParcDto } from './manage-parc.dto';
import { convertToInteger } from '_config/utils/convert';

@Roles(KEYCLOAK_USERS_ROLES.AUTOMOBILISTE)
@Controller(CARS_MODULES_APIS_URL.PARC_MANAGEMENT.GLOBAL_ROUTES)
export class ManageParcController {
  constructor(private parcsService: ManageParcService) {}

  @Get(CARS_MODULES_APIS_URL.PARC_MANAGEMENT.LIST)
  async parcList(
    @Query('page') page = PAGINATION.INIT,
    @Query('limit') limit = PAGINATION.LIMIT,
    @Query('agencyId') agencyId: string,
    @Query('name') name?: string,
    @Query('carsNumber') carsNumber?: number,
  ) {
    const filters = {
      page: convertToInteger(page || '0'),
      limit: convertToInteger(limit || '0'),
      name,
      carsNumber: convertToInteger(carsNumber || '0'),
    };
    return this.parcsService.listParcs(filters, agencyId);
  }

  @Post(CARS_MODULES_APIS_URL.PARC_MANAGEMENT.ADD)
  async createParc(@Body() data: ParcDto, @Query('agencyId') agencyId: string) {
    return this.parcsService.createParc(data, agencyId);
  }

  @Post(CARS_MODULES_APIS_URL.PARC_MANAGEMENT.UPDATE)
  async updateParc(
    @Body() updateData: ParcDto,
    @Query('agencyId') agencyId: string,
  ) {
    return this.parcsService.updateParc(updateData, agencyId);
  }

  @Delete(CARS_MODULES_APIS_URL.PARC_MANAGEMENT.DELETE)
  async deleteParc(
    @Query('agencyId') agencyId?: string,
    @Query('name') name?: string,
  ) {
    return this.parcsService.deleteParc(agencyId, name);
  }
}
