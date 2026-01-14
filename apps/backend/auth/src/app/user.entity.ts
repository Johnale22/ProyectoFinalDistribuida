import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string; // Cédula

  @Column()
  password: string;

  @Column()
  role: string; // 'STUDENT', 'TUTOR', 'ADMIN', 'COORDINATOR'

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  faculty: string;

  @Column({ nullable: true })
  career: string;

  @Column({ nullable: true })
  semester: string;
}