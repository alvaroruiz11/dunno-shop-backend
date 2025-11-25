import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MinLength(4)
  firstName: string;

  @IsString()
  @MinLength(4)
  lastName: string;

  @IsString()
  @IsNumberString()
  ci: string;

  @IsString()
  @IsNumberString()
  phone: string;

  @IsString()
  @MinLength(4)
  address: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  cityId: string;
}
