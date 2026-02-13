import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Teacher } from '../entities/teacher.entity';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher', 'admin', 'district_admin')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@Req() req: Request & { user: Teacher }) {
    return this.studentsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request & { user: Teacher }) {
    return this.studentsService.findOne(id, req.user);
  }
}