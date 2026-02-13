import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentTransfer } from '../entities/student-transfer.entity';
import { Student } from '../entities/student.entity';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentTransfer, Student]),
    CommonModule,
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
