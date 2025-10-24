import { IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsUUID()
  productVariantId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  // @IsNumber()
  // @IsPositive()
  // price: number;
}
