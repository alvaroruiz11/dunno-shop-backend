import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from 'generated/prisma';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAddressDto: CreateAddressDto, user: User) {
    const address = await this.prismaService.userAddress.create({
      data: {
        address: createAddressDto.address,
        ci: createAddressDto.ci,
        firstName: createAddressDto.firstName,
        lastName: createAddressDto.lastName,
        phone: createAddressDto.phone,
        cityId: createAddressDto.cityId,
        isDefault: createAddressDto.isDefault,
        reference: createAddressDto.reference,
        userId: user.id,
      },
      include: {
        City: {
          select: {
            id: true,
            name: true,
            Province: {
              select: {
                id: true,
                name: true,
                Department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const { City, ...rest } = address;

    return {
      ...rest,
      department: {
        id: City.Province.Department.id,
        name: City.Province.Department.name,
        province: {
          id: City.Province.id,
          name: City.Province.name,
          city: {
            id: City.id,
            name: City.name,
          },
        },
      },
    };
  }

  async findAllByUserId(userId: string) {
    const userAddress = await this.prismaService.userAddress.findMany({
      where: {
        userId: userId,
      },
      include: {
        City: {
          select: {
            id: true,
            name: true,
            Province: {
              select: {
                id: true,
                name: true,
                Department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        isDefault: 'desc',
      },
    });
    return userAddress.map(({ City, cityId, ...address }) => ({
      ...address,
      department: {
        id: City.Province.Department.id,
        name: City.Province.Department.name,
        province: {
          id: City.Province.id,
          name: City.Province.name,
          city: {
            id: City.id,
            name: City.name,
          },
        },
      },
    }));
  }

  async findOne(id: string) {
    const address = await this.prismaService.userAddress.findFirst({
      where: { id: id },
      include: {
        City: {
          select: {
            id: true,
            name: true,
            Province: {
              select: {
                id: true,
                name: true,
                Department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!address) {
      throw new NotFoundException('Not found address');
    }

    const { City, ...rest } = address;

    return {
      ...rest,
      department: {
        id: City.Province.Department.id,
        name: City.Province.Department.name,
        province: {
          id: City.Province.id,
          name: City.Province.name,
          city: {
            id: City.id,
            name: City.name,
          },
        },
      },
    };
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    await this.findOne(id);

    const { id: _, ...updateData } = updateAddressDto;

    try {
      const updateAddress = await this.prismaService.userAddress.update({
        where: { id: id },
        data: updateData,
        include: {
          City: {
            select: {
              id: true,
              name: true,
              Province: {
                select: {
                  id: true,
                  name: true,
                  Department: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const { City, ...rest } = updateAddress;

      return {
        ...rest,
        department: {
          id: City.Province.Department.id,
          name: City.Province.Department.name,
          province: {
            id: City.Province.id,
            name: City.Province.name,
            city: {
              id: City.id,
              name: City.name,
            },
          },
        },
      };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException('Error updating address');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prismaService.userAddress.delete({ where: { id: id } });
  }
}
