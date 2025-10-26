import { IsNumberString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class UsersPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  role?: 'admin' | 'customer' | 'seller';

  @IsOptional()
  @IsNumberString()
  active?: '0' | '1';
}
