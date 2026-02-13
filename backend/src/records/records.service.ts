import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../entities/record.entity';
import { Student } from '../entities/student.entity';
import { Teacher } from '../entities/teacher.entity';
import { FileStorageService } from '../common/file-storage.service';
import { AuditService } from '../common/audit.service';
import { CreateWorkDto } from './dto/create-work.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly fileStorage: FileStorageService,
    private readonly audit: AuditService,
  ) {}

  async addWork(
    studentId: string,
    teacher: Teacher & { school?: { districtId: string } },
    dto: CreateWorkDto,
    file?: Express.Multer.File,
  ): Promise<Record> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['district'],
    });
    if (!student) throw new NotFoundException('Student not found');
    if (student.districtId !== teacher.school?.districtId && teacher.role !== 'district_admin') {
      throw new ForbiddenException('Access denied to this student');
    }
    const year = new Date().getFullYear().toString();
    let fileUrl: string;
    if (file?.buffer) {
      fileUrl = this.fileStorage.saveLocal(
        student.districtId,
        studentId,
        year,
        file.originalname || 'file',
        file.buffer,
      );
    } else {
      fileUrl = `/uploads/placeholder-${studentId}-${Date.now()}.txt`;
    }
    const record = this.recordRepo.create({
      studentId,
      teacherId: teacher.id,
      gradeLevel: dto.gradeLevel,
      subject: dto.subject,
      fileUrl,
      notes: dto.notes ?? null,
    });
    const saved = await this.recordRepo.save(record);
    this.audit.log(teacher.id, 'RECORD_CREATE', { recordId: saved.id, studentId });
    return saved;
  }

  async getWork(
    studentId: string,
    teacher: Teacher & { school?: { districtId: string } },
  ): Promise<Record[]> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');
    if (student.districtId !== teacher.school?.districtId && teacher.role !== 'district_admin') {
      throw new ForbiddenException('Access denied to this student');
    }
    return this.recordRepo.find({
      where: { studentId },
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFileStream(
    studentId: string,
    recordId: string,
    teacher: Teacher & { school?: { districtId: string } },
  ): Promise<{ path: string; filename: string }> {
    const record = await this.recordRepo.findOne({
      where: { id: recordId, studentId },
      relations: ['student'],
    });
    if (!record) throw new NotFoundException('Record not found');
    if (
      record.student.districtId !== teacher.school?.districtId &&
      teacher.role !== 'district_admin'
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (!this.fileStorage.exists(record.fileUrl)) {
      throw new NotFoundException('File not found');
    }
    const path = this.fileStorage.getAbsolutePath(record.fileUrl);
    const filename = record.fileUrl.split('/').pop() || 'download';
    return { path, filename };
  }
}
