import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema()
export class Report {
  @Prop({ default: 'GLOBAL_STATS' }) // Usaremos un solo ID para estadísticas globales
  type: string;

  @Prop({ default: 0 })
  totalStudents: number;

  @Prop({ default: 0 })
  totalProjects: number;

  @Prop({ default: 0 })
  totalEnrollments: number; // Aprobados

  @Prop({ default: 0 })
  totalHours: number; // Horas convalidadas
}

export const ReportSchema = SchemaFactory.createForClass(Report);