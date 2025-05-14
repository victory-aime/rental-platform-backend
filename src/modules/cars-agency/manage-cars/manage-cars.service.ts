import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '_config/services';
import { CreateCarDto } from './manage-cars.dto';

@Injectable()
export class ManageCarService {
  constructor(private prisma: PrismaService) {}

  async createCar(dto: CreateCarDto) {
    const { equipmentIds = [], ...carData } = dto;

    try {
      await this.prisma.car.create({
        data: {
          ...carData,
          discountType: carData.discountType,
          agenceId: carData.agenceId,
          equipments: {
            connect: equipmentIds.map((id) => ({ id })),
          },
        },
        include: {
          equipments: true,
          carCategory: true,
          agence: true,
        },
      });

      return {
        message: 'Car created successfuly',
      };
    } catch (error) {
      console.error('Error creating car:', error);
      throw new BadRequestException('Failed to create car');
    }
  }
}
