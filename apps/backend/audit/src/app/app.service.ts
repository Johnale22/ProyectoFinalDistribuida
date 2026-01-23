import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditDocument } from './audit.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(AuditLog.name) private auditModel: Model<AuditDocument>) {}

  // 1. Guardar un evento (Viene desde RabbitMQ)
  async logEvent(action: string, data: any) {
    console.log(`📝 [Audit] Guardando en Mongo: ${action}`);
    
    const newLog = new this.auditModel({
      action: action,
      // Intentamos sacar el usuario del payload, si no existe ponemos 'Sistema'
      user: data.user || data.studentId || data.username || 'Sistema',
      data: data.payload || data, // Guardamos el resto de datos
      ip: data.ip || 'Internal'
    });
    
    return newLog.save();
  }

  // 2. Leer historial (Para el Dashboard de Admin)
  async getLogs() {
    // Devolvemos los últimos 100 registros, ordenados del más reciente al más antiguo
    return this.auditModel.find().sort({ timestamp: -1 }).limit(100).exec();
  }
}