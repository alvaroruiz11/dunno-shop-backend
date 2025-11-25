import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { User } from 'generated/prisma';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Auth()
  @Post()
  create(@Body() createAddressDto: CreateAddressDto, @GetUser() user: User) {
    return this.addressService.create(createAddressDto, user);
  }

  @Auth()
  @Get('user/:id')
  findAllByUserId(@Param('id') userId: string) {
    return this.addressService.findAllByUserId(userId);
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }

  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(id, updateAddressDto);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }
}
