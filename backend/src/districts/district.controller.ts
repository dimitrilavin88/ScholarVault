import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Teacher } from '../entities/teacher.entity';
import { DistrictsService } from './districts.service';
import { ClassroomsService } from '../classrooms/classrooms.service';

type TeacherWithSchool = Teacher & { school?: { districtId: string } };

@Controller('district')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('district_admin')
export class DistrictController {
  constructor(
    private readonly districtsService: DistrictsService,
    private readonly classroomsService: ClassroomsService,
  ) {}

  @Get('unenrolled-students')
  getUnenrolledStudents(@Req() req: Request & { user: TeacherWithSchool }) {
    const districtId = req.user.school?.districtId;
    if (!districtId) return [];
    return this.classroomsService.getUnenrolledStudentsInDistrict(districtId);
  }

  @Get('schools')
  getMySchools(@Req() req: Request & { user: TeacherWithSchool }) {
    const districtId = req.user.school?.districtId;
    if (!districtId) return [];
    return this.districtsService.findSchoolsByDistrict(districtId);
  }

  @Get('schools/:schoolId/grade-levels')
  async getGradeLevels(
    @Param('schoolId') schoolId: string,
    @Req() req: Request & { user: TeacherWithSchool },
  ) {
    const districtId = req.user.school?.districtId;
    if (!districtId) return [];
    await this.districtsService.findSchoolByIdAndDistrict(schoolId, districtId);
    return this.classroomsService.getGradeLevelsForSchool(schoolId);
  }

  @Get('schools/:schoolId/grade-levels/:gradeLevel/homerooms')
  async getHomerooms(
    @Param('schoolId') schoolId: string,
    @Param('gradeLevel') gradeLevel: string,
    @Req() req: Request & { user: TeacherWithSchool },
  ) {
    const districtId = req.user.school?.districtId;
    if (!districtId) return [];
    await this.districtsService.findSchoolByIdAndDistrict(schoolId, districtId);
    return this.classroomsService.getHomeroomsForGrade(schoolId, gradeLevel);
  }
}
