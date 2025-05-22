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
      const maintenances = await this.prisma.carMaintenance.findMany({
        where: {
          agencyId: agency?.id
        },
        orderBy: { scheduledStartDate: 'asc' },
      });

      const data = maintenances.map(data => ({
          id: data.id,
          carId: data.carId,
          agencyId: data.agencyId,
          title: data.title,
          description: data.description,
          cost: data.cost,
          plannedDates: {
                 scheduledStartDate: data.scheduledStartDate,
          scheduledEndDate: data.scheduledEndDate,
          },
          type: data.type,
          status: data.status,
          completedAt: data.completedAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }))

      return data
    } catch (error) {
      throw new BadRequestException('Error');
    }
  }

async createMaintenance(dto: CreateMaintenanceDto) {
  const agency = await this.agencyService.findAgency(dto?.agencyId ?? '');

  const car = await this.prisma.car.findUnique({
    where: { id: dto.carId },
    include: {
      bookings: true,
      maintenances: true,
    },
  });

  if (!car) {
    throw new NotFoundException('Car not found');
  }

  // Vérification : maintenance en cours ou planifiée existante
  const hasActiveMaintenance = car.maintenances?.some(
    (m) => m.status !== 'COMPLETED' && m.status !== 'CANCELED'
  );

  if (hasActiveMaintenance) {
    throw new BadRequestException(
      'Une maintenance est déjà en cours ou planifiée pour cette voiture.'
    );
  }

  let scheduledStartDate = dto.scheduledStartDate;
  let scheduledEndDate = dto.scheduledEndDate;
  let message = 'Maintenance créée avec succès.';

  const hasActiveBooking = car.bookings?.some(
    (booking) => booking.status === 'ACTIVE'
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
        lastBooking.endDate.getTime() + 1000
      ).toISOString(); // +1s

      scheduledEndDate = new Date(
        new Date(scheduledStartDate).getTime() + originalDuration
      ).toISOString();

      message = `La voiture est actuellement réservée. La maintenance a été automatiquement planifiée pour commencer après la fin de la réservation, le ${new Date(
        scheduledStartDate
      ).toLocaleString()}.`;
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

  async closeMaintenance(id: string):Promise<{message: string}> {
    try {
       await this.prisma.carMaintenance.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    return {
      message: 'La maintenance de ce vehicule a ete terminée'
    }

    } catch (error) {
      throw new BadRequestException('Probleme survenu lors de la cloture de cette maintenance')
    }
   
  }
}
