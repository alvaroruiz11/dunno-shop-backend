import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('departments')
  findAllDepartments() {
    return this.locationsService.findAllDepartments();
  }

  @Get('provinces/:departmentId')
  findAllProvincesByDepartment(@Param('departmentId') departmentId: string) {
    return this.locationsService.findAllProvincesByDepartment(departmentId);
  }

  @Get('cities/:provinceId')
  findAllCitiesByProvince(@Param('provinceId') provinceId: string) {
    return this.locationsService.findAllCitiesByProvince(provinceId);
  }
}
