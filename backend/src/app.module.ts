import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import * as multer from 'multer';
import { StudentsModule } from './students/students.module';
import { RecordsModule } from './records/records.module';
import { CommonModule } from './common/common.module';
import { District } from './entities/district.entity';
import { School } from './entities/school.entity';
import { Teacher } from './entities/teacher.entity';
import { Student } from './entities/student.entity';
import { Parent } from './entities/parent.entity';
import { Record } from './entities/record.entity';
import { Classroom } from './entities/classroom.entity';
import { Enrollment } from './entities/enrollment.entity';
import { StudentTransfer } from './entities/student-transfer.entity';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { TransfersModule } from './transfers/transfers.module';
import { DistrictsModule } from './districts/districts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MulterModule.register({ storage: multer.memoryStorage() }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'scholarvault',
      entities: [District, School, Teacher, Student, Parent, Record, Classroom, Enrollment, StudentTransfer],
      // Use schema from database/schema.sql (Docker or manual). Set DB_SYNCHRONIZE=true only on empty DB.
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
    }),
    TypeOrmModule.forFeature([District, School, Teacher, Student, Parent, Record, Classroom, Enrollment, StudentTransfer]),
    CommonModule,
    AuthModule,
    StudentsModule,
    RecordsModule,
    ClassroomsModule,
    TransfersModule,
    DistrictsModule,
  ],
})
export class AppModule {}
