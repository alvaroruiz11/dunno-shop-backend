import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { VariantProductDto } from './variant-product.dto';
import { Type } from 'class-transformer';
import { Gender } from 'generated/prisma';
export class CreateProductDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @Matches(/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/, { message: 'Invalid slug format' })
  slug: string;

  @IsNumber()
  @IsPositive()
  costPrice: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  salePrice?: number;

  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantProductDto)
  variants: VariantProductDto[];

  @IsString()
  @IsUUID()
  categoryId: string;
}
