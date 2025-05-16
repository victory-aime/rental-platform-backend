import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '_config/services';
import { CreateCarDto } from './manage-cars.dto';
import { Car } from '@prisma/client';
import { restrictedCarsFields } from '_config/constants/restrictedCarsFields';

@Injectable()
export class ManageCarService {
  constructor(private prisma: PrismaService) {}

  async findAgency(establishmentId: string) {
    const findAgency = await this.prisma.carAgency.findUnique({
      where: { establishmentId },
    });
    if (!findAgency) {
      throw new NotFoundException('Aucune agency trouvee');
    }
    return findAgency;
  }

  async getCarsByAgencyId(establishmentId: string) {
    try {
      const agency = await this.findAgency(establishmentId);

      return await this.prisma.car.findMany({
        where: { agenceId: agency?.id },
        include: {
          bookings: {
            select: {
              status: true,
            },
          },
          equipments: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException('Failed to fetch cars');
    }
  }

  async createCar(dto: CreateCarDto) {
    const { equipmentIds = [], agencyId, id, ...carData } = dto;
    const agence = await this.findAgency(agencyId);

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

  async updateCar(dto: CreateCarDto): Promise<{ message: string }> {
    const { agencyId, ...carData } = dto;
    const car = await this.prisma.car.findUnique({
      where: { id: dto?.id },
      include: {
        bookings: {
          where: {
            endDate: { gte: new Date() }, // Réservations en cours ou futures
            status: { in: ['PENDING', 'ACTIVE'] }, // à adapter selon ton enum
          },
        },
      },
    });

    if (!car) throw new NotFoundException('Voiture introuvable');

    const isReserved = car.bookings?.length > 0;

    if (isReserved) {
      for (const field of restrictedCarsFields) {
        if (dto[field] !== undefined) {
          throw new BadRequestException(
            `Modification du champ "${field}" interdite : la voiture est réservée.`,
          );
        }
      }
    }

    // Remove carCategoryId and equipmentIds from carData before updating
    const { carCategoryId, equipmentIds, ...updateData } = carData;

    await this.prisma.car.update({
      where: { id: dto?.id },
      data: {
        ...updateData,
        carCategory: carCategoryId
          ? { connect: { id: carCategoryId } }
          : undefined,
        equipments: equipmentIds
          ? {
              set: equipmentIds.map((name) => ({ name })),
            }
          : undefined,
      },
    });

    return {
      message: 'Car updated successfuly',
    };
  }
}
