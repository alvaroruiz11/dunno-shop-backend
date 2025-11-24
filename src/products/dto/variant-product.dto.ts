import { IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export class VariantProductDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  size: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsPositive()
  stock: number;

  @IsString()
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Invalid sku format' })
  sku: string;

  @IsPositive()
  @IsOptional()
  stockAlert?: number;
}
