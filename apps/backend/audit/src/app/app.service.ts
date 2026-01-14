import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
    console.log('💾 [AUDIT] Conectado a Redis');
  }

  // Guardar log (Intacto)
  async logAction(data: any) {
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({ ...data, timestamp });
    await this.redis.lpush('audit_logs', logEntry);
    console.log(`🕵️ LOG GUARDADO: ${data.action}`);
  }

  // --- OBTENER LOGS (VERSIÓN BLINDADA) ---
  async getLogs() {
    try {
      // 1. Recuperar datos crudos de Redis
      const rawLogs = await this.redis.lrange('audit_logs', 0, 100);
      
      // 2. Procesar uno por uno con seguridad
      return rawLogs.map(log => {
        try {
            return JSON.parse(log);
        } catch (e) {
            // Si falla el parseo, devolvemos un objeto de error en vez de romper todo
            return { action: 'ERROR_DE_DATOS', details: 'Dato corrupto en Redis', raw: log };
        }
      });
    } catch (error) {
      console.error("❌ Error leyendo de Redis:", error);
      // Devolver array vacío para que el Frontend no se rompa
      return []; 
    }
  }
}