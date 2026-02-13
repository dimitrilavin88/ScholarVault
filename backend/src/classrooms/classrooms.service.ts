import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Classroom } from '../entities/classroom.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Student } from '../entities/student.entity';
import { Teacher } from '../entities/teacher.entity';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepo: Repository<Classroom>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  private assertTeacherOwnsClassroom(classroom: Classroom, teacherId: string): void {
    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenException('Access denied to this classroom');
    }
  }

  private assertTeacherAccessToDistrict(districtId: string, teacher: Teacher & { school?: { districtId: string } }): void {
    if (teacher.role === 'district_admin') return;
    const teacherDistrictId = teacher.school?.districtId;
    if (teacherDistrictId && teacherDistrictId !== districtId) {
      throw new ForbiddenException('Access denied to this student');
    }
  }

  async findAll(teacher: Teacher): Promise<Classroom[]> {
    const qb = this.classroomRepo
      .createQueryBuilder('classroom')
      .where('classroom.teacherId = :teacherId', { teacherId: teacher.id })
      .orderBy('classroom.name', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string, teacher: Teacher): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({ where: { id } });
    if (!classroom) throw new NotFoundException('Classroom not found');
    this.assertTeacherOwnsClassroom(classroom, teacher.id);
    return classroom;
  }

  async create(dto: CreateClassroomDto, teacher: Teacher): Promise<Classroom> {
    const classroom = this.classroomRepo.create({
      teacherId: teacher.id,
      schoolId: teacher.schoolId,
      name: dto.name.trim(),
    });
    return this.classroomRepo.save(classroom);
  }

  async update(id: string, dto: UpdateClassroomDto, teacher: Teacher): Promise<Classroom> {
    const classroom = await this.findOne(id, teacher);
    if (dto.name != null) classroom.name = dto.name.trim();
    return this.classroomRepo.save(classroom);
  }

  async remove(id: string, teacher: Teacher): Promise<void> {
    const classroom = await this.findOne(id, teacher);
    await this.classroomRepo.remove(classroom);
  }

  async getStudents(classroomId: string, teacher: Teacher): Promise<Student[]> {
    await this.findOne(classroomId, teacher);
    const enrollments = await this.enrollmentRepo.find({
      where: { classroomId },
      relations: ['student', 'student.district'],
    });
    const students = enrollments.map((e) => e.student).filter(Boolean);
    return students.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  async addStudent(classroomId: string, studentId: string, teacher: Teacher & { school?: { districtId: string } }): Promise<Enrollment> {
    const classroom = await this.findOne(classroomId, teacher);
    const student = await this.studentRepo.findOne({ where: { id: studentId }, relations: ['district'] });
    if (!student) throw new NotFoundException('Student not found');
    this.assertTeacherAccessToDistrict(student.districtId, teacher);
    const existing = await this.enrollmentRepo.findOne({ where: { classroomId, studentId } });
    if (existing) throw new ConflictException('Student is already in this class');
    const enrollment = this.enrollmentRepo.create({ classroomId, studentId });
    return this.enrollmentRepo.save(enrollment);
  }

  async removeStudent(classroomId: string, studentId: string, teacher: Teacher): Promise<void> {
    await this.findOne(classroomId, teacher);
    const enrollment = await this.enrollmentRepo.findOne({ where: { classroomId, studentId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    await this.enrollmentRepo.remove(enrollment);
  }
}
