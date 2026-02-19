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
    const isInbound = dto.requestType === 'inbound';
    const teacherDistrictId = teacher.school?.districtId;

    let studentId: string;
    let oldDistrictId: string;
    let newDistrictId: string | null;
    let oldSchoolId: string | null = dto.oldSchoolId ?? null;
    let newSchoolId: string | null = dto.newSchoolId ?? null;

    if (isInbound) {
      if (!dto.uniqueStudentIdentifier?.trim() || !dto.dob) {
        throw new BadRequestException('Inbound request requires uniqueStudentIdentifier and dob');
      }
      if (!teacherDistrictId) {
        throw new ForbiddenException('Your account is not associated with a district');
      }
      const student = await this.studentRepo.findOne({
        where: {
          districtId: dto.oldDistrictId,
          uniqueStudentIdentifier: dto.uniqueStudentIdentifier.trim(),
        },
        relations: ['district'],
      });
      if (!student) throw new NotFoundException('Student not found in that district with that ID');
      if (student.dob !== dto.dob) {
        throw new BadRequestException('Date of birth does not match student record');
      }
      if (student.districtId === teacherDistrictId) {
        throw new BadRequestException('Student is already in your district');
      }
      studentId = student.id;
      oldDistrictId = dto.oldDistrictId;
      newDistrictId = teacherDistrictId;
    } else {
      const student = await this.studentRepo.findOne({
        where: { id: dto.studentId! },
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
        if (teacherDistrictId && teacherDistrictId !== dto.oldDistrictId) {
          throw new ForbiddenException('You can only request transfers for students in your district');
        }
      }
      studentId = student.id;
      oldDistrictId = dto.oldDistrictId;
      newDistrictId = dto.newDistrictId ?? null;
    }

    const transfer = this.transferRepo.create({
      studentId,
      oldDistrictId,
      newDistrictId,
      oldSchoolId,
      newSchoolId,
      requestedById: teacher.id,
      status: 'pending_release',
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

  /** Transfers awaiting this district's release (sending district, step 1). */
  async findForRelease(teacher: TeacherWithSchool): Promise<StudentTransfer[]> {
    if (teacher.role !== 'district_admin') {
      throw new ForbiddenException('Only district admins can view the transfer approval dashboard');
    }
    const districtId = teacher.school?.districtId;
    if (!districtId) return [];
    return this.transferRepo.find({
      where: { status: 'pending_release', oldDistrictId: districtId },
      relations: ['student', 'oldDistrict', 'newDistrict', 'oldSchool', 'newSchool', 'requestedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Transfers awaiting this district's acceptance (receiving district, step 2). */
  async findForAccept(teacher: TeacherWithSchool): Promise<StudentTransfer[]> {
    if (teacher.role !== 'district_admin') {
      throw new ForbiddenException('Only district admins can view the transfer approval dashboard');
    }
    const districtId = teacher.school?.districtId;
    if (!districtId) return [];
    return this.transferRepo.find({
      where: { status: 'released', newDistrictId: districtId },
      relations: ['student', 'oldDistrict', 'newDistrict', 'oldSchool', 'newSchool', 'requestedBy', 'releasedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, teacher: TeacherWithSchool): Promise<StudentTransfer> {
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: ['student', 'oldDistrict', 'newDistrict', 'oldSchool', 'newSchool', 'requestedBy', 'approvedBy', 'releasedBy'],
    });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    if (teacher.role !== 'district_admin') {
      const teacherDistrictId = teacher.school?.districtId;
      const canAccess =
        teacherDistrictId &&
        (teacherDistrictId === transfer.oldDistrictId || teacherDistrictId === transfer.newDistrictId);
      if (!canAccess) {
        throw new ForbiddenException('Access denied to this transfer');
      }
    }
    return transfer;
  }

  /** Sending district admin releases the student (step 1). */
  async release(id: string, teacher: TeacherWithSchool, notes?: string): Promise<StudentTransfer> {
    if (teacher.role !== 'district_admin') {
      throw new ForbiddenException('Only district admins can release transfers');
    }
    const districtId = teacher.school?.districtId;
    if (!districtId) throw new ForbiddenException('Your account is not associated with a district');
    const transfer = await this.transferRepo.findOne({ where: { id }, relations: ['student'] });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    if (transfer.status !== 'pending_release') {
      throw new BadRequestException(`Transfer cannot be released (status: ${transfer.status})`);
    }
    if (transfer.oldDistrictId !== districtId) {
      throw new ForbiddenException('Only the sending district can release this transfer');
    }
    transfer.status = 'released';
    transfer.releasedById = teacher.id;
    if (notes != null) transfer.notes = (transfer.notes ? transfer.notes + '\n' : '') + notes;
    await this.transferRepo.save(transfer);
    return this.findOne(id, teacher);
  }

  /** Receiving district admin accepts the student (step 2); moves student to new district. */
  async accept(
    id: string,
    teacher: TeacherWithSchool,
    notes?: string,
  ): Promise<StudentTransfer> {
    if (teacher.role !== 'district_admin') {
      throw new ForbiddenException('Only district admins can accept transfers');
    }
    const districtId = teacher.school?.districtId;
    if (!districtId) throw new ForbiddenException('Your account is not associated with a district');
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    if (transfer.status !== 'released') {
      throw new BadRequestException(`Transfer cannot be accepted (status: ${transfer.status})`);
    }
    if (transfer.newDistrictId !== districtId) {
      throw new ForbiddenException('Only the receiving district can accept this transfer');
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

  /** Either district admin can reject (sending from pending_release, receiving from pending_release or released). */
  async reject(
    id: string,
    teacher: TeacherWithSchool,
    notes?: string,
  ): Promise<StudentTransfer> {
    if (teacher.role !== 'district_admin') {
      throw new ForbiddenException('Only district admins can reject transfers');
    }
    const districtId = teacher.school?.districtId;
    if (!districtId) throw new ForbiddenException('Your account is not associated with a district');
    const transfer = await this.transferRepo.findOne({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    if (transfer.status !== 'pending_release' && transfer.status !== 'released') {
      throw new BadRequestException(`Transfer is already ${transfer.status}`);
    }
    const isSending = transfer.oldDistrictId === districtId;
    const isReceiving = transfer.newDistrictId === districtId;
    if (!isSending && !isReceiving) {
      throw new ForbiddenException('Only the sending or receiving district can reject this transfer');
    }
    transfer.status = 'rejected';
    transfer.approvedById = teacher.id;
    if (notes != null) transfer.notes = (transfer.notes ? transfer.notes + '\n' : '') + notes;
    await this.transferRepo.save(transfer);
    return this.findOne(id, teacher);
  }
}
