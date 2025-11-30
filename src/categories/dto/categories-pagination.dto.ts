import { IsNumberString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class CategoriesPaginationDto extends PaginationDto {
  @IsOptional()
  @IsNumberString()
  active?: '0' | '1';
}
