import { Body, Controller, Post, Query, Get, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CreateCarDto } from './manage-cars.dto';
import { ManageCarService } from './manage-cars.service';
import { Roles } from '_config/guard/keycloak.guard';
import { KEYCLOAK_USERS_ROLES } from '_config/enum/global.enum';
import { CARS_MODULES_APIS_URL } from '_config/endpoints/api';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from 'src/modules/common/uploads/uploads.service';
import { normalizeCarDto } from '_config/utils/function';


@Controller(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.GLOBAL_ROUTES)
export class ManageCarsController {
  constructor(private readonly carService: ManageCarService, private uploadFiles: UploadsService) {}

  @Post(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.ADD_CAR)
  @Roles(KEYCLOAK_USERS_ROLES.AUTOMOBILISTE)
  @UseInterceptors(FilesInterceptor('carImages'))
  async create(
    @Body() dto: CreateCarDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    let cloudinaryFilesUrl: string[] = [];
  
    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map((file) => this.uploadFiles.uploadImage(file, dto?.agencyName || 'default-agency'))
      );
      cloudinaryFilesUrl = uploadResults.map((res) => res.secure_url);
    }
    
const data = normalizeCarDto(dto)



    return this.carService.createCar({
      ...data,
      carImages: cloudinaryFilesUrl
    });
  }
  @Get(CARS_MODULES_APIS_URL.CARS_MANAGEMENT.GET_CARS)
@Roles(KEYCLOAK_USERS_ROLES.AUTOMOBILISTE)
  async getCarsByAgencyId(@Query('etablissementId') etablissementId: string) {
    return this.carService.getCarsByAgencyId(etablissementId);
  }
  
}
