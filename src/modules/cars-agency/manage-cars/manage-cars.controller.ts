import {
  Body,
  Controller,
  Post,
  Query,
  Get,
  UploadedFiles,
  UseInterceptors,
  Patch,
  Delete,
} from '@nestjs/common';
import { CreateCarDto } from './manage-cars.dto';
import { ManageCarService } from './manage-cars.service';
import { Roles } from '_config/guard/keycloak.guard';
import { KEYCLOAK_USERS_ROLES } from '_config/enum/global.enum';
import { CARS_MODULES_APIS_URL } from '_config/endpoints/api';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from 'src/modules/common/uploads/uploads.service';
import { normalizeCarDto } from '_config/utils/function';

@Roles(KEYCLOAK_USERS_ROLES.AUTOMOBILISTE)
@Controller(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.GLOBAL_ROUTES)
export class ManageCarsController {
  constructor(
    private readonly carService: ManageCarService,
    private uploadFiles: UploadsService,
  ) {}

  @Post(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.ADD_CAR)
  @UseInterceptors(FilesInterceptor('carImages'))
  async create(
    @Body() dto: CreateCarDto,
    @Query('agencyId') agencyId: string,
    @Query('agencyName') agencyName: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let cloudinaryFilesUrl: string[] = [];

    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map((file) =>
          this.uploadFiles.uploadImage(file, agencyName || 'default-agency'),
        ),
      );
      cloudinaryFilesUrl = uploadResults.map((res) => res.secure_url);
    }

    const data = normalizeCarDto(dto);

    return this.carService.createCar(
      {
        ...data,
        carImages: cloudinaryFilesUrl,
      },
      agencyId,
    );
  }

  @Get(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.GET_CARS)
  async getCarsByAgencyId(@Query('establishment') establishment: string) {
    return this.carService.getCarsByAgencyId(establishment);
  }

  @Patch(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.UPDATE_CAR)
  @UseInterceptors(FilesInterceptor('carImages'))
  async updateCar(
    @Body() dto: CreateCarDto,
    @Query('requestId') requestId: string,
    @Query('agencyName') agencyName: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let cloudinaryFilesUrl: string[] = [];

    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map((file) =>
          this.uploadFiles.uploadImage(file, agencyName || 'default-agency'),
        ),
      );
      cloudinaryFilesUrl = uploadResults.map((res) => res.secure_url);
    }

    const data = normalizeCarDto(dto);

    return this.carService.updateCar(
      {
        ...data,
        carImages: cloudinaryFilesUrl,
      },
      requestId,
    );
  }

  @Delete(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.DELETE_CAR)
  async deleteCar(@Query('carId') carId: string) {
    return this.carService.deleteCar(carId);
  }

  @Delete(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.DELETE_ALL_CARS)
  async deleteAllCars(
    @Query('agencyId') agencyId: string,
    @Query('agencyName') agencyName: string,
  ) {
    return this.carService.deleteAllCars(agencyId, agencyName);
  }
}
