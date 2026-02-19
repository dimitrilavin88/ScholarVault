import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ClassTransfersService } from './class-transfers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Teacher } from '../entities/teacher.entity';
import { CreateClassTransferDto } from './dto/create-class-transfer.dto';

type ReqUser = Request & { user: Teacher };

@Controller('class-transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher', 'admin')
export class ClassTransfersController {
  constructor(private readonly classTransfersService: ClassTransfersService) {}

  @Post()
  create(@Body() dto: CreateClassTransferDto, @Req() req: ReqUser) {
    return this.classTransfersService.create(dto, req.user);
  }

  @Get('incoming')
  findPendingIncoming(@Req() req: ReqUser) {
    return this.classTransfersService.findPendingIncoming(req.user);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Req() req: ReqUser) {
    return this.classTransfersService.accept(id, req.user);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Req() req: ReqUser) {
    return this.classTransfersService.reject(id, req.user);
  }
}
