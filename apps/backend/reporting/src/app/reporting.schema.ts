import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

// Definimos solo lo que necesitamos leer para el reporte
@Schema({ collection: 'enrollments' }) // <--- IMPORTANTE: Apuntamos a la colección existente
export class Enrollment {
  @Prop()
  projectTitle: string;
  
  @Prop()
  status: string;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);