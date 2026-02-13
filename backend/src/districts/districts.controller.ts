import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
  findAll(@Query('state') state?: string) {
    return this.districtsService.findAll(state);
  }

  @Get(':id/schools')
  findSchools(@Param('id') id: string) {
    return this.districtsService.findSchoolsByDistrict(id);
  }
}
