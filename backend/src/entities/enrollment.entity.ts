import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Student } from './student.entity';
import { Classroom } from './classroom.entity';

@Entity('enrollments')
@Unique(['studentId', 'classroomId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'classroom_id' })
  classroomId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Classroom, (classroom) => classroom.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classroom_id' })
  classroom: Classroom;
}
