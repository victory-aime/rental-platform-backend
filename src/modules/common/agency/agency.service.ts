import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '_config/services';

@Injectable()
export class AgencyServices {
  constructor(private readonly prisma: PrismaService) {}

  async findAgency(establishmentId: string) {
    const findAgency = await this.prisma.carAgency.findUnique({
      where: { establishmentId },
    });
    if (!findAgency) {
      throw new NotFoundException('Aucune agency trouvee');
    }
    return findAgency;
  }
}
