import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ClassroomsService } from './classrooms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Teacher } from '../entities/teacher.entity';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { AddStudentDto } from './dto/add-student.dto';

@Controller('classrooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher', 'admin', 'district_admin')
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Get()
  findAll(@Req() req: Request & { user: Teacher }) {
    return this.classroomsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request & { user: Teacher }) {
    return this.classroomsService.findOne(id, req.user);
  }

  @Post()
  create(@Body() dto: CreateClassroomDto, @Req() req: Request & { user: Teacher }) {
    return this.classroomsService.create(dto, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClassroomDto,
    @Req() req: Request & { user: Teacher },
  ) {
    return this.classroomsService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request & { user: Teacher }) {
    return this.classroomsService.remove(id, req.user);
  }

  @Get(':id/students')
  getStudents(@Param('id') id: string, @Req() req: Request & { user: Teacher }) {
    return this.classroomsService.getStudents(id, req.user);
  }

  @Post(':id/students')
  addStudent(
    @Param('id') id: string,
    @Body() dto: AddStudentDto,
    @Req() req: Request & { user: Teacher & { school?: { districtId: string } } },
  ) {
    return this.classroomsService.addStudent(id, dto.studentId, req.user);
  }

  @Delete(':id/students/:studentId')
  removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Req() req: Request & { user: Teacher },
  ) {
    return this.classroomsService.removeStudent(id, studentId, req.user);
  }
}
