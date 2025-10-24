import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class OrderAddressDto {
  @IsString()
  @MinLength(3)
  firstName: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  ci: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(3)
  address: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsUUID()
  cityId: string;
}
