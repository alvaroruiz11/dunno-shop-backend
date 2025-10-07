import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger();

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }
}
