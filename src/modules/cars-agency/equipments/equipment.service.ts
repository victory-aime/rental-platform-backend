import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '_config/services';

@Injectable()
export class EquipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all equipments from the database.
   *
   * @returns List of existing equipments.
   */
  async getEquipments(): Promise<{ id: string; name: string }[]> {
    try {
      const equipments = await this.prisma.carEquipments.findMany();
      return equipments.map(({ id, name }) => ({ id, name }));
    } catch (error) {
      console.error('Error reading equipments:', error);
      throw new BadRequestException('Failed to read equipments');
    }
  }

  /**
   * Adds one or multiple new equipments.
   *
   * @param data Single string, string[], or { name: string }[]
   * @throws {BadRequestException} If duplicates are detected or input format is invalid.
   * @returns Result message and list of newly added equipments.
   */
  async addEquipments(data: string | string[] | { name: string }[]): Promise<{
    message: string;
    equipments: { id: string; name: string }[];
  }> {
    // Normalize input to string[]
    let names: string[];

    if (typeof data === 'string') {
      names = [data];
    } else if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new BadRequestException('equipment list is empty');
      }

      // Check if it's array of strings or array of objects
      if (typeof data[0] === 'string') {
        names = data as string[];
      } else if ('name' in data[0]) {
        names = (data as { name: string }[]).map((item) => item.name);
      } else {
        throw new BadRequestException('Invalid equipment format');
      }
    } else {
      throw new BadRequestException('Invalid equipment data');
    }

    // Check for duplicates in input
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      throw new BadRequestException('Duplicate equipment names in input');
    }

    // Check for existing equipments in DB
    const existing = await this.prisma.carEquipments.findMany({
      where: { name: { in: [...uniqueNames] } },
    });

    if (existing.length > 0) {
      const existingNames = existing.map((c) => c.name).join(', ');
      throw new BadRequestException(
        `equipments already exist: ${existingNames}`,
      );
    }

    // Create equipments
    const created = await Promise.all(
      [...uniqueNames].map((name) =>
        this.prisma.carEquipments.create({ data: { name } }),
      ),
    );

    return {
      message: 'Equipment(ies) added successfully!',
      equipments: created.map(({ id, name }) => ({ id, name })),
    };
  }
}
