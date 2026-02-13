import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('districts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher', 'admin', 'district_admin')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  findAll() {
    return this.districtsService.findAll();
  }

  @Get(':id/schools')
  findSchools(@Param('id') id: string) {
    return this.districtsService.findSchoolsByDistrict(id);
  }
}
