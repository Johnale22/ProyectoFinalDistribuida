import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text') // Tipo texto largo para descripciones detalladas
  description: string;

  @Column('int')
  max_quota: number; // Cupo máximo 

  @Column('int', { default: 0 })
  enrolled: number; // Cuántos se han inscrito
}