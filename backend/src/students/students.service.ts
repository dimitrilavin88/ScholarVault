import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Teacher } from '../entities/teacher.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async findAll(teacher: Teacher & { school?: { districtId: string } }): Promise<Student[]> {
    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.district', 'district')
      .orderBy('student.last_name', 'ASC');
    if (teacher.role === 'teacher' || teacher.role === 'admin') {
      const districtId = teacher.school?.districtId;
      if (districtId) {
        qb.andWhere('student.districtId = :districtId', { districtId });
      }
    }
    return qb.getMany();
  }

  async findOne(id: string, teacher: Teacher & { school?: { districtId: string } }): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['district', 'parents', 'records'],
    });
    if (!student) throw new NotFoundException('Student not found');
    this.assertAccess(student.districtId, teacher);
    return student;
  }

  assertAccess(districtId: string, teacher: Teacher & { school?: { districtId: string } }): void {
    if (teacher.role === 'district_admin') return;
    if (teacher.role === 'admin' || teacher.role === 'teacher') {
      const teacherDistrictId = teacher.school?.districtId;
      if (teacherDistrictId && teacherDistrictId !== districtId) {
        throw new ForbiddenException('Access denied to this district');
      }
      return;
    }
    throw new ForbiddenException('Access denied');
  }
}
