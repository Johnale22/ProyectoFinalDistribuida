import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema()
export class AuditLog {
  @Prop({ required: true })
  action: string; // Ej: "USER_LOGIN", "ENROLLMENT_APPROVED"

  @Prop({ type: Object })
  data: any; // Datos del evento (JSON)

  @Prop({ default: Date.now })
  timestamp: Date; // Cuándo ocurrió
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);