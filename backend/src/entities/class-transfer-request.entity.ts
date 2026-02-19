import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Classroom } from './classroom.entity';
import { Teacher } from './teacher.entity';

export type ClassTransferStatus = 'pending' | 'accepted' | 'rejected';

@Entity('class_transfer_requests')
export class ClassTransferRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'from_classroom_id' })
  fromClassroomId: string;

  @Column({ name: 'to_classroom_id' })
  toClassroomId: string;

  @Column({ name: 'requested_by_teacher_id' })
  requestedByTeacherId: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: ClassTransferStatus;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolved_by_teacher_id', nullable: true })
  resolvedByTeacherId: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Classroom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_classroom_id' })
  fromClassroom: Classroom;

  @ManyToOne(() => Classroom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_classroom_id' })
  toClassroom: Classroom;

  @ManyToOne(() => Teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_by_teacher_id' })
  requestedBy: Teacher;

  @ManyToOne(() => Teacher, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolved_by_teacher_id' })
  resolvedBy: Teacher | null;
}
