import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { RecordsService } from './records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Teacher } from '../entities/teacher.entity';
import { CreateWorkDto } from './dto/create-work.dto';

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
};

function getContentType(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? EXT_TO_MIME[ext] : undefined;
}

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher', 'admin', 'district_admin')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post(':id/work')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  addWork(
    @Param('id') studentId: string,
    @Body() dto: CreateWorkDto,
    @Req() req: Request & { user: Teacher & { school?: { districtId: string } } },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.recordsService.addWork(studentId, req.user, dto, file);
  }

  @Get(':id/work')
  getWork(
    @Param('id') studentId: string,
    @Req() req: Request & { user: Teacher & { school?: { districtId: string } } },
  ) {
    return this.recordsService.getWork(studentId, req.user);
  }

  @Get(':studentId/records/:recordId/file')
  async getFile(
    @Param('studentId') studentId: string,
    @Param('recordId') recordId: string,
    @Req() req: Request & { user: Teacher & { school?: { districtId: string } } },
    @Res() res: Response,
  ) {
    const { path: filePath, filename } = await this.recordsService.getFileStream(
      studentId,
      recordId,
      req.user,
    );
    const contentType = getContentType(filename);
    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    createReadStream(filePath).pipe(res);
  }
}
