import { IsOptional, IsString } from 'class-validator';
import { Gender } from 'generated/prisma';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class ProductsPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  gender?: 'MEN' | 'WOMEN' | 'UNISEX' | 'KID' | '';
}
