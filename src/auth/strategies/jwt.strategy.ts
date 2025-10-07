import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { envs } from 'src/config';

import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envs.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;

    const user = await this.prismaService.user.findUnique({
      where: { id: id },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token no valid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active');
    }

    const { password, roles, ...rest } = user;

    return {
      ...rest,
      roles: roles.map((role) => role.roleId),
    };
  }
}
