import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema()
export class Enrollment {
  @Prop({ required: true })
  studentName: string;

  @Prop({ required: true })
  projectTitle: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ default: 'PENDIENTE' }) // Estado para que el Tutor apruebe luego
  status: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);