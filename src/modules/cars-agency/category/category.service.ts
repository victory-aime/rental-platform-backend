import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '_config/services';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  /**
   * Retrieves all categories from the database.
   *
   * @returns List of existing categories.
   */
  async getCategories() {
    try {
      return await this.prisma.carCategory.findMany();
    } catch (error) {
      console.error('Error reading categories:', error);
      throw new BadRequestException('Failed to read categories');
    }
  }

  /**
   * Adds one or multiple new categories.
   * 
   * @param data Single string, string[], or { name: string }[]
   * @throws {BadRequestException} If duplicates are detected or input format is invalid.
   * @returns Result message and list of newly added categories.
   */
  async addCategory(
    data: string | string[] | { name: string }[]
  ): Promise<{
    message: string;
    categories: { id: string; name: string }[];
  }> {
    // Normalize input to string[]
    let names: string[];

    if (typeof data === 'string') {
      names = [data];
    } else if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new BadRequestException('Category list is empty');
      }

      // Check if it's array of strings or array of objects
      if (typeof data[0] === 'string') {
        names = data as string[];
      } else if ('name' in data[0]) {
        names = (data as { name: string }[]).map((item) => item.name);
      } else {
        throw new BadRequestException('Invalid category format');
      }
    } else {
      throw new BadRequestException('Invalid category data');
    }

    // Check for duplicates in input
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      throw new BadRequestException('Duplicate category names in input');
    }

    // Check for existing categories in DB
    const existing = await this.prisma.carCategory.findMany({
      where: { name: { in: [...uniqueNames] } },
    });

    if (existing.length > 0) {
      const existingNames = existing.map((c) => c.name).join(', ');
      throw new BadRequestException(`Categories already exist: ${existingNames}`);
    }

    // Create categories
    const created = await Promise.all(
      [...uniqueNames].map((name) =>
        this.prisma.carCategory.create({ data: { name } })
      )
    );

    return {
      message: 'Category(ies) added successfully!',
      categories: created.map(({ id, name }) => ({ id, name })),
    };
  }
}
