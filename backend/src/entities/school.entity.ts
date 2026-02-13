import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { District } from './district.entity';
import { Teacher } from './teacher.entity';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'district_id' })
  districtId: string;

  @Column()
  name: string;

  @ManyToOne(() => District, (district) => district.schools, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'district_id' })
  district: District;

  @OneToMany(() => Teacher, (teacher) => teacher.school)
  teachers: Teacher[];
}
