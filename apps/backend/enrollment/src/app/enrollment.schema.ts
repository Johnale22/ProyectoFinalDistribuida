import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema()
export class Enrollment {
  @Prop() studentName: string;
  @Prop() projectId: number;
  @Prop() projectTitle: string;
  @Prop({ default: 'PENDING' }) status: string;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);