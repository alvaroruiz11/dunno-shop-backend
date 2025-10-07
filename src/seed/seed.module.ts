import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [PrismaModule],
})
export class SeedModule {}
