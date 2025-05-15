import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '_config/services';
import { CreateCarDto } from './manage-cars.dto';

@Injectable()
export class ManageCarService {
  constructor(private prisma: PrismaService) {}


async getCarsByAgencyId(establishmentId: string){
  try {
    const findAgency = await this.prisma.carAgency.findUnique({
      where: {establishmentId}
    })
    if(!findAgency){
      throw new UnauthorizedException('Unauthorized access to this agency')
    }
    return await this.prisma.car.findMany({
      where:{agenceId: findAgency?.id}
    })
  } catch (error) {
    console.log('error', error)
    throw new BadRequestException('Failed to fetch cars')
  }
}
  async createCar(dto: CreateCarDto) {
    const { equipmentIds = [], ...carData } = dto;
    // Vérifie si l'agence existe
    const agence = await this.prisma.carAgency.findUnique({
      where: { establishmentId: carData.agenceId },
    });

    if (!agence) {
      throw new BadRequestException('Agence not found');
    }
    console.warn('Aggence found', agence);

    try {
      await this.prisma.car.create({
        data: {
          ...carData,
          agenceId: agence?.id,
          equipments: {
            connect: equipmentIds.map((name) => ({ name })),
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
