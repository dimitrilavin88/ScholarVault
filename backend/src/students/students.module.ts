import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from '../entities/student.entity';
import { District } from '../entities/district.entity';
import { School } from '../entities/school.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Classroom } from '../entities/classroom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, District, School, Enrollment, Classroom]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
