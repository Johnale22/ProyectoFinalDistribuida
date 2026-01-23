import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditDocument = AuditLog & Document;

// ✅ Usamos timestamps para que Mongo guarde la fecha solo
@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } }) 
export class AuditLog {
  @Prop({ required: true })
  action: string; // Ej: "USER_LOGIN", "ENROLLMENT_APPROVED"

  @Prop({ required: true })
  user: string; // Ej: "admin", "1720..."

  @Prop({ type: Object })
  data: any; // Detalles extra (JSON)

  @Prop()
  ip: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);