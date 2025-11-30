import { IsNumberString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class ProductsPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  gender?: 'MEN' | 'WOMEN' | 'UNISEX' | 'KID' | '';

  @IsOptional()
  @IsNumberString()
  active?: '0' | '1';
}
