import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassTransferRequest } from '../entities/class-transfer-request.entity';
import { Classroom } from '../entities/classroom.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Teacher } from '../entities/teacher.entity';
import { CreateClassTransferDto } from './dto/create-class-transfer.dto';

type TeacherWithSchool = Teacher & { school?: { id: string } };

@Injectable()
export class ClassTransfersService {
  constructor(
    @InjectRepository(ClassTransferRequest)
    private readonly requestRepo: Repository<ClassTransferRequest>,
    @InjectRepository(Classroom)
    private readonly classroomRepo: Repository<Classroom>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  /** Create a class transfer request (send student to another class, or request student from another teacher). */
  async create(dto: CreateClassTransferDto, teacher: TeacherWithSchool): Promise<ClassTransferRequest> {
    if (teacher.role === 'district_admin') {
      throw new ForbiddenException('Use district transfer for cross-school moves; class transfers are for teachers within the same school.');
    }
    const fromClass = await this.classroomRepo.findOne({
      where: { id: dto.fromClassroomId },
      relations: ['school', 'teacher'],
    });
    const toClass = await this.classroomRepo.findOne({
      where: { id: dto.toClassroomId },
      relations: ['school', 'teacher'],
    });
    if (!fromClass || !toClass) throw new NotFoundException('Classroom not found');
    if (fromClass.schoolId !== toClass.schoolId) {
      throw new BadRequestException('Both classrooms must be in the same school.');
    }
    if (fromClass.id === toClass.id) {
      throw new BadRequestException('From and to classroom must be different.');
    }
    const isRequesterFromOwner = fromClass.teacherId === teacher.id;
    const isRequesterToOwner = toClass.teacherId === teacher.id;
    if (!isRequesterFromOwner && !isRequesterToOwner) {
      throw new ForbiddenException('You must be the teacher of the source or target class to create this request.');
    }
    const enrollment = await this.enrollmentRepo.findOne({
      where: { studentId: dto.studentId, classroomId: dto.fromClassroomId },
    });
    if (!enrollment) {
      throw new BadRequestException('Student is not enrolled in the source classroom.');
    }
    const existingInTo = await this.enrollmentRepo.findOne({
      where: { studentId: dto.studentId, classroomId: dto.toClassroomId },
    });
    if (existingInTo) {
      throw new ConflictException('Student is already enrolled in the target classroom.');
    }
    const existingPending = await this.requestRepo.findOne({
      where: {
        studentId: dto.studentId,
        fromClassroomId: dto.fromClassroomId,
        toClassroomId: dto.toClassroomId,
        status: 'pending',
      },
    });
    if (existingPending) throw new ConflictException('A pending request for this move already exists.');

    const request = this.requestRepo.create({
      studentId: dto.studentId,
      fromClassroomId: dto.fromClassroomId,
      toClassroomId: dto.toClassroomId,
      requestedByTeacherId: teacher.id,
      status: 'pending',
    });
    const saved = await this.requestRepo.save(request);
    return this.requestRepo.findOne({
      where: { id: saved.id },
      relations: ['student', 'fromClassroom', 'fromClassroom.teacher', 'toClassroom', 'toClassroom.teacher', 'requestedBy'],
    }) as Promise<ClassTransferRequest>;
  }

  /** Requests awaiting this teacher's acceptance (they are the "other" teacher). */
  async findPendingIncoming(teacher: TeacherWithSchool): Promise<ClassTransferRequest[]> {
    if (teacher.role === 'district_admin') return [];
    return this.requestRepo.find({
      where: { status: 'pending' },
      relations: ['student', 'fromClassroom', 'fromClassroom.teacher', 'toClassroom', 'toClassroom.teacher', 'requestedBy'],
      order: { createdAt: 'DESC' },
    }).then((list) =>
      list.filter(
        (r) =>
          r.requestedByTeacherId !== teacher.id &&
          (r.fromClassroom.teacherId === teacher.id || r.toClassroom.teacherId === teacher.id),
      ),
    );
  }

  /** Accept a class transfer: move student from source to target classroom. */
  async accept(id: string, teacher: TeacherWithSchool): Promise<ClassTransferRequest> {
    if (teacher.role === 'district_admin') throw new ForbiddenException('Only teachers can accept class transfer requests.');
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['fromClassroom', 'toClassroom', 'student'],
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'pending') {
      throw new BadRequestException(`Request is already ${request.status}.`);
    }
    const isFromOwner = request.fromClassroom.teacherId === teacher.id;
    const isToOwner = request.toClassroom.teacherId === teacher.id;
    const isResponder = isFromOwner || isToOwner;
    if (!isResponder || request.requestedByTeacherId === teacher.id) {
      throw new ForbiddenException('Only the other teacher can accept this request.');
    }
    const fromEnrollment = await this.enrollmentRepo.findOne({
      where: { studentId: request.studentId, classroomId: request.fromClassroomId },
    });
    if (!fromEnrollment) {
      throw new BadRequestException('Student is no longer in the source classroom.');
    }
    await this.enrollmentRepo.remove(fromEnrollment);
    await this.enrollmentRepo.save(
      this.enrollmentRepo.create({ studentId: request.studentId, classroomId: request.toClassroomId }),
    );
    request.status = 'accepted';
    request.resolvedAt = new Date();
    request.resolvedByTeacherId = teacher.id;
    await this.requestRepo.save(request);
    return this.requestRepo.findOne({
      where: { id },
      relations: ['student', 'fromClassroom', 'fromClassroom.teacher', 'toClassroom', 'toClassroom.teacher', 'requestedBy', 'resolvedBy'],
    }) as Promise<ClassTransferRequest>;
  }

  /** Reject a class transfer (or cancel if you are the requester). */
  async reject(id: string, teacher: TeacherWithSchool): Promise<ClassTransferRequest> {
    if (teacher.role === 'district_admin') throw new ForbiddenException('Only teachers can reject class transfer requests.');
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['fromClassroom', 'toClassroom'],
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'pending') {
      throw new BadRequestException(`Request is already ${request.status}.`);
    }
    const isRequester = request.requestedByTeacherId === teacher.id;
    const isFromOwner = request.fromClassroom.teacherId === teacher.id;
    const isToOwner = request.toClassroom.teacherId === teacher.id;
    if (!isRequester && !isFromOwner && !isToOwner) {
      throw new ForbiddenException('Only the requesting or receiving teacher can reject this request.');
    }
    request.status = 'rejected';
    request.resolvedAt = new Date();
    request.resolvedByTeacherId = teacher.id;
    await this.requestRepo.save(request);
    return this.requestRepo.findOne({
      where: { id },
      relations: ['student', 'fromClassroom', 'fromClassroom.teacher', 'toClassroom', 'toClassroom.teacher', 'requestedBy', 'resolvedBy'],
    }) as Promise<ClassTransferRequest>;
  }
}
