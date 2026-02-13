import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { School } from './school.entity';

export type TeacherRole = 'teacher' | 'admin' | 'district_admin';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id' })
  schoolId: string;

  @Column()
  email: string;

  @Column({ type: 'varchar', length: 32 })
  role: TeacherRole;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @ManyToOne(() => School, (school) => school.teachers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;
}
