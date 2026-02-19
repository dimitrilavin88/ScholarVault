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

  async findAll(teacher: Teacher & { school?: { districtId: string } }): Promise<Classroom[]> {
    if (teacher.role === 'district_admin') {
      const districtId = teacher.school?.districtId;
      if (!districtId) return [];
      return this.classroomRepo.find({
        where: { school: { districtId } },
        relations: ['school', 'teacher'],
        order: { name: 'ASC' },
      });
    }
    return this.classroomRepo.find({
      where: { teacherId: teacher.id },
      order: { name: 'ASC' },
    });
  }

  /** All classrooms in the teacher's school (for class transfer dropdown). */
  async findClassroomsInMySchool(teacher: Teacher & { schoolId?: string }): Promise<Classroom[]> {
    if (!teacher.schoolId) return [];
    return this.classroomRepo.find({
      where: { schoolId: teacher.schoolId },
      relations: ['teacher', 'school'],
      order: { gradeLevel: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string, teacher: Teacher & { school?: { districtId: string } }): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!classroom) throw new NotFoundException('Classroom not found');
    if (teacher.role === 'district_admin') {
      const districtId = teacher.school?.districtId;
      if (districtId && classroom.school?.districtId !== districtId) {
        throw new ForbiddenException('Access denied to this classroom');
      }
      return classroom;
    }
    this.assertTeacherOwnsClassroom(classroom, teacher.id);
    return classroom;
  }

  async create(dto: CreateClassroomDto, teacher: Teacher & { role?: string }): Promise<Classroom> {
    if (teacher.role === 'district_admin') {
      throw new ForbiddenException('District admins cannot create classrooms');
    }
    const classroom = this.classroomRepo.create({
      teacherId: teacher.id,
      schoolId: teacher.schoolId,
      name: dto.name.trim(),
      gradeLevel: dto.gradeLevel?.trim() || null,
      isHomeroom: dto.isHomeroom ?? false,
    });
    return this.classroomRepo.save(classroom);
  }

  async update(id: string, dto: UpdateClassroomDto, teacher: Teacher & { role?: string }): Promise<Classroom> {
    if (teacher.role === 'district_admin') {
      throw new ForbiddenException('District admins cannot edit classrooms');
    }
    const classroom = await this.findOne(id, teacher);
    if (dto.name != null) classroom.name = dto.name.trim();
    if (dto.gradeLevel !== undefined) classroom.gradeLevel = dto.gradeLevel?.trim() || null;
    if (dto.isHomeroom !== undefined) classroom.isHomeroom = dto.isHomeroom;
    return this.classroomRepo.save(classroom);
  }

  async remove(id: string, teacher: Teacher & { role?: string }): Promise<void> {
    if (teacher.role === 'district_admin') {
      throw new ForbiddenException('District admins cannot delete classrooms');
    }
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

  /** Remove a student from a classroom (deletes enrollment). If that was their only class in the district,
   * they will appear in the district admin's "Pending class enrollment" list until assigned to a new class. */
  async removeStudent(classroomId: string, studentId: string, teacher: Teacher): Promise<void> {
    await this.findOne(classroomId, teacher);
    const enrollment = await this.enrollmentRepo.findOne({ where: { classroomId, studentId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    await this.enrollmentRepo.remove(enrollment);
  }

  /** Distinct grade levels for a school (for district admin browse). */
  async getGradeLevelsForSchool(schoolId: string): Promise<string[]> {
    const rows = await this.classroomRepo
      .createQueryBuilder('c')
      .select('DISTINCT c.grade_level', 'gradeLevel')
      .where('c.school_id = :schoolId', { schoolId })
      .andWhere('c.grade_level IS NOT NULL')
      .orderBy('c.grade_level', 'ASC')
      .getRawMany<{ gradeLevel: string }>();
    return rows.map((r) => r.gradeLevel).filter(Boolean);
  }

  /** Students in the district who have no enrollment in any classroom in that district (pending class assignment).
   * Includes students who were removed from a class by a teacher or who arrived via transfer and haven't been placed yet. */
  async getUnenrolledStudentsInDistrict(districtId: string): Promise<Student[]> {
    const enrolledRows = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('DISTINCT e.student_id')
      .innerJoin('e.classroom', 'c')
      .innerJoin('c.school', 's')
      .where('s.district_id = :districtId', { districtId })
      .getRawMany<{ e_student_id: string }>();
    const enrolledIds = enrolledRows.map((r) => r.e_student_id);
    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.district', 'district')
      .where('student.district_id = :districtId', { districtId })
      .orderBy('student.last_name', 'ASC')
      .addOrderBy('student.first_name', 'ASC');
    if (enrolledIds.length > 0) {
      qb.andWhere('student.id NOT IN (:...enrolledIds)', { enrolledIds });
    }
    const list = await qb.getMany();
    return list.map((s) => ({
      id: s.id,
      districtId: s.districtId ?? s.district?.id ?? '',
      firstName: s.firstName,
      lastName: s.lastName,
      dob: s.dob,
      uniqueStudentIdentifier: s.uniqueStudentIdentifier,
      district: s.district ? { id: s.district.id, name: s.district.name, state: s.district.state } : undefined,
    })) as Student[];
  }

  /** Homerooms at a given grade in a school: one { teacher, classroom } per teacher (homeroom preferred). */
  async getHomeroomsForGrade(schoolId: string, gradeLevel: string): Promise<{ teacher: { id: string; email: string; firstName: string | null; lastName: string | null }; classroom: { id: string; name: string } }[]> {
    const classrooms = await this.classroomRepo.find({
      where: { schoolId, gradeLevel },
      relations: ['teacher'],
      order: { isHomeroom: 'DESC', name: 'ASC' },
    });
    const byTeacher = new Map<string, { teacher: { id: string; email: string; firstName: string | null; lastName: string | null }; classroom: { id: string; name: string } }>();
    for (const c of classrooms) {
      if (!byTeacher.has(c.teacherId)) {
        byTeacher.set(c.teacherId, {
          teacher: { id: c.teacher.id, email: c.teacher.email, firstName: c.teacher.firstName ?? null, lastName: c.teacher.lastName ?? null },
          classroom: { id: c.id, name: c.name },
        });
      }
    }
    return Array.from(byTeacher.values());
  }
}
