import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create-address.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {
  @IsString()
  @IsOptional()
  id?: string;
}
