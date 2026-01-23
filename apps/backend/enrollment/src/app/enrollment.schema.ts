import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema({ timestamps: true }) // ✅ timestamps: true agrega createdAt y updatedAt automáticos
export class Enrollment {
  // 🚨 CAMPO OBLIGATORIO: Identificador único del estudiante (ej: "admin", "u123")
  @Prop({ required: true }) 
  studentId: string; 

  @Prop() studentName: string; // Nombre legible (ej: "Juan Perez")
  @Prop() studentEmail: string; // Email del estudiante
  @Prop() projectId: number;
  @Prop() projectTitle: string;
  @Prop({ default: 'PENDING' }) status: string; // PENDING, APPROVED, REJECTED
  
  // ✅ AQUÍ SE GUARDARÁ EL LINK DE MINIO
  @Prop() reportUrl: string;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);