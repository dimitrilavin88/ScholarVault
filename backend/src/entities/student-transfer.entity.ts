import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { District } from './district.entity';
import { School } from './school.entity';
import { Teacher } from './teacher.entity';

export type TransferStatus = 'pending' | 'approved' | 'rejected';

@Entity('student_transfers')
export class StudentTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'old_district_id' })
  oldDistrictId: string;

  @Column({ name: 'new_district_id', nullable: true })
  newDistrictId: string | null;

  @Column({ name: 'old_school_id', nullable: true })
  oldSchoolId: string | null;

  @Column({ name: 'new_school_id', nullable: true })
  newSchoolId: string | null;

  @Column({ name: 'requested_by' })
  requestedById: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedById: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: TransferStatus;

  @Column({ name: 'proof_file_url', type: 'varchar', length: 1024, nullable: true })
  proofFileUrl: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => District, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'old_district_id' })
  oldDistrict: District;

  @ManyToOne(() => District, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'new_district_id' })
  newDistrict: District | null;

  @ManyToOne(() => School, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'old_school_id' })
  oldSchool: School | null;

  @ManyToOne(() => School, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'new_school_id' })
  newSchool: School | null;

  @ManyToOne(() => Teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_by' })
  requestedBy: Teacher;

  @ManyToOne(() => Teacher, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: Teacher | null;
}
