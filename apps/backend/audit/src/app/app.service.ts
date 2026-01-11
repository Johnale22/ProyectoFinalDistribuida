import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>) {}

  // 1. Guardar evento (Viene de RabbitMQ)
  async logEvent(action: string, data: any) {
    const newLog = new this.auditModel({ action, data });
    return newLog.save();
  }

  // 2. Leer historial (Para el Coordinador)
  async getAuditHistory() {
    // Devolvemos los últimos 50 eventos, ordenados por fecha
    return this.auditModel.find().sort({ timestamp: -1 }).limit(50).exec();
  }
}