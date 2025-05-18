import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '_config/services';
import { ParcDto, ParcQueryDto } from './manage-parc.dto';
import { ParkingCar } from '@prisma/client';
import { PAGINATION } from '_config/constants/pagination';
import { ManageCarService } from '../manage-cars/manage-cars.service';

@Injectable()
export class ManageParcService {
  constructor(
    private prisma: PrismaService,
    private carsService: ManageCarService,
  ) {}

  async listParcs(query: ParcQueryDto): Promise<{
    content: ParkingCar[];
    totalPages: number;
    currentPage: number;
    totalDataPerPage: number;
  }> {
    const {
      agencyId,
      page = PAGINATION.INIT,
      limit = PAGINATION.LIMIT,
    } = query;
    let findAgency;
    if (agencyId) {
      findAgency = await this.carsService.findAgency(agencyId); // vérifie l'existence de l'agence
    }

    const skip = (page - 1) * limit;
    const whereClause = agencyId ? { agencyId: findAgency?.id } : {};

    const [parcs, total] = await this.prisma.$transaction([
      this.prisma.parkingCar.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { listCar: true } },
        },
      }),
      this.prisma.parkingCar.count({ where: whereClause }),
    ]);

    return {
      content: parcs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalDataPerPage: parcs.length,
    };
  }

  async findParc(agencyId?: string, name?: string) {
    const agency = await this.carsService.findAgency(agencyId ?? '');

    const parc = await this.prisma.parkingCar.findFirst({
      where: { name, agencyId: agency?.id },
      include: { listCar: true },
    });

    if (!parc) {
      throw new NotFoundException('Aucun parc trouvé');
    }

    return parc;
  }

  async createParc(data: ParcDto): Promise<{ message: string }> {
    const agency = await this.carsService.findAgency(data.agencyId ?? '');

    const existingParc = await this.prisma.parkingCar.findFirst({
      where: {
        name: data.name,
        agencyId: agency?.id,
      },
    });

    if (existingParc) {
      throw new ConflictException(
        'Un parc avec ce nom existe déjà pour cette agence',
      );
    }

    try {
      await this.prisma.parkingCar.create({
        data: {
          name: data.name,
          address: data.address,
          carAgency: {
            connect: { id: agency.id },
          },
        },
      });

      return { message: 'Le parc a été ajouté avec succès' };
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException("Erreur lors de l'ajout du parc");
    }
  }

  async updateParc(data: ParcDto): Promise<{ message: string }> {
    const agency = await this.carsService.findAgency(data.agencyId ?? '');

    const parc = await this.prisma.parkingCar.findFirst({
      where: {
        name: data.name,
        agencyId: agency?.id,
      },
    });

    if (!parc) {
      throw new NotFoundException('Aucun parc trouvé pour mise à jour');
    }

    try {
      await this.prisma.parkingCar.update({
        where: { id: parc.id },
        data: {
          name: data.name,
          address: data.address,
          carAgency: {
            connect: { id: agency?.id },
          },
        },
      });

      return { message: 'Parc mis à jour avec succès' };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la mise à jour du parc');
    }
  }

  async deleteParc(
    agencyId?: string,
    name?: string,
  ): Promise<{ message: string }> {
    const parc = await this.findParc(agencyId, name);

    if (!parc) {
      throw new NotFoundException('Parc introuvable');
    }

    try {
      if (parc.listCar.length > 0) {
        await this.prisma.car.updateMany({
          where: { parkingCarId: parc.id },
          data: { parkingCarId: null },
        });
      }
      await this.prisma.parkingCar.delete({
        where: { id: parc.id },
      });

      return { message: 'Parc supprimé avec succès' };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la suppression du parc');
    }
  }
}
