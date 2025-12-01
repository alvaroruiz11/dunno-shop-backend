import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrinterModule } from 'src/printer/printer.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [PrismaModule, AuthModule, PrinterModule],
})
export class OrdersModule {}
