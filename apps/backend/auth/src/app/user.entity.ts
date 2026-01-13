import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string; // Será el correo o usuario

  @Column()
  password: string;

  @Column({ default: 'STUDENT' })
  role: string; // 'STUDENT', 'TUTOR', 'COORDINATOR'

  // --- NUEVOS CAMPOS ---
  @Column({ nullable: true })
  fullName: string; // Nombres y Apellidos

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  sector: string; // Para la geolocalización futura
}