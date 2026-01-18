import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema()
export class Report {
  @Prop({ default: 0 })
  totalStudents: number;

  @Prop({ default: 0 })
  totalProjects: number;

  @Prop({ default: 0 })
  approvedEnrollments: number;

  @Prop({ type: Object, default: {} })
  projectsByFaculty: Record<string, number>;
}

export const ReportSchema = SchemaFactory.createForClass(Report);