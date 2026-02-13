import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { TransfersService } from './transfers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Teacher } from '../entities/teacher.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ApproveRejectDto } from './dto/approve-reject.dto';

type ReqUser = Request & { user: Teacher & { school?: { districtId: string } } };

@Controller('transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @Roles('teacher', 'admin', 'district_admin')
  @UseInterceptors(FileInterceptor('proof', { limits: { fileSize: 10 * 1024 * 1024 } }))
  create(
    @Body() dto: CreateTransferDto,
    @Req() req: ReqUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.transfersService.create(dto, req.user, file);
  }

  @Get()
  @Roles('district_admin')
  findPending(@Req() req: ReqUser) {
    return this.transfersService.findPending(req.user);
  }

  @Get(':id')
  @Roles('teacher', 'admin', 'district_admin')
  findOne(@Param('id') id: string, @Req() req: ReqUser) {
    return this.transfersService.findOne(id, req.user);
  }

  @Patch(':id/approve')
  @Roles('district_admin')
  approve(@Param('id') id: string, @Body() dto: ApproveRejectDto, @Req() req: ReqUser) {
    return this.transfersService.approve(id, req.user, dto?.notes);
  }

  @Patch(':id/reject')
  @Roles('district_admin')
  reject(@Param('id') id: string, @Body() dto: ApproveRejectDto, @Req() req: ReqUser) {
    return this.transfersService.reject(id, req.user, dto?.notes);
  }
}
