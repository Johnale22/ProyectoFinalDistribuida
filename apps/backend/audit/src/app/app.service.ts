import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis'; // Asegúrate de tener esto

@Injectable()
export class AppService implements OnModuleInit {
  private redis: Redis;

  onModuleInit() {
    // Conexión a Redis Local (Puerto 6379)
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
    console.log('💾 [AUDIT] Conectado a Redis correctamente');
  }

  // --- GUARDAR (Ya te funciona, pero lo reforzamos) ---
  async logEvent(action: string, data: any) {
    const logEntry = {
      id: Date.now().toString(), // ID único simple
      action,
      data,
      timestamp: new Date(),
    };
    
    // Guardamos al principio de la lista 'audit_logs'
    await this.redis.lpush('audit_logs', JSON.stringify(logEntry));
    
    // Opcional: Mantener solo los últimos 100 registros para no llenar la memoria
    await this.redis.ltrim('audit_logs', 0, 99);
    
    console.log(`🕵️ LOG GUARDADO: ${action}`);
    return logEntry;
  }

  // --- LEER (Aquí estaba el problema) ---
  async getLogs() {
    // Traer todos los registros de la lista (0 a -1)
    const rawLogs = await this.redis.lrange('audit_logs', 0, -1);
    
    // Convertir de texto JSON a Objetos reales
    return rawLogs.map((log) => JSON.parse(log));
  }
}