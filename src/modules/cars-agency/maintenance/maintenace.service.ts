import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '_config/services';
import {
  CreateMaintenanceDto,
  FilterMaintenanceDto,
  UpdateMaintenanceDto,
} from './maintence.dto';
import { AgencyServices } from '_common/agency/agency.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agencyService: AgencyServices,
  ) {}

  async getMaintenances(filter?: FilterMaintenanceDto) {
    try {
      const agency = await this.agencyService.findAgency(
        filter?.agencyId ?? '',
      );

      if (!agency) {
        throw new NotFoundException('Aucune agence trouvée');
      }
      return this.prisma.carMaintenance.findMany({
        where: {
          agencyId: agency?.id
        },
        orderBy: { scheduledStartDate: 'asc' },
      });
    } catch (error) {
      throw new BadRequestException('Error');
    }
  }

  async createMaintenance(dto: CreateMaintenanceDto) {
    const agency = await this.agencyService.findAgency(dto?.agencyId ?? '');
    const car = await this.prisma.car.findUnique({
      where: { id: dto.carId },
      include: { bookings: true },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    let scheduledStartDate = dto.scheduledStartDate;
    let scheduledEndDate = dto.scheduledEndDate;
    let message = 'Maintenance créée avec succès.';
    const hasActiveBooking = car.bookings?.some(
      (booking) => booking.status === 'ACTIVE',
    );

    if (hasActiveBooking) {
      const lastBooking = car.bookings
        .filter((b) => b.endDate > new Date())
        .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];

      if (lastBooking) {
        const originalDuration =
          new Date(dto.scheduledEndDate).getTime() -
          new Date(dto.scheduledStartDate).getTime();

        scheduledStartDate = new Date(
          lastBooking.endDate.getTime() + 1000,
        ).toISOString(); // +1s
        scheduledEndDate = new Date(
          new Date(scheduledStartDate).getTime() + originalDuration,
        ).toISOString();

        message = `La voiture est actuellement réservée. La maintenance a été automatiquement planifiée pour commencer après la fin de la réservation, le ${scheduledStartDate.toLocaleString()}.`;
      }
    }

    const maintenance = await this.prisma.carMaintenance.create({
      data: {
        ...dto,
        agencyId: agency?.id,
        scheduledStartDate,
        scheduledEndDate,
      },
    });

    return {
      data: maintenance,
      message,
    };
  }

  async updateMaintenance(dto: UpdateMaintenanceDto) {
    const agency = await this.agencyService.findAgency(dto?.agencyId ?? '');
    const {id:extractId,...rest}= dto
    return this.prisma.carMaintenance.update({
      where: { id: extractId },
      data: {
        ...rest,
        agencyId: agency?.id,
        updatedAt: new Date(),
      },
    });
  }

  async deleteMaintenance(id: string) {
    return this.prisma.carMaintenance.delete({
      where: { id },
    });
  }

  async closeMaintenance(id: string) {
    return this.prisma.carMaintenance.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }
}
