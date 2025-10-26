import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersPaginationDto } from './dto/users-pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, firstName, lastName, password, roles } = createUserDto;
    const emailExists = await this.prismaService.user.findUnique({
      where: { email: email },
    });

    if (emailExists) {
      throw new BadRequestException('The user already exists');
    }

    try {
      const user = await this.prismaService.user.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          password: bcrypt.hashSync(password, 10),
          ...(roles &&
            roles.length > 0 && {
              roles: {
                create: roles.map((roleId) => ({
                  Role: { connect: { id: roleId } },
                })),
              },
            }),
        },
        include: { roles: true },
      });

      const { roles: userRoles, password: _, ...rest } = user;

      return {
        ...rest,
        roles: userRoles.map((item) => item.roleId),
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Error creating user`);
    }
  }

  async findAll(usersPaginationDto: UsersPaginationDto) {
    const { page = 1, limit = 10, role, active, q: query } = usersPaginationDto;

    const isActiveWhere: Prisma.UserWhereInput = {
      isActive: active === '0' ? false : active === '1' ? true : undefined,
    };

    const roleWhere: Prisma.UserWhereInput =
      role === 'customer'
        ? { roles: { none: {} } }
        : role === 'admin' || role === 'seller'
          ? { roles: { some: { roleId: role } } }
          : {};

    const queryUser: Prisma.UserWhereInput = {
      OR: [
        {
          firstName: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    };
    const [count, users] = await Promise.all([
      this.prismaService.user.count({
        where: {
          AND: [roleWhere, isActiveWhere, queryUser],
        },
      }),
      this.prismaService.user.findMany({
        where: {
          AND: [roleWhere, isActiveWhere, queryUser],
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          roles: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(count / limit);

    return {
      meta: {
        count: count,
        page: page,
        totalPages: totalPages,
      },
      data: users.map(({ password, roles, ...rest }) => {
        return {
          ...rest,
          roles: roles.map((r) => r.roleId),
        };
      }),
    };
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    const { password, roles, ...rest } = user;

    return {
      ...rest,
      roles: roles.map((r) => r.roleId),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    const { id: _, currentPassword, ...updateData } = updateUserDto;

    if (currentPassword && updateData.password) {
      const isMatchPassword = bcrypt.compareSync(
        currentPassword,
        user.password,
      );

      if (!isMatchPassword) {
        throw new BadRequestException('Credential incorrect');
      }

      updateData.password = bcrypt.hashSync(updateData.password, 10);
    }

    try {
      const updateUser = await this.prismaService.user.update({
        where: { id: id },
        data: {
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData.email,
          password: updateData.password,
        },
        include: {
          roles: true,
        },
      });

      const { password, roles, ...rest } = updateUser;
      return {
        ...rest,
        roles: roles.map((r) => r.roleId),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    if (!user.isActive) {
      return user;
    }

    const deleteUser = await this.prismaService.user.update({
      where: { id: id },
      data: {
        isActive: false,
      },
    });

    return deleteUser;
  }

  async active(id: string) {
    const user = await this.findOne(id);

    if (user.isActive) {
      return user;
    }

    const activeUser = await this.prismaService.user.update({
      where: { id: id },
      data: {
        isActive: true,
      },
    });

    return activeUser;
  }
}
