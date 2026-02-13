import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { District } from './district.entity';
import { Parent } from './parent.entity';
import { Record } from './record.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'district_id' })
  districtId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'date' })
  dob: string;

  @Column({ name: 'unique_student_identifier', unique: true })
  uniqueStudentIdentifier: string;

  @ManyToOne(() => District, (district) => district.students, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'district_id' })
  district: District;

  @OneToMany(() => Parent, (parent) => parent.student)
  parents: Parent[];

  @OneToMany(() => Record, (record) => record.student)
  records: Record[];
}
