import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassTransferRequest } from '../entities/class-transfer-request.entity';
import { Classroom } from '../entities/classroom.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { ClassTransfersService } from './class-transfers.service';
import { ClassTransfersController } from './class-transfers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassTransferRequest, Classroom, Enrollment]),
  ],
  controllers: [ClassTransfersController],
  providers: [ClassTransfersService],
  exports: [ClassTransfersService],
})
export class ClassTransfersModule {}
