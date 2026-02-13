import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { School } from './school.entity';
import { Student } from './student.entity';

@Entity('districts')
export class District {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @OneToMany(() => School, (school) => school.district)
  schools: School[];

  @OneToMany(() => Student, (student) => student.district)
  students: Student[];
}
