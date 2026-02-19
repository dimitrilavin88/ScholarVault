import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { District } from '../entities/district.entity';
import { School } from '../entities/school.entity';
import { DistrictsController } from './districts.controller';
import { DistrictController } from './district.controller';
import { DistrictsService } from './districts.service';
import { ClassroomsModule } from '../classrooms/classrooms.module';

@Module({
  imports: [TypeOrmModule.forFeature([District, School]), ClassroomsModule],
  controllers: [DistrictsController, DistrictController],
  providers: [DistrictsService],
  exports: [DistrictsService],
})
export class DistrictsModule {}
