import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '_config/services';
import { ParcDto, ParcQueryDto } from './manage-parc.dto';
import { ParkingCar, Prisma } from '@prisma/client';
import { PAGINATION } from '_config/constants/pagination';
import { AgencyServices } from '_common/agency/agency.service';

@Injectable()
export class ManageParcService {
  constructor(
    private prisma: PrismaService,
    private agencyService: AgencyServices,
  ) {}

  async listParcs(
    query: ParcQueryDto,
    agencyId: string,
  ): Promise<{
    content: ParkingCar[];
    totalPages: number;
    currentPage: number;
    totalDataPerPage: number;
  }> {
    const {
      name,
      carsNumber,
      page = PAGINATION.INIT,
      limit = PAGINATION.LIMIT,
    } = query;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.ParkingCarWhereInput = {};

    if (agencyId) {
      const agency = await this.agencyService.findAgency(agencyId);
      if (!agency) {
        throw new NotFoundException(`Agence avec l'ID ${agencyId} non trouvée`);
      }
      whereClause.agencyId = agency.id;
    }

    if (name) {
      whereClause.name = { contains: name, mode: 'insensitive' };
    }

    let parcs: ParkingCar[] = [];
    let total = 0;

    if (typeof carsNumber === 'number' && carsNumber !== 0) {
      const grouped = await this.prisma.car.groupBy({
        by: ['parkingCarId'],
        where: {
          parkingCarId: { not: null },
        },
        _count: { parkingCarId: true },
        having: {
          parkingCarId: {
            _count: {
              equals: carsNumber,
            },
          },
        },
      });

      const matchingParkingIds = grouped
        .map((g) => g.parkingCarId)
        .filter((id): id is string => id !== null);

      const [filteredParcs, filteredTotal] = await this.prisma.$transaction([
        this.prisma.parkingCar.findMany({
          where: {
            ...whereClause,
            id: {
              in: matchingParkingIds.length
                ? matchingParkingIds
                : ['__empty__'],
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { listCar: true } },
          },
        }),
        this.prisma.parkingCar.count({
          where: {
            ...whereClause,
            id: {
              in: matchingParkingIds.length
                ? matchingParkingIds
                : ['__empty__'],
            },
          },
        }),
      ]);

      parcs = filteredParcs;
      total = filteredTotal;
    } else {
      const [allParcs, allTotal] = await this.prisma.$transaction([
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
      parcs = allParcs;
      total = allTotal;
    }

    return {
      content: parcs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalDataPerPage: parcs.length,
    };
  }

  async findParc(agencyId?: string, name?: string) {
    const agency = await this.agencyService.findAgency(agencyId ?? '');

    const parc = await this.prisma.parkingCar.findFirst({
      where: { name, agencyId: agency?.id },
      include: { listCar: true },
    });

    if (!parc) {
      throw new NotFoundException('Aucun parc trouvé');
    }

    return parc;
  }

  async createParc(
    data: ParcDto,
    agencyId: string,
  ): Promise<{ message: string }> {
    const agency = await this.agencyService.findAgency(agencyId);

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
    } catch {
      throw new BadRequestException("Erreur lors de l'ajout du parc");
    }
  }

  async updateParc(
    data: ParcDto,
    agencyId: string,
  ): Promise<{ message: string }> {
    const agency = await this.agencyService.findAgency(agencyId);
    const parc = await this.prisma.parkingCar.findFirst({
      where: {
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
    } catch {
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
    } catch {
      throw new BadRequestException('Erreur lors de la suppression du parc');
    }
  }
}
