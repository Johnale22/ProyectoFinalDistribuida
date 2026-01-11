import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Agreement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organization: string; // Nombre de la empresa/comunidad

  @Column()
  representative: string; // Representante legal

  @Column({ default: true })
  active: boolean; // ¿Está vigente?
  
  @Column({ type: 'date' })
  valid_until: string; // Fecha de caducidad
}