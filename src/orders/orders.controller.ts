import type { Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersPaginationDto } from './dto/orders-pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Query() ordersPaginationDto: OrdersPaginationDto) {
    return this.ordersService.findAll(ordersPaginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Auth()
  @Get('/user/:userId')
  findOrdersByUser(@Param('userId') userId: string) {
    return this.ordersService.findOrdersByUser(userId);
  }

  @Get('invoice/:orderId')
  async getOrderByIdInvoice(
    @Param('orderId') orderId: string,
    @Res() response: Response,
  ) {
    const pdfDoc = await this.ordersService.getOrderByIdInvoice(orderId);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Order-Report';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
