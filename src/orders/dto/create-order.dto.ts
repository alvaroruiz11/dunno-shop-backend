import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderItemDto } from './order-item.dto';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'generated/prisma';
import { OrderAddressDto } from './order-address.dto';

export class CreateOrderDto {
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsBoolean()
  @IsOptional()
  isOnlineSale?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsDefined({ message: 'The shipping address is required' })
  @ValidateNested()
  @Type(() => OrderAddressDto)
  address: OrderAddressDto;

  @IsString()
  @IsOptional()
  userId?: string;
}
