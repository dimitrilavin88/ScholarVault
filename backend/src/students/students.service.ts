import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Teacher } from '../entities/teacher.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Classroom } from '../entities/classroom.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async findAll(teacher: Teacher & { school?: { districtId: string } }): Promise<Student[]> {
    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.district', 'district')
      .orderBy('student.last_name', 'ASC');
    const districtId = teacher.school?.districtId;
    if (teacher.role === 'teacher') {
      // Teachers only see students enrolled in at least one of their classrooms
      qb.innerJoin('enrollments', 'e', 'e.student_id = student.id')
        .innerJoin('classrooms', 'c', 'c.id = e.classroom_id')
        .andWhere('c.teacher_id = :teacherId', { teacherId: teacher.id })
        .distinct(true);
    } else if (teacher.role === 'admin') {
      if (districtId) qb.andWhere('student.districtId = :districtId', { districtId });
    } else if (teacher.role === 'district_admin') {
      if (districtId) qb.andWhere('student.districtId = :districtId', { districtId });
    }
    const list = await qb.getMany();
    // Return plain objects with explicit districtId so JSON response always includes it
    return list.map((s) => ({
      id: s.id,
      districtId: s.districtId ?? s.district?.id ?? '',
      firstName: s.firstName,
      lastName: s.lastName,
      dob: s.dob,
      uniqueStudentIdentifier: s.uniqueStudentIdentifier,
      district: s.district
        ? { id: s.district.id, name: s.district.name, state: s.district.state }
        : undefined,
    })) as Student[];
  }

  async findOne(id: string, teacher: Teacher & { school?: { districtId: string } }): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['district', 'parents', 'records'],
    });
    if (!student) throw new NotFoundException('Student not found');
    if (teacher.role === 'teacher') {
      const inMyClass = await this.enrollmentRepo
        .createQueryBuilder('e')
        .innerJoin('e.classroom', 'c')
        .where('e.student_id = :studentId', { studentId: id })
        .andWhere('c.teacher_id = :teacherId', { teacherId: teacher.id })
        .getOne();
      if (!inMyClass) throw new ForbiddenException('Access denied to this student');
    } else {
      this.assertAccess(student.districtId ?? student.district?.id ?? '', teacher);
    }
    // Return plain object with explicit districtId so API always includes it
    return {
      ...student,
      districtId: student.districtId ?? student.district?.id ?? '',
    } as Student;
  }

  assertAccess(districtId: string, teacher: Teacher & { school?: { districtId: string } }): void {
    if (teacher.role === 'district_admin') {
      const teacherDistrictId = teacher.school?.districtId;
      if (teacherDistrictId && teacherDistrictId !== districtId) {
        throw new ForbiddenException('Access denied to this district');
      }
      return;
    }
    if (teacher.role === 'admin') {
      const teacherDistrictId = teacher.school?.districtId;
      if (teacherDistrictId && teacherDistrictId !== districtId) {
        throw new ForbiddenException('Access denied to this district');
      }
      return;
    }
    // teacher role: access is enforced in findOne via enrollment check
    if (teacher.role === 'teacher') return;
    throw new ForbiddenException('Access denied');
  }

  async update(
    id: string,
    dto: { firstName?: string; lastName?: string; dob?: string; uniqueStudentIdentifier?: string },
    teacher: Teacher & { school?: { districtId: string }; role?: string },
  ): Promise<Student> {
    if (teacher.role === 'teacher') {
      throw new ForbiddenException('Only admins and district admins can update student information');
    }
    const student = await this.findOne(id, teacher);
    if (dto.firstName != null) student.firstName = dto.firstName.trim();
    if (dto.lastName != null) student.lastName = dto.lastName.trim();
    if (dto.dob != null) student.dob = dto.dob;
    if (dto.uniqueStudentIdentifier != null) student.uniqueStudentIdentifier = dto.uniqueStudentIdentifier.trim();
    return this.studentRepo.save(student);
  }

  /** Classrooms this student is enrolled in (for placement management). */
  async getStudentClassrooms(
    studentId: string,
    teacher: Teacher & { school?: { districtId: string } },
  ): Promise<Classroom[]> {
    const student = await this.findOne(studentId, teacher);
    const enrollments = await this.enrollmentRepo.find({
      where: { studentId: student.id },
      relations: ['classroom', 'classroom.school', 'classroom.teacher'],
    });
    return enrollments.map((e) => e.classroom).filter(Boolean);
  }
}
