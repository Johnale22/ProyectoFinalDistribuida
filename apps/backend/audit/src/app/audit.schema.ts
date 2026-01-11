import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema()
export class AuditLog {
  @Prop({ required: true })
  action: string;      // Ej: "INSCRIPCION_CREADA"

  @Prop({ type: Object })
  data: any;           // Guardamos todos los datos que llegaron

  @Prop({ default: Date.now })
  timestamp: Date;     // Cuándo ocurrió
}

export const AuditSchema = SchemaFactory.createForClass(AuditLog);