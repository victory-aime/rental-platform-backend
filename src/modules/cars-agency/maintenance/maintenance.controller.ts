import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { MaintenanceService } from './maintenace.service';
import {
  CreateMaintenanceDto,
  FilterMaintenanceDto,
  UpdateMaintenanceDto,
} from './maintence.dto';
import { Roles } from '_config/guard/keycloak.guard';
import { KEYCLOAK_USERS_ROLES } from '_config/enum/global.enum';
import { CARS_MODULES_APIS_URL } from '_config/endpoints/api';
import { MaintenanceStatus, MaintenanceType } from '@prisma/client';

@Controller(CARS_MODULES_APIS_URL.MAINTENANCE_MANAGEMENT.GLOBAL_ROUTES)
@Roles(KEYCLOAK_USERS_ROLES.AUTOMOBILISTE)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get(CARS_MODULES_APIS_URL.MAINTENANCE_MANAGEMENT.LIST)
  async maintenanceList(
    @Query('agencyId') agencyId: string,
    @Query('status') status: MaintenanceStatus,
    @Query('type') type: MaintenanceType,
    @Query('scheduledStartDateTo') scheduledStartDateTo: string,
    @Query('carId') carId: string,
    @Query('scheduledStartDateFrom') scheduledStartDateFrom?: string,
  ) {
    const filters: FilterMaintenanceDto = {
      agencyId,
      carId,
      scheduledStartDateFrom,
      scheduledStartDateTo,
      status,
      type,
    };
    return this.maintenanceService.getMaintenances(filters);
  }

  @Post(CARS_MODULES_APIS_URL.MAINTENANCE_MANAGEMENT.ADD)
  async createMaintenance(@Body() data: CreateMaintenanceDto) {
    return this.maintenanceService.createMaintenance(data);
  }

  @Post(CARS_MODULES_APIS_URL.MAINTENANCE_MANAGEMENT.UPDATE)
  async updateMaintenance(@Body() data: UpdateMaintenanceDto) {
    return this.maintenanceService.updateMaintenance(data);
  }

  @Post(CARS_MODULES_APIS_URL.MAINTENANCE_MANAGEMENT.CLOSED)
  async closedMaintenance(@Query('requestId') requestId: string) {
    return this.maintenanceService.closeMaintenance(requestId);
  }
}
