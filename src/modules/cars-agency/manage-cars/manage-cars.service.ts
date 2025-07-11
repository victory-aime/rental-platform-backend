import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '_config/services';
import { CreateCarDto } from './manage-cars.dto';
import { restrictedCarsFields } from '_config/constants/restrictedCarsFields';
import { AgencyServices } from '_common/agency/agency.service';
import { extractPublicIdFromUrl } from '_config/utils/extract-public-id';
import {} from '_common/cloudinary/cloudinary.service';
import { UploadsService } from '_common/uploads/uploads.service';

@Injectable()
export class ManageCarService {
  constructor(
    private prisma: PrismaService,
    private readonly agencyService: AgencyServices,
    private readonly uploadImagesServices: UploadsService,
  ) {}

  async getCarsByAgencyId(establishmentId: string) {
    try {
      const agency = await this.agencyService.findAgency(establishmentId);

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
    } catch {
      throw new BadRequestException('Failed to fetch cars');
    }
  }

  async createCar(dto: CreateCarDto, agencyId: string) {
    const { equipmentIds, ...carData } = dto;
    const agency = await this.agencyService.findAgency(agencyId);

    let equipmentsConnect;
    if (Array.isArray(equipmentIds) && equipmentIds.length > 0) {
      equipmentsConnect = {
        connect: equipmentIds.map((name) => ({ name })),
      };
    } else if (equipmentIds && typeof equipmentIds === 'string') {
      equipmentsConnect = {
        connect: [{ name: equipmentIds }],
      };
    } else {
      equipmentsConnect = undefined;
    }

    try {
      await this.prisma.car.create({
        data: {
          ...carData,
          agenceId: agency?.id,
          equipments: equipmentsConnect,
        },
        include: {
          equipments: true,
          carCategory: true,
          parkingCar: true,
          agence: true,
        },
      });

      return {
        message: 'Car created successfuly',
      };
    } catch {
      throw new BadRequestException('Failed to create car');
    }
  }

  async updateCar(
    dto: CreateCarDto,
    requestId: string,
  ): Promise<{ message: string }> {
    const car = await this.prisma.car.findUnique({
      where: { id: requestId },
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
    const { carCategoryId, parkingCarId, equipmentIds, ...updateData } = dto;

    await this.prisma.car.update({
      where: { id: requestId },
      data: {
        ...updateData,
        parkingCar: parkingCarId
          ? { connect: { id: parkingCarId } }
          : undefined,
        carCategory: carCategoryId
          ? { connect: { id: carCategoryId } }
          : undefined,
        equipments: equipmentIds
          ? {
              set: Array.isArray(equipmentIds)
                ? equipmentIds.map((name) => ({ name }))
                : [{ name: equipmentIds }],
            }
          : undefined,
      },
    });

    return {
      message: 'Car updated successfuly',
    };
  }

  async deleteAllCars(agencyId: string) {
    const now = new Date();

    const carsToDelete = await this.prisma.car.findMany({
      where: {
        agenceId: agencyId,
        bookings: {
          none: {
            status: { in: ['ACTIVE', 'PENDING'] },
            endDate: { gte: now },
          },
        },
      },
      select: {
        id: true,
        carImages: true,
      },
    });

    if (!carsToDelete.length) {
      return { message: 'No eligible cars found for deletion' };
    }

    for (const car of carsToDelete) {
      for (const imageUrl of car.carImages) {
        const publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          try {
            await this.uploadImagesServices.deleteCarImages(publicId);
          } catch (err) {
            console.error(`Erreur suppression image ${publicId} :`, err);
          }
        }
      }
    }
    await this.prisma.car.deleteMany({
      where: {
        id: { in: carsToDelete.map((car) => car.id) },
      },
    });

    return {
      message: `${carsToDelete.length} car(s) deleted successfully`,
    };
  }

  async deleteCar(carId: string) {
    const now = new Date();

    const car = await this.prisma.car.findFirst({
      where: {
        id: carId,
        bookings: {
          none: {
            status: { in: ['ACTIVE', 'PENDING'] },
            endDate: { gte: now },
          },
        },
      },
      select: {
        id: true,
        carImages: true,
      },
    });

    if (!car) {
      throw new BadRequestException(
        "Car has active or future bookings or doesn't exist",
      );
    }

    // 2. Supprimer les images de Cloudinary
    for (const imageUrl of car.carImages) {
      const publicId = extractPublicIdFromUrl(imageUrl);
      if (publicId) {
        try {
          await this.uploadImagesServices.deleteCarImages(publicId);
        } catch (err) {
          console.error(`Erreur suppression image ${publicId} :`, err);
        }
      }
    }

    // 3. Supprimer la voiture en base
    await this.prisma.car.delete({
      where: { id: carId },
    });

    return { message: 'Car and associated images deleted successfully' };
  }
}
