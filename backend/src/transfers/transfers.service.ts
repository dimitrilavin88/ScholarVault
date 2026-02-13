import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentTransfer } from '../entities/student-transfer.entity';
import { Student } from '../entities/student.entity';
import { Teacher } from '../entities/teacher.entity';
import { FileStorageService } from '../common/file-storage.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

type TeacherWithSchool = Teacher & { school?: { districtId: string } };

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(StudentTransfer)
    private readonly transferRepo: Repository<StudentTransfer>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly fileStorage: FileStorageService,
  ) {}

  async create(
    dto: CreateTransferDto,
    teacher: TeacherWithSchool,
    file?: Express.Multer.File,
  ): Promise<StudentTransfer> {
    const student = await this.studentRepo.findOne({
      where: { id: dto.studentId },
      relations: ['district'],
    });
    if (!student) throw new NotFoundException('Student not found');
    if (dto.dob && student.dob !== dto.dob) {
      throw new BadRequestException('Date of birth does not match student record');
    }
    if (student.districtId !== dto.oldDistrictId) {
      throw new BadRequestException('Student is not in the specified previous district');
    }
    if (teacher.role !== 'district_admin') {
      const teacherDistrictId = teacher.school?.districtId;
      if (teacherDistrictId && teacherDistrictId !== dto.oldDistrictId) {
        throw new ForbiddenException('You can only request transfers for students in your district');
      }
    }

    const transfer = this.transferRepo.create({
      studentId: dto.studentId,
      oldDistrictId: dto.oldDistrictId,
      newDistrictId: dto.newDistrictId ?? null,
      oldSchoolId: dto.oldSchoolId ?? null,
      newSchoolId: dto.newSchoolId ?? null,
      requestedById: teacher.id,
      status: 'pending',
      notes: dto.notes ?? null,
    });
    const saved = await this.transferRepo.save(transfer);

    if (file?.buffer) {
      const proofUrl = this.fileStorage.saveTransferProof(
        saved.id,
        file.originalname,
        file.buffer,
      );
      saved.proofFileUrl = proofUrl;
      await this.transferRepo.update(saved.id, { proofFileUrl: proofUrl });
    }

    return this.findOne(saved.id, teacher);
  }

  async findPending(teacher: TeacherWithSchool): Promise<StudentTransfer[]> {
    if (teacher.role !== 'district_admin') {
      throw new ForbiddenException('Only district admins can view the transfer approval dashboard');
    }
    return this.transferRepo.find({
      where: { status: 'pending' },
      relations: ['student', 'oldDistrict', 'newDistrict', 'oldSchool', 'newSchool', 'requestedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, teacher: TeacherWithSchool): Promise<StudentTransfer> {
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: ['student', 'oldDistrict', 'newDistrict', 'oldSchool', 'newSchool', 'requestedBy', 'approvedBy'],
    });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    if (teacher.role !== 'district_admin') {
      const teacherDistrictId = teacher.school?.districtId;
      if (teacherDistrictId && teacherDistrictId !== transfer.oldDistrictId) {
        throw new ForbiddenException('Access denied to this transfer');
      }
    }
    return transfer;
  }

  async approve(
    id: string,
    teacher: TeacherWithSchool,
    notes?: string,
  ): Promise<StudentTransfer> {
    if (teacher.role !== 'district_admin') {
      throw new ForbiddenException('Only district admins can approve transfers');
    }
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    if (transfer.status !== 'pending') {
      throw new BadRequestException(`Transfer is already ${transfer.status}`);
    }
    if (transfer.newDistrictId) {
      await this.studentRepo.update(transfer.studentId, {
        districtId: transfer.newDistrictId,
      });
    }
    transfer.status = 'approved';
    transfer.approvedById = teacher.id;
    if (notes != null) transfer.notes = (transfer.notes ? transfer.notes + '\n' : '') + notes;
    await this.transferRepo.save(transfer);
    return this.findOne(id, teacher);
  }

  async reject(
    id: string,
    teacher: TeacherWithSchool,
    notes?: string,
  ): Promise<StudentTransfer> {
    if (teacher.role !== 'district_admin') {
      throw new ForbiddenException('Only district admins can reject transfers');
    }
    const transfer = await this.transferRepo.findOne({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    if (transfer.status !== 'pending') {
      throw new BadRequestException(`Transfer is already ${transfer.status}`);
    }
    transfer.status = 'rejected';
    transfer.approvedById = teacher.id;
    if (notes != null) transfer.notes = (transfer.notes ? transfer.notes + '\n' : '') + notes;
    await this.transferRepo.save(transfer);
    return this.findOne(id, teacher);
  }
}
