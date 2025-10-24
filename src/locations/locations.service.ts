import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllDepartments() {
    return await this.prismaService.department.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findAllProvincesByDepartment(departmentId: string) {
    return await this.prismaService.province.findMany({
      where: {
        departmentId: departmentId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findAllCitiesByProvince(provinceId: string) {
    return await this.prismaService.city.findMany({
      where: {
        provinceId: provinceId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
