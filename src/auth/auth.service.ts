import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.prismaService.user.findFirst({
      where: { email: email },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(`User not exits with email: ${email}`);
    }

    const isMatchPassword = bcrypt.compareSync(password, user.password);

    if (!isMatchPassword) {
      throw new UnauthorizedException('Credentials not valid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    const { password: _, roles, ...rest } = user;

    return {
      token: this.generateJwt({ id: user.id }),
      user: { ...rest, roles: roles.map((role) => role.roleId) },
    };
  }
  async register(registerUserDto: RegisterUserDto) {
    const { email, firstName, lastName, password } = registerUserDto;

    const emailExists = await this.prismaService.user.findFirst({
      where: { email: email },
    });

    if (emailExists) {
      throw new BadRequestException('The user already exists');
    }

    const user = await this.prismaService.user.create({
      data: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        password: bcrypt.hashSync(password, 10),
      },
      include: {
        roles: true,
      },
    });

    const { password: _, roles, ...rest } = user;

    return {
      token: this.generateJwt({ id: user.id }),
      user: { ...rest, roles: roles.map((role) => role.roleId) },
    };
  }
  checkStatus(user: User) {
    return {
      token: this.generateJwt({ id: user.id }),
      user: user,
    };
  }

  private generateJwt(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
