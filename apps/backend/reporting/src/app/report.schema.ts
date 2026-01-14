import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;

@Schema()
export class Report {
  @Prop({ required: true })
  projectTitle: string;

  @Prop({ default: 0 })
  approvedCount: number;

  @Prop()
  lastUpdated: Date;
}
export const ReportSchema = SchemaFactory.createForClass(Report);