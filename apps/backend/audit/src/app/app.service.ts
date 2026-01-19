import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>) {}

  // Guardar un evento
  async logEvent(action: string, data: any) {
    const log = new this.auditModel({ action, data });
    return log.save();
  }

  // Obtener los últimos 50 eventos (ordenados por fecha reciente)
  async getLogs() {
    return this.auditModel.find().sort({ timestamp: -1 }).limit(50).exec();
  }
}